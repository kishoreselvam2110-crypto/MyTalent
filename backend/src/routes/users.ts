import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { getRecommendations } from '../services/recommendationService';
import { parseResume } from '../services/resumeParser';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/users/:id/profile
router.get('/:id/profile', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users/profile
router.post('/profile', async (req: Request, res: Response) => {
  const { id, name, location, education, skills, interests, email } = req.body;
  if (!id) return res.status(400).json({ error: 'User id required' });

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      location,
      education,
      email,
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
    },
  });

  // Auto-generate fresh recommendations when profile updates
  getRecommendations(user.id).catch(console.error);

  res.json({ success: true, user });
});

// POST /api/users/:id/resume
router.post('/:id/resume', upload.single('resume'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    const extractedSkills = await parseResume(filePath, ext);
    const resumeUrl = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        resumeUrl,
        skills: { push: extractedSkills },
      },
    });

    // Regenerate recommendations after resume parse
    getRecommendations(user.id).catch(console.error);

    res.json({ success: true, extractedSkills, resumeUrl, user });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

// GET /api/users/:id/recommendations
router.get('/:id/recommendations', async (req: Request, res: Response) => {
  try {
    const recs = await getRecommendations(req.params.id);
    res.json(recs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// GET /api/users/:id/applications
router.get('/:id/applications', async (req: Request, res: Response) => {
  const apps = await prisma.application.findMany({
    where: { userId: req.params.id },
    include: { internship: true },
    orderBy: { appliedAt: 'desc' },
  });
  res.json(apps);
});

// POST /api/users/:id/applications
router.post('/:id/applications', async (req: Request, res: Response) => {
  const { internshipId } = req.body;
  const existing = await prisma.application.findFirst({
    where: { userId: req.params.id, internshipId },
  });
  if (existing) return res.status(409).json({ error: 'Already applied' });

  const app = await prisma.application.create({
    data: { userId: req.params.id, internshipId, status: 'applied' },
    include: { internship: true },
  });
  res.status(201).json(app);
});

// PATCH /api/users/:id/applications/:appId
router.patch('/:id/applications/:appId', async (req: Request, res: Response) => {
  const { status } = req.body;
  const app = await prisma.application.update({
    where: { id: req.params.appId },
    data: { status },
    include: { internship: true },
  });
  res.json(app);
});

export default router;
