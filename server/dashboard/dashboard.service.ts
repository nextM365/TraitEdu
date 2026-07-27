import { Injectable } from '@nestjs/common';
import dashboardData from '../data/dashboardData.js';

@Injectable()
export class DashboardService {
  getDashboardData() {
    return dashboardData;
  }
}
