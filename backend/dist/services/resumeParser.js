"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResume = void 0;
const fs_1 = __importDefault(require("fs"));
const pdfParse = require('pdf-parse');
const mammoth_1 = __importDefault(require("mammoth"));
// A simple dictionary of tech/soft skills to extract
const COMMON_SKILLS = [
    'javascript', 'react', 'node.js', 'python', 'java', 'html', 'css', 'sql', 'nosql', 'mongodb',
    'communication', 'leadership', 'teamwork', 'problem solving', 'typing', 'data entry', 'excel',
    'tally', 'marketing', 'sales', 'seo', 'customer service', 'photoshop', 'illustrator'
];
const parseResume = async (filePath, ext) => {
    let text = '';
    if (ext === '.pdf') {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text.toLowerCase();
    }
    else if (ext === '.docx') {
        const data = await mammoth_1.default.extractRawText({ path: filePath });
        text = data.value.toLowerCase();
    }
    else {
        throw new Error('Unsupported file format');
    }
    // Very simple skill extraction (keyword matching)
    const extracted = COMMON_SKILLS.filter(skill => text.includes(skill));
    // Clean up uploaded file after parsing
    fs_1.default.unlinkSync(filePath);
    return extracted;
};
exports.parseResume = parseResume;
//# sourceMappingURL=resumeParser.js.map