export interface IFrameAnimation {
    start(): boolean;
    stop(): boolean;
}

export class FrameAnimation implements IFrameAnimation {

    constructor(
        private readonly cbRenderFrame: (time: DOMHighResTimeStamp) => boolean,
        private readonly cbStopped?: () => void
    ) {}

    private started: boolean = false;
    private currAnimationFrame: number | null = null;

    start(): boolean {
        const result = !this.started;
        const render = (time: DOMHighResTimeStamp): void => {
            if (this.started) {
                this.started = this.cbRenderFrame(time);
            }
            if (!this.started) {
                this.cbStopped?.();
            } else {
                this.currAnimationFrame = requestAnimationFrame(render);
            }
        };
        this.started = true;
        this.currAnimationFrame = requestAnimationFrame(render);
        return result;
    }

    stop(): boolean {
        const result = this.started;
        this.started = false;
        if (this.currAnimationFrame) {
            cancelAnimationFrame(this.currAnimationFrame);
        }
        if (result) {
            this.cbStopped?.();
        }
        return result;
    }
}
