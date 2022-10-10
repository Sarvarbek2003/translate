import { Body, Controller,Header, Delete, Get, Post, Put, Req, Res, StreamableFile, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('get/android')
   getxml (@Res() res: Response){
    return  this.appService.getxml(res);
  }

  @Get('get/ios')
  getIos(@Res() res: Response){
    return  this.appService.getIos(res);
  }

  @Get("download/:folder")
  async download(@Res() res, @Param() data) {
    let response = await this.appService.zip(data, this.greeting, res)
  }

  greeting = (d, res:Response) => {
    console.log(d);
    
    res.setHeader('Content-disposition', 'attachment; filename=' + 'languages.zip');
    const filestream = createReadStream(join(process.cwd(),  'languages.zip'));
    filestream.pipe(res);
  }

  @Post('add')
   addxml (@Req() req: Request, @Res() res: Response, @Body() body){    
    return  this.appService.addxml(body, req, res);
  }

  @Put('update')
  update (@Req() req: Request, @Res() res: Response, @Body() body){
    return  this.appService.update(body, req, res);
  }

  @Delete('delete')
  delete (@Req() req: Request, @Res() res: Response, @Body() body){
    return  this.appService.delete(body,req,res);
  }
}
