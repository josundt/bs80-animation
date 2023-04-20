import { BgGradient } from "./assets/bg-gradient.js";
import { Logo } from "./assets/logo.js";
import { PerspectiveGrid } from "./assets/perspective-grid.js";
import { ShadowGradient } from "./assets/shadow-gradient.js";
import { Starfield } from "./assets/starfield.js";
import type { Size } from "./lib/abstractions.js";
import { FrameAnimation } from "./lib/frame-animation.js";
import type { ILinearGradient } from "./lib/linear-gradient.js";
import { Timing } from "./lib/timing.js";

interface Bs80Assets {
    bg: ILinearGradient;
    starField: Starfield //IAnimationFrameRenderer<[StarFieldAnimationOptions]>;
    grid: PerspectiveGrid //IAnimationFrameRenderer<[PerspectiveGridAnimationOptions]>;
    shadow: ILinearGradient;
    logo: Logo //IAsyncAnimationFrameRenderer;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const IS_DEVELOPMENT: boolean | undefined;
if (IS_DEVELOPMENT) {
    import("./live-reload.js");
}

class Bs80Animation {

    constructor(containerOrSelector: HTMLElement | string, ...size: Size) {

        const container = typeof containerOrSelector === "string" ? document.querySelector<HTMLElement>(containerOrSelector) : containerOrSelector;
        if (!container) {
            throw new Error("Invali container argument");
        }
        this.container = container;

        const [w, h] = this.size = this.getContainerSize();

        this.ctx = this.appendCanvas(...this.size);

        this.assets = {
            bg: new BgGradient(),
            shadow: new ShadowGradient(),
            starField: new Starfield({
                size: this.size,
                patternSizeFactor: 0.5,
                starCount: 360,
                starScaling: 1,
                color: "rgb(255 255 255 / .6)"
            }),
            grid: new PerspectiveGrid({
                // size: [960, 540]
                size: this.size,
                viewDistance: 26,
                gridSize: 23,
                angle: 285,
                fieldOfView: h / 2,
                lineScaling: 1
            }),
            logo: new Logo({
                url: "./images/bare_saa_80_logo_nobg.svg",
                size: [w, h]
            })
        };

        this.ctorPromise = this.assets.logo.initAsync();

    }

    private readonly ctorPromise: Promise<any>;
    private readonly container: HTMLElement;

    private readonly assets: Bs80Assets;
    ctx: CanvasRenderingContext2D;
    size: Size;

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

    private readonly onWindowResize: (e: Event) => void = e => {
        Timing.debounce(async () => {
            const a = this.assets;
            if (a) {
                await Timing.delayAsync(200);
                const size = this.getContainerSize();
                const [, h] = this.size = a.grid.size = a.logo.size = a.starField.size = [this.ctx.canvas.width, this.ctx.canvas.height] = size;
                a.grid.fieldOfView = h / 2;
            }
        }, 250);
    };

    async startAnimation(): Promise<void> {

        await this.ctorPromise;

        window.addEventListener("resize", this.onWindowResize);

        const { bg, shadow, starField, grid, logo } = this.assets;

        const renderStarFieldFrame = starField.createFrameRenderer(this.ctx, {
            rotateDegPerSecond: -3,
            rotateCenterFactors: [0.5, 0.65]
        });

        const renderGridFrame = grid.createFrameRenderer(this.ctx, {
            horStrokeStyle: "rgb(97 161 172 / .42)",
            verStrokeStyle: "rgb(255 255 255 / .15)",
            gridRowsPerSecond: 2,
            rotateDegPerSecond: 0,
            skipClear: true
        });

        const renderLogoFrame = logo.createFrameRenderer(this.ctx);

        const logoAnimationStartTime = 3_000;

        const animation = new FrameAnimation(time => {

            const ctx = this.ctx;
            const [w, h] = this.size;

            let hasMoreFrames = true;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Render opaque background gradient
            bg.render(ctx, false, 0, 0, w, h);

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
            shadow.render(ctx, true, 0, 0, w, h);

            if (time > logoAnimationStartTime) {
                renderLogoFrame(time - logoAnimationStartTime);
            }

            return hasMoreFrames;

        });

        animation.start();
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
new Bs80Animation(document.body, window.innerWidth, window.innerHeight).startAnimation();

