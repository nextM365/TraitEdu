import { Router } from 'express';
import { branches, initializeBranchContent, schools, tenants } from '../data/tenants.js';

const router = Router();

router.use((req, res, next) => {
  if (req.auth.role !== 'global_admin') {
    return res.status(403).json({ message: 'Global administrator access is required.' });
  }
  next();
});

router.get('/hierarchy', (_req, res) => {
  res.json({
    tenants,
    schools: schools.map(school => ({
      ...school,
      branches: branches.filter(branch => branch.schoolId === school.id),
    })),
  });
});

router.post('/schools', (req, res) => {
  const { id, name, code, address, principal, contactEmail, contactPhone } = req.body ?? {};
  if (!id || !name || !code) return res.status(400).json({ message: 'School ID, name, and code are required.' });
  if (schools.some(school => school.id === id || school.code === code)) {
    return res.status(409).json({ message: 'School ID or code already exists.' });
  }
  const school = {
    id, tenantId: req.auth.tenantId ?? 'traitedu', name, code, address: address ?? '',
    principal: principal ?? '', established: new Date().getFullYear(),
    contact: { email: contactEmail ?? '', phone: contactPhone ?? '' },
    totalStudents: 0, totalTeachers: 0, totalClasses: 0, upcomingEvents: [],
  };
  schools.push(school);
  res.status(201).json(school);
});

router.post('/branches', (req, res) => {
  const { id, schoolId, name, code, address } = req.body ?? {};
  if (!id || !schoolId || !name || !code) return res.status(400).json({ message: 'Branch ID, school, name, and code are required.' });
  if (!schools.some(school => school.id === schoolId)) return res.status(404).json({ message: 'School not found.' });
  if (branches.some(branch => branch.id === id || branch.code === code)) {
    return res.status(409).json({ message: 'Branch ID or code already exists.' });
  }
  const branch = { id, schoolId, name, code, address: address ?? '' };
  branches.push(branch);
  initializeBranchContent(branch.id);
  res.status(201).json(branch);
});

export default router;
