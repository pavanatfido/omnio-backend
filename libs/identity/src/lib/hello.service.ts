import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getGreeting() {
    return 'Hello from Identity!';
  }
}
