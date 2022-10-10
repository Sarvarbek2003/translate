import { Controller,Get,Render,Dependencies } from "@nestjs/common";

@Controller('')
@Dependencies()
export class RenderController {
    
    @Get("")
    @Render('index.html')
    home(){}
}
