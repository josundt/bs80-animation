import type { Rect, Size } from "../lib/abstractions.js";
import { Easing } from "../lib/easing.js";
import { Logger, type ILogger } from "../lib/logger.js";

export interface LogoOptions {
    url: string;
    size: Size;
}

export class Logo {

    constructor(
        private readonly options: LogoOptions,
        private readonly logger: ILogger = new Logger(),
    ) {}

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
        return [...this.options.size];
    }
    set size(value: Size) {
        this.options.size = [...value];
    }

    async initAsync(): Promise<void> {
        this.image = await Logo.loadImageAsync(this.options.url);
    }

    createAnimationFrameRenderer(
        ctx: CanvasRenderingContext2D
    ): (time: DOMHighResTimeStamp) => boolean {

        let scaleFactor = 0.03;
        let hasLogged = false;
        const imageScale = 0.8;

        return (time: DOMHighResTimeStamp): boolean => {
            if (scaleFactor < 1) {
                scaleFactor = Math.min(Easing.easeOut(time * 0.0001, 3), 1);
            } else if (!hasLogged) {
                this.logger.debug("Logo animation done", time);
                hasLogged = true;
            }

            const [w, h] = this.size;
            const size = (Math.min(w, h) * scaleFactor) * imageScale;
            const dimensions: Rect = [(w - size) / 2, (h - size) / 2, size, size];
            ctx.drawImage(this.image!, ...dimensions);

            return true;
        };

    }
}
