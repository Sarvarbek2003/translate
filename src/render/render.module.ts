import { Module } from '@nestjs/common';
import { RenderController } from './render.controller';

@Module({
    controllers: [RenderController]
  })
export class RenderModule {}
