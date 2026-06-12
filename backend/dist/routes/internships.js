"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// GET /api/internships
router.get('/', async (req, res) => {
    const { sector, location, search } = req.query;
    const internships = await prisma_1.prisma.internship.findMany({
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
router.get('/:id', async (req, res) => {
    const internship = await prisma_1.prisma.internship.findUnique({
        where: { id: req.params.id },
    });
    if (!internship)
        return res.status(404).json({ error: 'Internship not found' });
    res.json(internship);
});
exports.default = router;
//# sourceMappingURL=internships.js.map