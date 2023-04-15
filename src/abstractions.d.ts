type Point = readonly [x: number, y: number];

type Size = readonly [w: number, h: number];

type Rect =  [x: number, y: number, w: number, h: number];

type Line = readonly [from: Point, to: Point];

type RgbColor = readonly [r: number, g: number, b: number, a?: number];

type CanvasStrokeOrFillStyle = string | CanvasGradient | CanvasPattern;

interface PerspectiveGridConfiguration {
    size: Size;
    /** Field of view kind of the lense, smaller values = spheric */
    fieldOfView: number;
    /** view distance, higher values = further away */
    viewDistance: number;
    /** grid angle */
    angle: number;
    /** grid size in Cartesian */
    gridSize: number;
    lineWidth: number;
}

interface LogoOptions {
    url: string;
    size: Size;
}

type PerspectiveGridOptions = Partial<PerspectiveGridConfiguration>;

interface PerspectiveGridRenderOptions {
    horStrokeStyle: CanvasStrokeOrFillStyle;
    verStrokeStyle: CanvasStrokeOrFillStyle;
}

interface PerspectiveGridAnimationOptions extends PerspectiveGridRenderOptions {
    gridRowsPerSecond?: number;
    rotateDegPerSecond?: number;
    skipClear?: boolean;
}
