"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const recommendationService_1 = require("../services/recommendationService");
const resumeParser_1 = require("../services/resumeParser");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = process.env.UPLOAD_DIR || './uploads';
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
// GET /api/users/:id/profile
router.get('/:id/profile', async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json(user);
});
// POST /api/users/profile
router.post('/profile', async (req, res) => {
    const { id, name, location, education, skills, interests, email } = req.body;
    if (!id)
        return res.status(400).json({ error: 'User id required' });
    const user = await prisma_1.prisma.user.update({
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
    (0, recommendationService_1.getRecommendations)(user.id).catch(console.error);
    res.json({ success: true, user });
});
// POST /api/users/:id/resume
router.post('/:id/resume', upload.single('resume'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;
    const ext = path_1.default.extname(req.file.originalname).toLowerCase();
    try {
        const extractedSkills = await (0, resumeParser_1.parseResume)(filePath, ext);
        const resumeUrl = `/uploads/${req.file.filename}`;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: {
                resumeUrl,
                skills: { push: extractedSkills },
            },
        });
        // Regenerate recommendations after resume parse
        (0, recommendationService_1.getRecommendations)(user.id).catch(console.error);
        res.json({ success: true, extractedSkills, resumeUrl, user });
    }
    catch (err) {
        console.error('Resume parse error:', err);
        res.status(500).json({ error: 'Failed to parse resume' });
    }
});
// GET /api/users/:id/recommendations
router.get('/:id/recommendations', async (req, res) => {
    try {
        const recs = await (0, recommendationService_1.getRecommendations)(req.params.id);
        res.json(recs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});
// GET /api/users/:id/applications
router.get('/:id/applications', async (req, res) => {
    const apps = await prisma_1.prisma.application.findMany({
        where: { userId: req.params.id },
        include: { internship: true },
        orderBy: { appliedAt: 'desc' },
    });
    res.json(apps);
});
// POST /api/users/:id/applications
router.post('/:id/applications', async (req, res) => {
    const { internshipId } = req.body;
    const existing = await prisma_1.prisma.application.findFirst({
        where: { userId: req.params.id, internshipId },
    });
    if (existing)
        return res.status(409).json({ error: 'Already applied' });
    const app = await prisma_1.prisma.application.create({
        data: { userId: req.params.id, internshipId, status: 'applied' },
        include: { internship: true },
    });
    res.status(201).json(app);
});
// PATCH /api/users/:id/applications/:appId
router.patch('/:id/applications/:appId', async (req, res) => {
    const { status } = req.body;
    const app = await prisma_1.prisma.application.update({
        where: { id: req.params.appId },
        data: { status },
        include: { internship: true },
    });
    res.json(app);
});
exports.default = router;
//# sourceMappingURL=users.js.map