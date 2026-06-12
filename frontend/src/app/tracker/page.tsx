"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  internship: {
    id: string;
    title: string;
    sector: string;
    location: string;
  };
};

export default function Tracker() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }
    
    fetch(`http://localhost:5000/api/users/${userId}/applications`)
      .then(res => res.json())
      .then(data => setApps(data))
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, [userId, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl w-full mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <button onClick={() => router.push("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground">
          Go to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl border">
          <p className="text-muted-foreground">You haven't applied to any internships yet.</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            Find Internships
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg leading-tight cursor-pointer hover:underline" onClick={() => router.push(`/internship/${app.internship.id}`)}>
                  {app.internship.title}
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground flex gap-4">
                <span>{app.internship.sector}</span>
                <span>•</span>
                <span>{app.internship.location}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Applied on {new Date(app.appliedAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
