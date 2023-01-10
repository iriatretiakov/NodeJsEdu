import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { injectable } from 'inversify/lib/annotation/injectable';
import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.Interface';
import { TYPES } from '../types';
import 'reflect-metadata';
import { IUserController } from './user.controller.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUsersService } from './user.service.interface';
import { ValidateMiddleware } from '../common/validate.middleware';
import { IConfigService } from '../config/config.service.interface';
import { sign } from 'jsonwebtoken';
import { GuarMiddleware } from '../common/guard.middleware';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.Logger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/login',
				func: this.login,
				method: 'post',
				middleware: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/register',
				func: this.register,
				method: 'post',
				middleware: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/info',
				func: this.info,
				method: 'get',
				middleware: [new GuarMiddleware()],
			},
		]);
	}

	public async login(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const isUserValid = await this.userService.validateUser(body);
		if (!isUserValid) {
			return next(new HTTPError(401, 'authorization error!!', 'login'));
		}
		const jwt = await this.signJwt(body.email, this.configService.get('SECRET'));
		this.ok(res, { jwt });
	}

	public async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HTTPError(422, 'User is already exist!'));
		}
		this.ok(res, result);
	}

	public async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		const existedUser = await this.userService.getUserByEmail(user);
		if (!existedUser) {
			return next(new HTTPError(404, 'User is not founded'));
		}
		this.ok(res, { id: existedUser?.id, user });
	}

	private signJwt(email: string, secter: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secter,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
