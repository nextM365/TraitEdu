import { Controller, Get } from '@nestjs/common';
import { SchoolService } from './school.service.js';

@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  getSchool() {
    return this.schoolService.getSchoolData();
  }
}
