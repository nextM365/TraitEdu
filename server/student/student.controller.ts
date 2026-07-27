import { Controller, Get } from '@nestjs/common';
import { StudentService } from './student.service.js';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  getStudents() {
    return this.studentService.getStudentData();
  }
}
