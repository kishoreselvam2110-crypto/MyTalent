import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse';
import { prisma } from '../lib/prisma';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/admin/internships/upload
router.post('/internships/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No CSV file provided' });

  const results: any[] = [];
  
  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, skip_empty_lines: true }))
    .on('data', (data) => {
      results.push({
        title: data.title,
        sector: data.sector,
        requiredSkills: data.requiredSkills.split(',').map((s: string) => s.trim()),
        location: data.location,
        duration: data.duration,
        stipend: data.stipend,
        applyLink: data.applyLink,
        description: data.description,
        postedBy: data.postedBy,
      });
    })
    .on('end', async () => {
      try {
        await prisma.internship.createMany({
          data: results,
          skipDuplicates: true,
        });
        
        fs.unlinkSync(req.file!.path); // clean up
        res.json({ success: true, count: results.length });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to insert internships' });
      }
    });
});

export default router;
