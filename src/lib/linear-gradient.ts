import type { Rect, RgbColor } from "./abstractions.js";

type ColorStop = [offset: number, color: RgbColor];

export class LinearGradient {

    constructor(
        ...colorStops: ColorStop[]
    ) {
        this.colorStops = colorStops;
    }

    protected readonly colorStops: ColorStop[];

    private toRgb(color: RgbColor, includeAlpha: boolean): string {
        const [r, g, b, a] = color;
        const rgb = [r, g, b].join(" ");
        const aTail = includeAlpha && a !== undefined ? ` / ${a}` : "";
        return `rgb(${rgb}${aTail})`;
    }

    create(ctx: CanvasRenderingContext2D, includeAlpha: boolean, ...rect: Rect): CanvasGradient {
        const [x, y, , h] = rect;
        const linGrad = ctx.createLinearGradient(x, y, 0, h);
        for (const [offset, color] of this.colorStops) {
            linGrad.addColorStop(offset, this.toRgb(color, includeAlpha));
        }
        return linGrad;
    }

    render(ctx: CanvasRenderingContext2D, includeAlpha: boolean, ...rect: Rect): void {
        const linGrad = this.create(ctx, includeAlpha, ...rect);
        ctx.save();
        ctx.fillStyle = linGrad;
        ctx.fillRect(...rect);
        ctx.restore();
    }

}
