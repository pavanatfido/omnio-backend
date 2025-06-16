import { Controller, Get } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('identity')
export class HelloController {
  constructor(private readonly helloSvc: HelloService) {}

  @Get('hello')
  greet() {
    return { message: this.helloSvc.getGreeting() };
  }
}
