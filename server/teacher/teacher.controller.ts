import { Controller, Get } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  getTeachers() {
    return this.teacherService.getTeacherData();
  }
}
