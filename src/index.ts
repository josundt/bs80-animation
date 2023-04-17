import { BgGradient } from "./assets/bg-gradient.js";
import { FogGradient } from "./assets/fog-gradient.js";
import { Logo } from "./assets/logo.js";
import { PerspectiveGrid } from "./assets/perspective-grid.js";
import { StarField } from "./assets/star-field.js";
import type { Size } from "./lib/abstractions.js";
import { FrameAnimation } from "./lib/frame-animation.js";
import { Timing } from "./lib/timing.js";


class Bs80Animation {

    constructor(containerOrSelector: HTMLElement | string, ...size: Size) {
        const container = typeof containerOrSelector === "string" ? document.querySelector<HTMLElement>(containerOrSelector) : containerOrSelector;
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

        const bgGradient = new BgGradient();
        const fogGradient = new FogGradient();

        const starField = new StarField({
            size: [w, h],
            patternSizeFactor: 0.5,
            starCount: 360,
            starScaling: 1,
            color: "rgb(255 255 255 / .6)"
        });
        const renderStarFieldFrame = starField.createAnimationFrameRenderer(ctx, {
            rotateDegPerSecond: -3,
            rotateCenterFactors: [0.5, 0.65]
        });

        const pGrid = new PerspectiveGrid({
            // size: [960, 540]
            size: [w, h],
            viewDistance: 28,
            gridSize: 25,
            angle: 285,
            fieldOfView: h / 2,
            lineScaling: 1
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
            Timing.debounce(async () => {
                await Timing.delayAsync(200);
                const size = this.getContainerSize();
                [w, h] = pGrid.size = logo.size = starField.size = [ctx.canvas.width, ctx.canvas.height] = size;
                pGrid.fieldOfView = h / 2;
            }, 250);
        });


        const logoAnimationStartTime = 3_000;

        const animation = new FrameAnimation(time => {

            let hasMoreFrames = true;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Render opaque background gradient
            bgGradient.render(ctx, false, 0, 0, w, h);

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
            //bgGradient.render(ctx, true, 0, 0, w, h);
            fogGradient.render(ctx, true, 0, 0, w, h);

            if (time > logoAnimationStartTime) {
                renderLogoFrame(time - logoAnimationStartTime);
            }

            return hasMoreFrames;

        });

        animation.start();
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
new Bs80Animation(document.body, window.innerWidth, window.innerHeight).start();

