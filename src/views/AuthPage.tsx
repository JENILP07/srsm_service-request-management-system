"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const { signIn, signUp, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          toast.error("Passwords do not match");
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
          toast.error(error.message);
          return;
        }
        toast.success("Account created!");
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError("Invalid credentials");
          toast.error("Invalid credentials");
          return;
        }
        toast.success("Welcome back!");
      }
      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-gray-50/50">
      <div className="flex w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[650px] border border-white/50 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left side panel - Gradient background & Shapes */}
        <div className="hidden lg:flex flex-col justify-center p-16 w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-primary to-indigo-600">
          <div className="relative z-10 space-y-8">
            <h1 className="text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              Welcome to<br />TaskPathPal
            </h1>
          </div>
          
          {/* Decorative Elements */}
          {/* Bottom left blob */}
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl mix-blend-overlay" />
          
          {/* Geometric Shapes */}
          <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
             {/* Diagonal stripe 1 */}
            <div 
              className="absolute bottom-[15%] -left-[10%] w-[120%] h-32 bg-white/5 -rotate-[35deg] transform origin-bottom-left backdrop-blur-sm"
            />
             {/* Diagonal stripe 2 */}
            <div 
              className="absolute bottom-[25%] -left-[10%] w-[120%] h-16 bg-indigo-400/20 -rotate-[35deg] transform origin-bottom-left"
            />
            {/* Accent shape */}
            <div 
              className="absolute bottom-[8%] left-[15%] w-32 h-32 bg-blue-500/30 rounded-3xl -rotate-12 transform blur-sm"
            />
          </div>
        </div>

        {/* Right side panel - Login Form */}
        <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 w-full lg:w-1/2 bg-white relative">
          <div className="w-full max-w-[360px] space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-wider uppercase">
                {isSignup ? "User Signup" : "User Login"}
              </h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full opacity-20"></div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignup && (
                <div className="space-y-2 group">
                  <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Full Name"
                      aria-label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="Username"
                    aria-label="Username or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="Password"
                    aria-label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                  />
                </div>
              </div>

              {isSignup && (
                <div className="space-y-2 group">
                  <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      aria-label="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                  </div>
                </div>
              )}

              {!isSignup && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2.5 group cursor-pointer">
                    <Checkbox id="remember" className="rounded-md border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all group-hover:border-primary" />
                    <Label htmlFor="remember" className="text-gray-500 font-medium cursor-pointer text-sm group-hover:text-primary transition-colors">Remember me</Label>
                  </div>
                  <a href="#" className="text-primary hover:text-indigo-700 text-sm font-semibold transition-colors hover:underline decoration-2 underline-offset-4">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-primary hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  isSignup ? "SIGN UP" : "LOGIN"
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError(null);
                }}
                className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors"
              >
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span className="text-primary underline underline-offset-4 hover:text-indigo-700">
                  {isSignup ? "Login" : "Sign up"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}