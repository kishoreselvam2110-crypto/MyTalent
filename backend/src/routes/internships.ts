import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/internships
router.get('/', async (req: Request, res: Response) => {
  const { sector, location, search } = req.query;
  
  const internships = await prisma.internship.findMany({
    where: {
      ...(sector && { sector: String(sector) }),
      ...(location && { location: String(location) }),
      ...(search && {
        OR: [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(internships);
});

// GET /api/internships/:id
router.get('/:id', async (req: Request, res: Response) => {
  const internship = await prisma.internship.findUnique({
    where: { id: req.params.id as string },
  });

  if (!internship) return res.status(404).json({ error: 'Internship not found' });
  res.json(internship);
});

export default router;
