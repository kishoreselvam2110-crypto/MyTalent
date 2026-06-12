import axios from 'axios';
import { prisma } from '../lib/prisma';

export const getRecommendations = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const internships = await prisma.internship.findMany();
  if (internships.length === 0) return [];

  // Attempt to call Python microservice
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/recommend`, {
      user: {
        skills: user.skills,
        interests: user.interests,
        education: user.education
      },
      internships: internships.map(i => ({
        id: i.id,
        title: i.title,
        sector: i.sector,
        requiredSkills: i.requiredSkills,
      }))
    });

    const recommendedIds = response.data.recommendations.map((r: any) => r.id);
    
    // Sort internships by the order returned by ML service
    return internships.filter(i => recommendedIds.includes(i.id))
                      .sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id))
                      .slice(0, 5); // top 5
  } catch (err) {
    console.error('Python ML service failed, falling back to basic matching', err);
    
    // Fallback: Simple set intersection
    const userTokens = new Set([...user.skills, ...user.interests].map(s => s.toLowerCase()));
    
    const scored = internships.map(i => {
      const internshipTokens = [...i.requiredSkills, i.sector].map(s => s.toLowerCase());
      let score = 0;
      for (const t of internshipTokens) {
        if (userTokens.has(t)) score++;
      }
      return { ...i, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  }
};
