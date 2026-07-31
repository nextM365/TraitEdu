import { Router } from 'express';
import { dashboardData, getBranchContent, students } from '../data/tenants.js';

const router = Router();

router.get('/', (req, res) => {
  const content = getBranchContent(req.auth.branchId);
  const student = req.auth.studentId
    ? students.find(item => item.branchId === req.auth.branchId && item.id === req.auth.studentId)
    : undefined;
  const publishedSeriesIds = new Set((content.examManagement?.series ?? []).filter(item => item.status === 'Published').map(item => item.id));
  const feeAccount = content.fees.find(item => item.studentId === req.auth.studentId);
  const paidAmount = feeAccount?.installments
    .filter(item => item.status === 'Paid')
    .reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;
  const nextInstallment = feeAccount?.installments
    .filter(item => item.status !== 'Paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  res.json({
    ...dashboardData,
    announcements: content.announcements,
    achievements: content.achievements,
    examResults: student
      ? content.examResults.filter(item =>
          (!item.studentId || item.studentId === student.id) &&
          (!item.seriesId || (item.status === 'Published' && publishedSeriesIds.has(item.seriesId)))
        )
      : content.examResults,
    examManagement: {
      series: (content.examManagement?.series ?? []).filter(item => !student || item.status === 'Published'),
      schedules: (content.examManagement?.schedules ?? []).filter(item =>
        !student || (item.status === 'Published' && publishedSeriesIds.has(item.seriesId) && item.className === student.className && item.section === student.section)
      ),
      gradeRules: content.examManagement?.gradeRules ?? [],
    },
    fees: feeAccount ? {
      due: `₹${Math.max(0, feeAccount.netFee - paidAmount).toLocaleString('en-IN')}`,
      paid: `₹${paidAmount.toLocaleString('en-IN')}`,
      total: `₹${feeAccount.netFee.toLocaleString('en-IN')}`,
      nextInstallment: nextInstallment?.dueDate ?? 'Fully paid',
    } : dashboardData.fees,
    attendance: content.attendance,
    wellness: content.wellness,
    events: content.events,
    summary: ['branch_admin', 'school_admin'].includes(req.auth.role)
      ? [
          { title: 'Students', value: 'School roster', subtitle: 'Manage enrolled students' },
          { title: 'Attendance', value: '92%', subtitle: 'School attendance today' },
          { title: 'Notifications', value: '4', subtitle: 'Unread alerts' },
          { title: 'Role', value: 'Admin', subtitle: 'School-level access' },
        ]
      : dashboardData.summary,
  });
});

export default router;
