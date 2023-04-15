export namespace Gradient {

    const gradColors: Array<[offset: number, color: RgbColor]> = [
        [0, [0, 0, 0, 0]],
        [0.5, [20, 3, 37, 0]],
        [0.62, [24.8, 3.815, 45.78, 1]],
        [0.68, [28, 8, 50, 1]],
        [1, [41, 39, 62, 0]]
    ];

    function toRgb(color: RgbColor, includeAlpha: boolean): string {
        const [r, g, b, a] = color;
        const rgb = [r, g, b].join(" ");
        const aTail = includeAlpha && a !== undefined ? ` / ${a}` : "";
        return `rgb(${rgb}${aTail})`;
    }

    export function create(ctx: CanvasRenderingContext2D, includeAlpha: boolean, ...rect: Rect): CanvasGradient {
        const [x, y, , h] = rect;
        const linGrad = ctx.createLinearGradient(x, y, 0, h);
        for (const [offset, color] of gradColors) {
            linGrad.addColorStop(offset, toRgb(color, includeAlpha));
        }
        return linGrad;
    }

    export function render(ctx: CanvasRenderingContext2D, includeAlpha: boolean, ...rect: Rect): void {
        const linGrad = create(ctx, includeAlpha, ...rect);
        ctx.save();
        ctx.fillStyle = linGrad;
        ctx.fillRect(...rect);
        ctx.restore();
    }
}
