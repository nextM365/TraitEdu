import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { SchoolModule } from './school/school.module.js';
import { TeacherModule } from './teacher/teacher.module.js';
import { StudentModule } from './student/student.module.js';

@Module({
  imports: [DashboardModule, SchoolModule, TeacherModule, StudentModule],
})
export class AppModule {}
