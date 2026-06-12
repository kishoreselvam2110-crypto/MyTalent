"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parse_1 = require("csv-parse");
const prisma = new client_1.PrismaClient();
async function main() {
    const csvPath = path_1.default.resolve(__dirname, '../../../data/internships.csv');
    if (!fs_1.default.existsSync(csvPath)) {
        console.log('No internships.csv found. Skipping seed.');
        return;
    }
    const results = [];
    fs_1.default.createReadStream(csvPath)
        .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true }))
        .on('data', (data) => {
        results.push({
            title: data.title,
            sector: data.sector,
            requiredSkills: data.requiredSkills.split(',').map((s) => s.trim()),
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
        }
        catch (err) {
            console.error('Seed error:', err);
        }
        finally {
            await prisma.$disconnect();
        }
    });
}
main();
//# sourceMappingURL=seed.js.map