export type Point = readonly [x: number, y: number];

export type Size = readonly [w: number, h: number];

export type Rect = [x: number, y: number, w: number, h: number];

export type Line = readonly [from: Point, to: Point];

export type RgbColor = readonly [r: number, g: number, b: number, a?: number];

export type CanvasStrokeOrFillStyle = string | CanvasGradient | CanvasPattern;

export interface AnimationFrameRenderer<TArgs extends any[] = []> {
    createAnimationFrameRenderer(
        ctx: CanvasRenderingContext2D,
        ...args: TArgs
    ): (time: DOMHighResTimeStamp) => boolean
}
