import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.resolve(__dirname, '../../../data/internships.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('No internships.csv found. Skipping seed.');
    return;
  }

  const results: any[] = [];
  
  fs.createReadStream(csvPath)
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
        await prisma.internship.deleteMany({}); // clear existing
        const inserted = await prisma.internship.createMany({
          data: results,
          skipDuplicates: true,
        });
        console.log(`Seeded ${inserted.count} internships from CSV.`);
      } catch (err) {
        console.error('Seed error:', err);
      } finally {
        await prisma.$disconnect();
      }
    });
}

main();
