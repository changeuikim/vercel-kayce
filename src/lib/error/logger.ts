export interface Logger {
    log(
        level: 'error' | 'warn' | 'info' | 'debug',
        message: string,
        meta?: Record<string, any>
    ): void;
}

export class ConsoleLogger implements Logger {
    log(
        level: 'error' | 'warn' | 'info' | 'debug',
        message: string,
        meta?: Record<string, any>
    ): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta,
        };
        console[level](JSON.stringify(logEntry, null, 2));
    }
}
