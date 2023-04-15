type LogFn = (message: string, ...args: any[]) => void;

export interface ILogger {
    debug: LogFn;
    info: LogFn;
    warn: LogFn;
    error: LogFn;
}

export class Logger implements ILogger {
    constructor(
        private readonly c?: Console
    ) {
        this.console = c ?? console;
    }
    private readonly console: Console;
    debug: LogFn = (...args) => this.console.debug(...args);
    info: LogFn = (...args) => this.console.info(...args);
    warn: LogFn = (...args) => this.console.warn(...args);
    error: LogFn = (...args) => this.console.error(...args);
}
