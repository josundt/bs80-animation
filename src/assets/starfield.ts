import type { CanvasStrokeOrFillStyle, IAnimationFrameRenderer, Size } from "../lib/abstractions.js";
import { Calc } from "../lib/calc.js";

type Star = [x: number, y: number, radius: number];

export interface StarfieldConfiguration {
    starCount: number;
    size: Size;
    color: CanvasStrokeOrFillStyle;
    patternSizeFactor?: number;
    starScaling?: number;
}

export type StarfieldOptions = Readonly<StarfieldConfiguration>;

export interface StarfieldAnimationOptions {
    rotateDegPerSecond: number;
    rotateCenterFactors?: [horCenterFactor: number, verCenterFactor: number];
}

interface AnimationState {
    ctx: CanvasRenderingContext2D;
    pattern: CanvasPattern;
}


export class Starfield implements IAnimationFrameRenderer<[StarfieldAnimationOptions]> {

    constructor(
        options: StarfieldOptions
    ) {
        this.config = {
            patternSizeFactor: 0.5,
            starScaling: 1,
            ...options
        };
        this.origSize = [...options.size];
        this.stars = Starfield.createStars(this.config, this.patternSize);
    }

    private readonly config: Required<StarfieldConfiguration>;
    private readonly stars: Star[];
    private readonly origSize: Size;
    private animationState?: AnimationState;

    private get patternSize(): Size {
        const [w, h] = this.size;
        return [w * this.config.patternSizeFactor, h * this.config.patternSizeFactor];
    }

    get scaling(): [horScaleFactor: number, verScaleFactor: number] {
        return [this.size[0] / this.origSize[0], this.size[1] / this.origSize[1]];
    }

    get size(): Size {
        return this.config.size;
    }
    set size(value: Size) {
        this.config.size = [...value];
        if (this.animationState) {
            this.animationState.pattern = this.createPattern(this.animationState.ctx);
        }
    }

    private static createStars(config: Required<StarfieldConfiguration>, size: Size): Star[] {
        const result: Star[] = [];
        const [pW, pH] = size;
        for (let i = 0; i < config.starCount; ++i) {
            const x = Math.random() * pW;
            const y = Math.random() * pH;
            const radius = Math.random() * (Calc.avg(...config.size) * 0.001 * config.starScaling);
            result.push([x, y, radius]);
        }
        return result;
    }

    private static renderStars(stars: Star[], ctx: CanvasRenderingContext2D, color: CanvasStrokeOrFillStyle): void {
        for (const s of stars) {
            ctx.beginPath();
            ctx.arc(...s, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    createPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = this.patternSize;
        const patternCtx = canvas.getContext("2d")!;
        patternCtx.scale(...this.scaling);
        Starfield.renderStars(this.stars, patternCtx, this.config.color);
        // patternCtx.canvas.toBlob(b => {
        //     const oUrl = URL.createObjectURL(b!);
        //     const a = document.createElement("a");
        //     a.setAttribute("download", "image.png");
        //     a.setAttribute("href", oUrl);
        //     a.click();
        //     URL.revokeObjectURL(oUrl);
        // }, "image/png");
        return ctx.createPattern(canvas, "repeat")!;
    }

    createFrameRenderer(ctx: CanvasRenderingContext2D, options: StarfieldAnimationOptions): (time: number) => boolean {
        const radPerSecond = options.rotateDegPerSecond * (Math.PI / 180);
        this.animationState = {
            ctx: ctx,
            pattern: this.createPattern(ctx)
        };
        const [horCenterFactor, verCenterFactor] = options.rotateCenterFactors ?? [0.5, 0.65];
        return time => {
            const rotatation = ((time / 1000) * radPerSecond) % (Math.PI * 2);
            const [w, h] = this.size;
            ctx.save();
            ctx.translate(w * horCenterFactor, h * verCenterFactor);
            ctx.rotate(rotatation);

            ctx.beginPath();

            const hemisphereRadius = Math.sqrt(
                ((w * Math.max(horCenterFactor, 1 - horCenterFactor)) ** 2) +
                ((h * Math.max(verCenterFactor, 1 - verCenterFactor)) ** 2)
            );

            ctx.arc(0, 0, hemisphereRadius, 0, 2 * Math.PI);

            // ctx.scale(...this.scaling);
            ctx.fillStyle = this.animationState!.pattern;
            ctx.fill();

            ctx.strokeStyle = "#FFF";
            ctx.stroke();

            ctx.restore();
            return true;
        };
    }

}
