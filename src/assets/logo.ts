import type { IAsyncAnimationFrameRenderer, Rect, Size } from "../lib/abstractions.js";
import { Easing } from "../lib/easing.js";
import { Logger, type ILogger } from "../lib/logger.js";

export interface LogoConfiguration {
    url: string;
    size: Size;
}

export type LogoOptions = Readonly<LogoConfiguration>;

export class Logo implements IAsyncAnimationFrameRenderer {

    constructor(
        options: LogoOptions,
        private readonly logger: ILogger = new Logger(),
    ) {
        this.config = { ...options };
    }

    private readonly config: LogoConfiguration;

    // private static logoUrl: string = "bare_så_80_logo_nobg.svg";
    private image: HTMLImageElement | null = null;

    private static loadImageAsync(url: string): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((res, rej) => {
            const image = new Image();
            image.onload = () => res(image);
            image.onerror = (e, src, lineno, colno, error) => rej(error ?? new Error(`Image failed to load: ${url}`));
            image.src = url;
        });
    }

    get size(): Size {
        return [...this.config.size];
    }
    set size(value: Size) {
        this.config.size = [...value];
    }

    async initAsync(): Promise<this> {
        this.image = await Logo.loadImageAsync(this.config.url);
        return this;
    }

    createFrameRenderer(
        ctx: CanvasRenderingContext2D
    ): (time: DOMHighResTimeStamp) => boolean {


        let scaleFactor = 0;
        let hasLogged = false;
        const imageScale = 0.8;

        return (time: DOMHighResTimeStamp): boolean => {

            if (scaleFactor < 1) {
                const newScaleFactor = Math.min(Easing.easeInOut(time * 0.00006), 1);
                scaleFactor = newScaleFactor > scaleFactor ? newScaleFactor : 1;
            } else if (!hasLogged) {
                this.logger.debug("Logo animation done", time, scaleFactor);
                hasLogged = true;
            }

            const [w, h] = this.size;
            const currWH = (Math.min(w, h) * scaleFactor) * imageScale;
            const size = [currWH, currWH];
            const offset = [(w - currWH) / 2, (h - currWH) / (1.52 + ((0.68 * scaleFactor)))];
            const dimensions: Rect = [...offset, ...size] as Rect;

            ctx.drawImage(this.image!, ...dimensions);

            return true;
        };

    }
}
