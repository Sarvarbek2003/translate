import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RenderController } from './render/render.controller';
import { RenderModule } from './render/render.module';

@Module({
  imports: [RenderModule],
  controllers: [RenderController, AppController],
  providers: [AppService],
})
export class AppModule {}
