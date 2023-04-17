import type { CanvasStrokeOrFillStyle, IAnimationFrameRenderer, Line, Point, Size } from "../lib/abstractions.js";
import { Calc } from "../lib/calc.js";
import { FrameAnimation, type IFrameAnimation } from "../lib/frame-animation.js";

export interface PerspectiveGridConfiguration {
    size: Size;
    /** Field of view kind of the lense, smaller values = spheric */
    fieldOfView: number;
    /** view distance, higher values = further away */
    viewDistance: number;
    /** grid angle */
    angle: number;
    /** grid size in Cartesian */
    gridSize: number;

    lineScaling?: number;
}

export type PerspectiveGridOptions = Partial<Readonly<PerspectiveGridConfiguration>>;

export interface PerspectiveGridRenderOptions {
    horStrokeStyle: CanvasStrokeOrFillStyle;
    verStrokeStyle: CanvasStrokeOrFillStyle;
}

export interface PerspectiveGridAnimationOptions extends PerspectiveGridRenderOptions {
    gridRowsPerSecond?: number;
    rotateDegPerSecond?: number;
    skipClear?: boolean;
}

export class PerspectiveGrid implements IAnimationFrameRenderer<[options: PerspectiveGridAnimationOptions]> {

    constructor(options?: PerspectiveGridOptions) {
        this.config = {
            ...this.getDefaultOptions(),
            ...(options ?? {})
        };
        this.createVerticalLines();
        this.createHorizontalLines();
    }

    private readonly config: Required<PerspectiveGridConfiguration>;
    private readonly horizontalLines: Line[] = [];
    private readonly verticalLines: Line[] = [];

    private get center(): Point {
        const [w, h] = this.size;
        return [w / 2, h / 2];
    }

    private get lineWidth(): number {
        return Calc.avg(...this.config.size) * 0.001 * this.config.lineScaling;
    }

    private getDefaultOptions(): Readonly<Required<PerspectiveGridConfiguration>> {
        return {
            size: [960, 540],
            fieldOfView: 512,
            viewDistance: 12,
            angle: -75,
            gridSize: 12,
            lineScaling: 1
        };
    }

    private rotateX(...point: Point): Point {
        let [x, y] = point;
        const { angle, fieldOfView, viewDistance } = this.config;
        const rd = angle * Math.PI / 180; /// convert angle into radians
        const ca = Math.cos(rd);
        const sa = Math.sin(rd);

        const ry = y * ca; /// convert y value as we are rotating
        const rz = y * sa; /// only around x. Z will also change

        /// Project the new coords into screen coords
        const f = fieldOfView / (viewDistance + rz);
        x = x * f + this.center[0];
        y = ry * f + this.center[1];

        return [x, y];
    }

    private createVerticalLines(): void {
        const { gridSize } = this.config;

        let p1: Point;
        let p2: Point;

        this.verticalLines.splice(0);

        for (let i = -gridSize; i <= gridSize; i++) {
            p1 = this.rotateX(i, -gridSize);
            p2 = this.rotateX(i, gridSize);
            this.verticalLines.push([p1, p2]);
        }
    }

    private createHorizontalLines(movePercent: number = 0): void {
        const { gridSize } = this.config;

        let p1: Point;
        let p2: Point;

        this.horizontalLines.splice(0);

        for (let i = -gridSize; i <= gridSize; i++) {
            p1 = this.rotateX(-gridSize, i + (movePercent / 100));
            p2 = this.rotateX(gridSize, i + (movePercent / 100));

            // if (movePercent) {
            //     const nextP1 = this.rotateX(-gridSize, i + 1);
            //     const [,nextY1] = nextP1;
            //     const [,y1] = p1;
            //     const diff = nextY1 - y1;
            //     const newY1 = y1 + (diff * (movePercent / 100));
            //     p1 = [p1[0], newY1];
            //     p2 = [p2[0], newY1];
            // }

            this.horizontalLines.push([p1, p2]);
        }
    }

    private drawCanvasLine(ctx: CanvasRenderingContext2D, line: Line, strokeStyle: string | CanvasGradient | CanvasPattern): void {
        const [p1, p2] = line;
        ctx.save();
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(...p1);
        ctx.lineTo(...p2);
        ctx.strokeStyle = strokeStyle;
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    private toSvgLine(l: Line, strokeStyle: string, indent: string = "  "): string {
        const [[x1, y1], [x2, y2]] = l;
        return `${indent}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeStyle}"/>`;
    }

    get size(): Size {
        return [...this.config.size];
    }
    set size(value: Size) {
        this.config.size = value;
    }

    get angle(): number {
        return this.config.angle;
    }
    set angle(value: number) {
        this.config.angle = value;
    }

    get fieldOfView(): number {
        return this.config.fieldOfView;
    }
    set fieldOfView(value: number) {
        this.config.fieldOfView = value;
    }

    renderToCanvas(ctx: CanvasRenderingContext2D, options: PerspectiveGridRenderOptions, clear?: boolean): void {
        if (clear) {
            ctx.clearRect(0, 0, ...this.size);
        }
        for (const l of this.verticalLines) {
            this.drawCanvasLine(ctx, l, options.verStrokeStyle);
        }
        for (const l of this.horizontalLines) {
            this.drawCanvasLine(ctx, l, options.horStrokeStyle);
        }
    }

    toSvg(options: PerspectiveGridRenderOptions): string {
        const [w, h] = this.size;
        return [
            `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`,
            ...this.verticalLines.map(l => this.toSvgLine(l, options.verStrokeStyle as string)),
            ...this.horizontalLines.map(l => this.toSvgLine(l, options.horStrokeStyle as string)),
            "</svg>"
        ].join("\n");
    }

    createFrameRenderer(
        ctx: CanvasRenderingContext2D,
        options: PerspectiveGridAnimationOptions
    ): (time: DOMHighResTimeStamp) => boolean {
        let rowMovePercent = 0;
        let lastTime = 0;
        let rowCounter = 0;
        return (time: DOMHighResTimeStamp) => {

            const timeDelta = time - lastTime;
            const rotateDegDelta = (timeDelta / 1000) * (options.rotateDegPerSecond ?? 0);
            this.angle += rotateDegDelta % 360;
            let hasMoreFrames = true;
            lastTime = time;
            // const timeDeltaSeconds = timeDelta / 1_000;

            const movePercentDelta = timeDelta * (options.gridRowsPerSecond ?? 3) / 10;
            this.createVerticalLines();
            this.createHorizontalLines(rowMovePercent);
            this.renderToCanvas(ctx, options, !options.skipClear);
            if (rowMovePercent + movePercentDelta >= 100) {
                rowCounter++;
            }
            if (rowCounter /*> 3*/ < 0) {
                hasMoreFrames = false;
            }
            rowMovePercent = (rowMovePercent + movePercentDelta) % 100;
            return hasMoreFrames;
        };

    }

    private canvasAnimation: IFrameAnimation | null = null;

    startCanvasAnimation(
        ctx: CanvasRenderingContext2D,
        options: PerspectiveGridAnimationOptions,
        onStopped?: () => void
    ): boolean {
        this.canvasAnimation = new FrameAnimation(this.createFrameRenderer(
            ctx,
            options
        ), onStopped);
        return this.canvasAnimation.start();
    }

    stopCanvasAnimation(): boolean {
        return this.canvasAnimation?.stop() ?? false;
    }

}

