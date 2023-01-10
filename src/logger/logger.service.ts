import { injectable } from 'inversify/lib/annotation/injectable';
import { Logger } from 'tslog';
import { ILogger } from './logger.Interface';
import 'reflect-metadata';

@injectable()
export class LoggerService implements ILogger {
	private logger;
	constructor() {
		this.logger = new Logger({
			name: 'LoggerService',
		});
	}
	log(...args: unknown[]): void {
		this.logger.log(0, 'silly', ...args);
	}

	error(...args: unknown[]): void {
		this.logger.error(...args);
	}

	warn(...args: unknown[]): void {
		this.logger.warn(...args);
	}
}
