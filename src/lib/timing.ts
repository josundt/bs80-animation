export namespace Timing {

    export function delayAsync(ms: number, abortSignal?: AbortSignal): Promise<void> {
        let timer: number | null = null;
        const onAbort = (): void => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            abortSignal?.removeEventListener("abort", onAbort);
        };
        return new Promise(r => {
            timer = setTimeout(r, ms);
            abortSignal?.addEventListener("abort", onAbort);
        });
    }

    let debounceCallback: (() => any) | undefined;
    let lastAbortController: AbortController | null;

    export function debounce(fn: () => any, ms: number): void {

        debounceCallback = fn;
        if (lastAbortController) {
            lastAbortController.abort("debounced");
        }
        lastAbortController = new AbortController();
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        delayAsync(ms, lastAbortController.signal).then(debounceCallback);

    }
}
