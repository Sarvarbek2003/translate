import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { renderFile } from 'ejs'
import { join } from "path";


async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.engine('html', renderFile)
  
  app.setBaseViewsDir(join(__dirname, '../public'))
  app.useStaticAssets(join(__dirname, '../public'), {
    index: false,
    redirect: false
  })
  app.useStaticAssets(join(__dirname, '../files'), {
    index: false,
    redirect: false
  })
  await app.listen(3000);
}
bootstrap();
