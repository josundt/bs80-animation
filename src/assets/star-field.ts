import type { AnimationFrameRenderer, CanvasStrokeOrFillStyle, Size } from "../lib/abstractions.js";

type Star = [x: number, y: number, radius: number];

export interface StarFieldConfiguration {
    starCount: number;
    size: Size;
    patternSize?: Size;
    maxStarSize: number;
    color: CanvasStrokeOrFillStyle;
}

export type StarFieldOptions = Readonly<StarFieldConfiguration>;

export interface StarFieldAnimationOptions {
    rotateDegPerSecond: number;
    rotateCenterFactors?: [horCenterFactor: number, verCenterFactor: number];
}

interface AnimationState {
    ctx: CanvasRenderingContext2D;
    pattern: CanvasPattern;
}


export class StarField implements AnimationFrameRenderer<[StarFieldAnimationOptions]> {

    constructor(
        options: StarFieldOptions
    ) {
        this.config = {
            patternSize: [500, 500],
            ...options
        };
        this.origSize = [...options.size];
        this.stars = StarField.createStars(this.config);
    }

    private readonly config: Required<StarFieldConfiguration>;
    private readonly stars: Star[];
    private readonly origSize: Size;
    private animationState?: AnimationState;

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

    private static createStars(options: Required<StarFieldConfiguration>): Star[] {
        const result: Star[] = [];
        const [w, h] = options.patternSize;
        for (let i = 0; i < options.starCount; ++i) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * options.maxStarSize;
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
        const [horScale, verScale] = this.scaling;
        const patternSize = [500 * horScale, 500 * verScale];
        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = patternSize;
        const patternCtx = canvas.getContext("2d")!;
        patternCtx.scale(...this.scaling);
        StarField.renderStars(this.stars, patternCtx, this.config.color);
        return ctx.createPattern(canvas, "repeat")!;
    }

    createAnimationFrameRenderer(ctx: CanvasRenderingContext2D, options: StarFieldAnimationOptions): (time: number) => boolean {
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
            const radius = Math.sqrt(((w / 2) ** 2) + (h ** 2));
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);

            ctx.fillStyle = this.animationState!.pattern;
            ctx.fill();

            ctx.strokeStyle = "#FFF";
            ctx.stroke();

            ctx.restore();
            return true;
        };
    }

}
