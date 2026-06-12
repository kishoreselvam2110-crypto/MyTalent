"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type Internship = {
  id: string;
  title: string;
  sector: string;
  location: string;
  stipend: string;
  score?: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }
    
    // Fetch profile for skills and roadmap
    fetch(`http://localhost:5000/api/users/${userId}/profile`)
      .then(res => res.json())
      .then(data => {
        if (data.skills) setUserSkills(data.skills);
      });

    // Fetch recommendations
    fetch(`http://localhost:5000/api/users/${userId}/recommendations`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data || []);
      })
      .catch(() => toast.error("Failed to load recommendations"))
      .finally(() => setLoading(false));
  }, [userId, router]);

  // Derived Roadmap Steps dynamically based on missing skills or generic action plan
  const generateRoadmap = () => {
    if (!recommendations.length) return ["Complete your profile", "Explore available sectors", "Apply for internships"];
    
    const topRec = recommendations[0];
    const steps = [
      `Learn basic tools for ${topRec.sector}`,
      `Prepare portfolio for ${topRec.title}`,
      `Apply before deadline for ${topRec.location} roles`
    ];
    return steps;
  };

  const roadmapSteps = generateRoadmap();

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl w-full mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Dashboard <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
        </h1>
        <p className="text-muted-foreground text-sm italic">"Smart choices for bright futures"</p>
      </div>

      {/* Career Roadmap - Dynamic */}
      <div className="mb-8 bg-card border rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Your Career Roadmap</h2>
        <div className="relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted z-0 hidden sm:block"></div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            {roadmapSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="flex-1 bg-background border rounded-lg p-3 text-sm flex items-start gap-3 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF9933] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  {idx + 1}
                </div>
                <p>{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recommended for You</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl border">
          <p className="text-muted-foreground">No recommendations yet. Try updating your profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/internship/${rec.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg leading-tight">{rec.title}</h3>
                {rec.score !== undefined && (
                  <span className="text-xs font-medium px-2 py-1 bg-[#138808]/10 text-[#138808] rounded-full">
                    {Math.round(rec.score * 100) > 0 ? `${Math.round(rec.score * 100)}% Match` : "Recommended"}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {rec.sector}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {rec.location}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {rec.stipend}
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
              >
                View Details
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
