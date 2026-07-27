import { Injectable } from '@nestjs/common';
import schoolData from '../data/schoolData.js';

@Injectable()
export class SchoolService {
  getSchoolData() {
    return schoolData;
  }
}
