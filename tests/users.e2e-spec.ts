import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

describe('Users e2e', () => {
	it('Register - error', async () => {
		const res = await request(application.app).post('/users/register').send({
			email: 'asd@ds.dx',
			password: '1',
		});

		expect(res.statusCode).toBe(422);
	});

	it('Login - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'asd@ds.dx',
			password: 'asdasd',
		});
		expect(res.body.jwt).not.toBeUndefined();
	});

	it('Login - error', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'asd@ds.dx',
			password: '1',
		});
		expect(res.statusCode).toBe(401);
	});

	it('Get user info - success', async () => {
		const login = await request(application.app).post('/users/login').send({
			email: 'asd@ds.dx',
			password: 'asdasd',
		});
		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', `Bearer ${login.body.jwt}`);

		expect(res.body.user).toBe('asd@ds.dx');
	});

	it('Get user info - error', async () => {
		const res = await request(application.app).get('/users/info').send({
			email: 'asd@ds.dx',
			password: 'asdasd',
		});
		expect(res.statusCode).toBe(401);
	});
});

afterAll(() => {
	application.close();
});
