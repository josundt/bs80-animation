import { Gradient } from "./assets/gradient.js";
import { Logo } from "./assets/logo.js";
import { PerspectiveGrid, type PerspectiveGridAnimationOptions } from "./assets/perspective-grid.js";
import { StarField, type StarFieldAnimationOptions } from "./assets/star-field.js";
import type { Size } from "./lib/abstractions.js";
import { FrameAnimation } from "./lib/frame-animation.js";
import { Timing } from "./lib/timing.js";

class Bs80Animation {

    private appendCanvas(width: number, height: number, parent: HTMLElement = document.body): CanvasRenderingContext2D {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        return ctx;
    }

    private getWindowSize(): Size {
        return [window.innerWidth, window.innerHeight];
    }

    async start(): Promise<void> {
        let [w, h] = this.getWindowSize();

        const pGrid = new PerspectiveGrid({
            // size: [960, 540]
            size: [w, h],
            viewDistance: 23,
            gridSize: 20,
            angle: 285,
            fieldOfView: h / 2,
            lineWidth: h / 400
        });

        const pGridAnimationOptions: PerspectiveGridAnimationOptions = {
            horStrokeStyle: "rgb(97 161 172 / .42)",
            verStrokeStyle: "rgb(255 255 255 / .15)",
            gridRowsPerSecond: 3,
            rotateDegPerSecond: 0,
            skipClear: true
        };

        const logo = new Logo({
            url: "./images/bare_saa_80_logo_nobg.svg",
            size: [w, h]
        });
        await logo.initAsync();

        const starFieldAnimationOptions: StarFieldAnimationOptions = {
            rotateDegPerSecond: 5
        };

        const starField = new StarField({
            starCount: 1000,
            maxStarSize: Math.max(w, h) / 1000,
            size: [w, h],
            color: "rgb(255 255 255 / .6)"
        });

        const ctx = this.appendCanvas(w, h);

        window.addEventListener("resize", () => {
            Timing.debounce(() => {
                const size = this.getWindowSize();
                [w, h] = pGrid.size = logo.size = starField.size = [ctx.canvas.width, ctx.canvas.height] = size;
                pGrid.fieldOfView = h / 2;
                pGrid.lineWidth = h / 400;
            }, 250);
        });

        const renderGridFrame = pGrid.createAnimationFrameRenderer(ctx, pGridAnimationOptions);
        const renderLogoFrame = logo.createAnimationFrameRenderer(ctx);
        const renderStarFieldFrame = starField.createAnimationFrameRenderer(ctx, starFieldAnimationOptions);

        const logoAnimationStartTime = 3_000;

        const animation = new FrameAnimation(time => {

            let keepRunning = true;

            // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Render opaque background gradient
            Gradient.render(ctx, false, 0, 0, w, h);

            keepRunning = renderStarFieldFrame(time);

            // Position and render bottom grid
            ctx.save();
            ctx.translate(0, h / 4.25);
            keepRunning = renderGridFrame(time);
            ctx.restore();

            // Rotate, position and render top grid
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.translate(-w, h * -1.06);
            keepRunning = renderGridFrame(time);
            ctx.restore();

            // Render partly transparent overlay gradient
            Gradient.render(ctx, true, 0, 0, w, h);

            if (time > logoAnimationStartTime) {
                renderLogoFrame(time - logoAnimationStartTime);
            }

            return keepRunning;

        });

        animation.start();
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
new Bs80Animation().start();

