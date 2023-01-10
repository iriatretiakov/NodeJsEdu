import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from './middleware.interface';

export class GuarMiddleware implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.user) {
			return next();
		}
		res.status(401).send({ error: 'user is not authorized' });
	}
}
