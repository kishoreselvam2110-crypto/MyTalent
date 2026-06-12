"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type Internship = {
  id: string;
  title: string;
  sector: string;
  location: string;
  duration: string;
  stipend: string;
  description: string;
  requiredSkills: string[];
  postedBy: string;
};

export default function InternshipDetails() {
  const params = useParams();
  const router = useRouter();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    fetch(`http://localhost:5000/api/internships/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setInternship(data);
      })
      .catch(() => toast.error("Failed to load details"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please login first");
      router.push("/");
      return;
    }

    setApplying(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId: internship?.id }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Application submitted successfully!");
        router.push("/tracker");
      } else {
        toast.error(data.error || "Failed to apply");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading details...</div>;
  if (!internship) return <div className="p-8 text-center">Internship not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 max-w-3xl w-full mx-auto p-4 py-8 space-y-6 pb-24"
    >
      <button onClick={() => router.back()} className="text-muted-foreground flex items-center gap-2 mb-4 hover:text-foreground">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{internship.title}</h1>
        <p className="text-muted-foreground mb-6">{internship.postedBy}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Sector</p>
            <p className="font-medium">{internship.sector}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Location</p>
            <p className="font-medium">{internship.location}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">{internship.duration}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Stipend</p>
            <p className="font-medium text-[#138808]">{internship.stipend}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{internship.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.requiredSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex gap-3 max-w-3xl mx-auto z-50">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          disabled={applying}
          className="flex-1 h-12 bg-[#FF9933] text-white font-semibold rounded-xl flex items-center justify-center disabled:opacity-50"
        >
          {applying ? "Applying..." : "Apply Now"}
        </motion.button>
        
        <motion.a 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href={`https://wa.me/919999999999?text=Hi! I need help preparing for the ${internship.title} role.`}
          target="_blank"
          className="px-6 h-12 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          <span className="hidden sm:inline">Talk to Mentor</span>
        </motion.a>
      </div>
    </motion.div>
  );
}
