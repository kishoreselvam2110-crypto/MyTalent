"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = mobile, 2 = otp
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle mobile submit
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("OTP Sent!");
        setStep(2);
        
        // Auto-fill mock OTP after 1s for prototype
        setTimeout(() => {
          if (process.env.NODE_ENV !== "production") {
            setOtp(data.devOtp || "123456");
          }
        }, 1000);

      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // WebOTP API integration
  useEffect(() => {
    if (step === 2 && 'credentials' in navigator) {
      const ac = new AbortController();
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      } as any).then((otpParams: any) => {
        if (otpParams && otpParams.code) {
          setOtp(otpParams.code);
        }
      }).catch(err => {
        console.log("WebOTP not supported or failed:", err);
      });
      return () => ac.abort();
    }
  }, [step]);

  // Auto-submit OTP when it reaches 6 digits
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Login Successful!");
        localStorage.setItem("userId", data.user.id);
        
        // Redirect to onboarding if new, else dashboard
        setTimeout(() => {
          if (!data.user.education || !data.user.location) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        }, 500);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ashoka Chakra subtle watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-96 h-96 animate-[spin_60s_linear_infinite]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M50,5 L50,95 M5,50 L95,50 M18,18 L82,82 M18,82 L82,18" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-sm z-10 relative"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to MyTalent</h1>
          <p className="text-muted-foreground">Smart choices for bright futures</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter 10 digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || mobile.length !== 10}
              className="w-full h-10 rounded-md bg-[#000080] text-white font-medium disabled:opacity-50 transition-colors hover:bg-[#000080]/90 flex items-center justify-center"
            >
              {loading ? "Sending..." : "Send OTP"}
            </motion.button>
          </form>
        ) : (
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleVerifyOtp} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter OTP sent to +91 {mobile}</label>
              <input
                type="text"
                required
                maxLength={6}
                className="flex h-12 w-full text-center text-xl tracking-widest rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || otp.length !== 6}
              className="w-full h-10 rounded-md bg-[#138808] text-white font-medium disabled:opacity-50 transition-colors hover:bg-[#138808]/90 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : "Verify & Login"}
            </motion.button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-muted-foreground hover:text-foreground mt-2"
            >
              Change mobile number
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
