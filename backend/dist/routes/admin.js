"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = require("csv-parse");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// POST /api/admin/internships/upload
router.post('/internships/upload', upload.single('file'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No CSV file provided' });
    const results = [];
    fs_1.default.createReadStream(req.file.path)
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
            await prisma_1.prisma.internship.createMany({
                data: results,
                skipDuplicates: true,
            });
            fs_1.default.unlinkSync(req.file.path); // clean up
            res.json({ success: true, count: results.length });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to insert internships' });
        }
    });
});
exports.default = router;
//# sourceMappingURL=admin.js.map