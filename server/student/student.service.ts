import { Injectable } from '@nestjs/common';
import studentData from '../data/studentData.js';

@Injectable()
export class StudentService {
  getStudentData() {
    return studentData;
  }
}
