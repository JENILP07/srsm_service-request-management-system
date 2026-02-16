"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import HeroBackground from "@/components/3d/HeroBackground";
import { TiltWrapper } from "@/components/effects/Tilt";

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
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-background overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <TiltWrapper className="w-full max-w-5xl" intensity={5}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex w-full bg-card rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[650px] border border-border"
        >
            
            {/* Left side panel - 3D Scene */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="absolute inset-0 z-0">
                    <HeroBackground />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="relative z-10 p-16 space-y-8 pointer-events-none"
                >
                    <h1 className="text-5xl font-extrabold text-white leading-[1.15] tracking-tight drop-shadow-md">
                    Welcome to<br />TaskPathPal
                    </h1>
                    <p className="text-white/90 text-lg drop-shadow-sm max-w-md">
                        Streamline your service requests and boost productivity with our comprehensive management system.
                    </p>
                </motion.div>
            </div>

            {/* Right side panel - Login Form */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 w-full lg:w-1/2 bg-card relative z-10">
            <div className="w-full max-w-[360px] space-y-8">
                <div className="text-center space-y-2">
                <motion.div
                    key={isSignup ? "signup" : "login"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-3xl font-black text-foreground tracking-wider uppercase">
                    {isSignup ? "User Signup" : "User Login"}
                    </h2>
                </motion.div>
                <div className="h-1 w-20 bg-primary mx-auto rounded-full opacity-20"></div>
                </div>

                <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    >
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    </motion.div>
                )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {isSignup && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 group overflow-hidden"
                    >
                        <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Full Name"
                            aria-label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="pl-12 h-14 bg-background border-border rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                        />
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2 group">
                    <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="email"
                        placeholder="Username"
                        aria-label="Username or Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 h-14 bg-background border-border rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="password"
                        placeholder="Password"
                        aria-label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-12 h-14 bg-background border-border rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {isSignup && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 group overflow-hidden"
                    >
                        <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="pl-12 h-14 bg-background border-border rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                        />
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>

                {!isSignup && (
                    <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between px-2"
                    >
                    <div className="flex items-center space-x-2.5 group cursor-pointer">
                        <Checkbox id="remember" className="rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all group-hover:border-primary" />
                        <Label htmlFor="remember" className="text-muted-foreground font-medium cursor-pointer text-sm group-hover:text-primary transition-colors">Remember me</Label>
                    </div>
                    <a href="#" className="link-primary text-sm hover:underline">
                        Forgot password?
                    </a>
                    </motion.div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>PROCESSING...</span>
                    </div>
                    ) : (
                    <span className="flex items-center gap-2">
                        {isSignup ? "SIGN UP" : "LOGIN"}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </span>
                    )}
                </Button>
                </form>

                <div className="text-center pt-2">
                <button
                    onClick={() => {
                    setIsSignup(!isSignup);
                    setError(null);
                    }}
                    className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <span className="link-primary underline decoration-2 underline-offset-4">
                    {isSignup ? "Login" : "Sign up"}
                    </span>
                </button>
                </div>
            </div>
            </div>
        </motion.div>
      </TiltWrapper>
    </div>
  );
}