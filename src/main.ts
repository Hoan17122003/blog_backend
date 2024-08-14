import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

dotenv.config({
    path: 'local.env',
});

async function bootstrap() {
    // const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    //     prefix: '/uploads/',
    // });
    const app = await NestFactory.create(AppModule, {});
    app.use(cookieParser());
    app.use(
        session({
            secret: process.env.SESSIONSECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: true,
            },
        }),
    );
    app.use(
        cors({
            origin: 'http://localhost:3000',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        }),
    );

    // app.enableCors({
    //     origin: 'http://localhost:3000',
    //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //     credentials: true,
    // });
    await app.listen(process.env.PORT, () => {
        console.log(`server listening is port ${process.env.PORT}`);
    });
}
bootstrap();
