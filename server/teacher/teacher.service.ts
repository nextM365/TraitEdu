import { Injectable } from '@nestjs/common';
import teacherData from '../data/teacherData.js';

@Injectable()
export class TeacherService {
  getTeacherData() {
    return teacherData;
  }
}
