import { Injectable } from '@nestjs/common';

@Injectable()
export class SimpleTestService {
  constructor() {
    console.log('[SimpleTestService] Constructor called - NO DEPENDENCIES');
  }

  getMessage() {
    return { message: 'Simple test service works!' };
  }
}
