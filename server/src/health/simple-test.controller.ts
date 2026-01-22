import { Controller, Get } from '@nestjs/common';
import { SimpleTestService } from './simple-test.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/test')
export class SimpleTestController {
  constructor(private readonly simpleTestService: SimpleTestService) {
    console.log('[SimpleTestController] Constructor called, simpleTestService:', simpleTestService ? 'INJECTED' : 'UNDEFINED');
  }

  @Public()
  @Get()
  test() {
    return this.simpleTestService.getMessage();
  }
}
