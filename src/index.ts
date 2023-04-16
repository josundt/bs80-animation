import { Gradient } from "./assets/gradient.js";
import { Logo } from "./assets/logo.js";
import { PerspectiveGrid } from "./assets/perspective-grid.js";
import { StarField } from "./assets/star-field.js";
import type { Size } from "./lib/abstractions.js";
import { FrameAnimation } from "./lib/frame-animation.js";
import { Timing } from "./lib/timing.js";


class Bs80Animation {
    constructor(containerOrSelector?: HTMLElement | string) {
        let container: HTMLElement | null;
        if (containerOrSelector) {
            container = typeof containerOrSelector === "string" ? document.querySelector<HTMLElement>(containerOrSelector) : containerOrSelector;
        } else {
            container = document.body;
        }
        if (!container) {
            throw new Error("Invali container argument");
        }
        this.container = container;
    }

    private readonly container: HTMLElement;

    private appendCanvas(width: number, height: number): CanvasRenderingContext2D {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        this.container.appendChild(canvas);
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        return ctx;
    }

    private getContainerSize(): Size {
        return [window.innerWidth, window.innerHeight];
    }

    async start(): Promise<void> {

        let [w, h] = this.getContainerSize();

        const ctx = this.appendCanvas(w, h);

        const starField = new StarField({
            size: [w, h],
            patternSize: [800, 800],
            starCount: 360,
            maxStarSize: (w / 2 + h / 2) / 900,
            color: "rgb(255 255 255 / .6)"
        });
        const renderStarFieldFrame = starField.createAnimationFrameRenderer(ctx, {
            rotateDegPerSecond: -3,
            rotateCenterFactors: [0.5, 0.65]
        });

        const pGrid = new PerspectiveGrid({
            // size: [960, 540]
            size: [w, h],
            viewDistance: 23,
            gridSize: 20,
            angle: 285,
            fieldOfView: h / 2,
            lineWidth: h / 400
        });
        const renderGridFrame = pGrid.createAnimationFrameRenderer(ctx, {
            horStrokeStyle: "rgb(97 161 172 / .42)",
            verStrokeStyle: "rgb(255 255 255 / .15)",
            gridRowsPerSecond: 3,
            rotateDegPerSecond: 0,
            skipClear: true
        });


        const logo = await new Logo({
            url: "./images/bare_saa_80_logo_nobg.svg",
            size: [w, h]
        }).initAsync();
        const renderLogoFrame = logo.createAnimationFrameRenderer(ctx);


        window.addEventListener("resize", () => {
            Timing.debounce(() => {
                const size = this.getContainerSize();
                [w, h] = pGrid.size = logo.size = starField.size = [ctx.canvas.width, ctx.canvas.height] = size;
                pGrid.fieldOfView = h / 2;
                pGrid.lineWidth = h / 400;
            }, 250);
        });


        const logoAnimationStartTime = 3_000;

        const animation = new FrameAnimation(time => {

            let hasMoreFrames = true;

            // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Render opaque background gradient
            Gradient.render(ctx, false, 0, 0, w, h);

            hasMoreFrames = renderStarFieldFrame(time);

            // Position and render bottom grid
            ctx.save();
            ctx.translate(0, h / 4.25);
            hasMoreFrames = renderGridFrame(time);
            ctx.restore();

            // Rotate, position and render top grid
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.translate(-w, h * -1.06);
            hasMoreFrames = renderGridFrame(time);
            ctx.restore();

            // Render partly transparent overlay gradient
            Gradient.render(ctx, true, 0, 0, w, h);

            if (time > logoAnimationStartTime) {
                renderLogoFrame(time - logoAnimationStartTime);
            }

            return hasMoreFrames;

        });

        animation.start();
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
new Bs80Animation().start();

