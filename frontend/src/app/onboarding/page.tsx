"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = basic profile, 2 = resume
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    education: "",
    location: "",
    skills: "",
    interests: "",
  });
  
  const [file, setFile] = useState<File | null>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) {
      router.replace("/");
    }
  }, [userId, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const skillsArray = profile.skills.split(",").map(s => s.trim()).filter(Boolean);
      const interestsArray = profile.interests.split(",").map(i => i.trim()).filter(Boolean);
      
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          name: profile.name,
          education: profile.education,
          location: profile.location,
          skills: skillsArray,
          interests: interestsArray
        }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        toast.error("Failed to save profile");
      }
    } catch (err) {
      toast.error("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      router.push("/dashboard"); // Skip resume upload
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/resume`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Resume parsed successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to upload resume");
      }
    } catch (err) {
      toast.error("Error uploading resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-md w-full mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Build Your Profile</h1>
        <div className="flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#FF9933]' : 'bg-muted'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#138808]' : 'bg-muted'}`} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleProfileSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter your name"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Education Level</label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={profile.education}
                onChange={e => setProfile({...profile, education: e.target.value})}
              >
                <option value="">Select Education</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="ITI / Diploma">ITI / Diploma</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">City / District</label>
              <input
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. Pune, Jaipur, Rural MP"
                value={profile.location}
                onChange={e => setProfile({...profile, location: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Skills (comma separated)</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. Typing, Communication, Java"
                value={profile.skills}
                onChange={e => setProfile({...profile, skills: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Don't worry if you don't have many yet!</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sector Interests (comma separated)</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. IT, Healthcare, Agriculture"
                value={profile.interests}
                onChange={e => setProfile({...profile, interests: e.target.value})}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-md bg-[#000080] text-white font-medium"
            >
              {loading ? "Saving..." : "Next Step"}
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleResumeSubmit}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Upload Resume (Optional)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We'll automatically read your skills to match you with better internships. PDF or DOCX format.
              </p>
            </div>

            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <span className="font-medium text-primary">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground mb-1">Tap to select file</span>
                      <span className="text-xs text-muted-foreground">(PDF, DOCX)</span>
                    </>
                  )}
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full h-12 rounded-md bg-[#138808] text-white font-medium"
              >
                {loading ? "Parsing Resume..." : file ? "Upload & Find Matches" : "Skip for now"}
              </motion.button>
              
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(1)}
                className="w-full h-10 text-sm text-muted-foreground"
              >
                Back
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
