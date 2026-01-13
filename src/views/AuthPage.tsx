"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AuthPage() {
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) return toast.error(error.message);
        toast.success("Account created!");
      } else {
        // Login logic
        const { error } = await signIn(email, password);
        if (error) return toast.error("Invalid credentials");
        toast.success("Welcome back!");
      }
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-in fade-in zoom-in duration-500 ring-1 ring-slate-900/5">
      {/* HEADER */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ServiceDesk</h1>
      </div>

      {/* TITLE */}
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isSignup ? "Create an account" : "Welcome back"}
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          {isSignup
            ? "Enter your details to get started"
            : "Please enter your details to sign in"}
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 ml-1">Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300"
          />
        </div>

        {isSignup && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Please wait...</span>
            </div>
          ) : isSignup ? (
            "Create Account"
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* TOGGLE */}
      <div className="mt-8 text-center bg-slate-50 rounded-xl py-4 border border-slate-100">
        <p className="text-sm text-slate-500 font-medium">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 font-medium">
        <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
        <span className="text-slate-300">•</span>
        <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
        <span className="text-slate-300">•</span>
        <a href="#" className="hover:text-slate-600 transition-colors">Help</a>
      </div>
    </div>
  );
}
