import fs from 'fs';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

// A simple dictionary of tech/soft skills to extract
const COMMON_SKILLS = [
  'javascript', 'react', 'node.js', 'python', 'java', 'html', 'css', 'sql', 'nosql', 'mongodb', 
  'communication', 'leadership', 'teamwork', 'problem solving', 'typing', 'data entry', 'excel',
  'tally', 'marketing', 'sales', 'seo', 'customer service', 'photoshop', 'illustrator'
];

export const parseResume = async (filePath: string, ext: string): Promise<string[]> => {
  let text = '';
  
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    text = data.text.toLowerCase();
  } else if (ext === '.docx') {
    const data = await mammoth.extractRawText({ path: filePath });
    text = data.value.toLowerCase();
  } else {
    throw new Error('Unsupported file format');
  }

  // Very simple skill extraction (keyword matching)
  const extracted = COMMON_SKILLS.filter(skill => text.includes(skill));
  
  // Clean up uploaded file after parsing
  fs.unlinkSync(filePath);
  
  return extracted;
};
