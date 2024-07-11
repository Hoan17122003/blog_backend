import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as session from 'express-session';

dotenv.config({
    path: 'local.env',
});

async function bootstrap() {
    // const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    //     prefix: '/uploads/',
    // });
    const app = await NestFactory.create(AppModule);

    app.use(
        session({
            secret: process.env.SESSIONSECRET,
            resave: false,
            saveUninitialized: false,
        }),
    );
    await app.listen(8080);
}
bootstrap();
