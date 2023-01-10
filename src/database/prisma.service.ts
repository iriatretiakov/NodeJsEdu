import { PrismaClient, UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { ILogger } from '../logger/logger.Interface';
import { TYPES } from '../types';

@injectable()
export class PrismaService {
	client: PrismaClient;

	constructor(@inject(TYPES.Logger) private loggerService: ILogger) {
		this.client = new PrismaClient();
	}

	async connect(): Promise<void> {
		try {
			await this.client.$connect();
			this.loggerService.log('[PrismaService] Connected to db');
		} catch (e) {
			if (e instanceof Error) {
				this.loggerService.error('[PrismaService] Error while connect to db: ' + e.message);
			}
		}
	}

	async disconnect(): Promise<void> {
		await this.client.$disconnect();
	}
}
