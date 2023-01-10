import express, { Express } from 'express';
import { Server } from 'http';
import { inject } from 'inversify';
import { injectable } from 'inversify/lib/annotation/injectable';
import { BaseController } from './common/base.controller';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { ILogger } from './logger/logger.Interface';
import { TYPES } from './types';
import { json } from 'body-parser';
import 'reflect-metadata';
import { PrismaService } from './database/prisma.service';
import { AuthMiddleware } from './common/auth.middleware';
import { IConfigService } from './config/config.service.interface';

@injectable()
export class App {
	app: Express;
	server: Server;
	port = 8000;
	constructor(
		@inject(TYPES.Logger) private logger: ILogger,
		@inject(TYPES.UserController) private userController: BaseController,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
		@inject(TYPES.ConfigService) private configurationService: IConfigService,
	) {
		this.app = express();
	}

	useMiddleware(): void {
		this.app.use(json());
		const authMiddleware = new AuthMiddleware(this.configurationService.get('SECRET'));
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	useRoutes(): void {
		this.app.use('/users', this.userController.router);
	}

	useExceptionFilter(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		this.useExceptionFilter();
		await this.prismaService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log(`server is started on port ${this.port}`);
	}

	public close(): void {
		this.server.close();
	}
}
