export type Point = readonly [x: number, y: number];

export type Size = readonly [w: number, h: number];

export type Rect = [x: number, y: number, w: number, h: number];

export type Line = readonly [from: Point, to: Point];

export type RgbColor = readonly [r: number, g: number, b: number, a?: number];

export type CanvasStrokeOrFillStyle = string | CanvasGradient | CanvasPattern;

export interface IAsyncAnimationFrameRenderer<TArgs extends any[] = []> {
    initAsync(): Promise<IAnimationFrameRenderer<TArgs>>;
}

export interface IAnimationFrameRenderer<TArgs extends any[] = []> {
    createFrameRenderer(
        ctx: CanvasRenderingContext2D,
        ...args: TArgs
    ): (time: DOMHighResTimeStamp) => boolean
}
