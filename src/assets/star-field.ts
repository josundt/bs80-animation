import type { AnimationFrameRenderer, CanvasStrokeOrFillStyle, Size } from "../lib/abstractions.js";

type Star = [x: number, y: number, radius: number];

export interface StarFieldOptions {
    starCount: number;
    size: Size;
    maxStarSize: number;
    color: CanvasStrokeOrFillStyle;
}

export interface StarFieldAnimationOptions {
    rotateDegPerSecond: number;
}

interface AnimationState {
    ctx: CanvasRenderingContext2D;
    pattern: CanvasPattern;
}


export class StarField implements AnimationFrameRenderer<[StarFieldAnimationOptions]> {

    constructor(
        private readonly options: StarFieldOptions
    ) {
        this.stars = StarField.createStars(options);
        this.origSize = [...options.size];
    }

    private readonly stars: Star[];
    private readonly origSize: Size;
    private scaling: Size = [1, 1];
    private animationState?: AnimationState;

    get size(): Size {
        return this.options.size;
    }
    set size(value: Size) {
        const [w, h] = value;
        const [origW, origH] = this.origSize;
        this.options.size = [w, h];
        this.scaling = [w / origW, h / origH];
        if (this.animationState) {
            this.animationState.pattern = this.createPattern(this.animationState.ctx);
        }
    }

    private static createStars(options: StarFieldOptions): Star[] {
        const result: Star[] = [];
        const [w, h] = options.size;
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

    createPattern(ctx: CanvasRenderingContext2D, size?: Size): CanvasPattern {
        // Default size is the least of the dimensions
        if (!size) {
            const [w, h] = this.options.size;
            const min = Math.min(w, h);
            size = [min / 2, min / 2];
        }
        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = size;
        const patternCtx = canvas.getContext("2d")!;
        StarField.renderStars(this.stars, patternCtx, this.options.color);
        return ctx.createPattern(canvas, "repeat")!;
    }

    createAnimationFrameRenderer(ctx: CanvasRenderingContext2D, options: StarFieldAnimationOptions): (time: number) => boolean {
        const pattern = this.createPattern(ctx);
        const radPerSecond = options.rotateDegPerSecond * (Math.PI / 180);
        this.animationState = {
            ctx: ctx,
            pattern: pattern
        };
        return time => {
            const rotatation = ((time / 1000) * radPerSecond) % (Math.PI * 2);
            const [w, h] = this.size;
            ctx.save();
            ctx.scale(...this.scaling);
            ctx.translate(w / 2, h);
            ctx.rotate(rotatation);
            ctx.fillStyle = pattern;
            ctx.fillRect(w * -1.5, -h, w * 2.5, h * 3);
            ctx.restore();
            return true;
        };
    }

}
