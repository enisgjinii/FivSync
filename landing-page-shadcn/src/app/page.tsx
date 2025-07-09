"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect, useState } from "react";

// Enhanced Apple-inspired styles
const appleStyles = `
  .apple-gradient-text {
    background: linear-gradient(135deg, 
      #007AFF 0%, 
      #5856D6 25%, 
      #AF52DE 50%, 
      #FF2D92 75%, 
      #FF6B35 100%
    );
    background-size: 400% 400%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: apple-gradient-flow 8s ease-in-out infinite;
  }
  
  @keyframes apple-gradient-flow {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 50%; }
    50% { background-position: 50% 100%; }
    75% { background-position: 100% 0%; }
  }
  
  .apple-glass {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.125);
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.05) inset,
      0 1px 3px 0 rgba(0, 0, 0, 0.1),
      0 1px 2px -1px rgba(0, 0, 0, 0.1);
  }
  
  .dark .apple-glass {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.03) inset,
      0 1px 3px 0 rgba(0, 0, 0, 0.3),
      0 1px 2px -1px rgba(0, 0, 0, 0.3);
  }
  
  .apple-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: saturate(180%) blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.1) inset,
      0 8px 32px 0 rgba(0, 0, 0, 0.08),
      0 4px 16px 0 rgba(0, 0, 0, 0.04);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .dark .apple-card {
    background: rgba(20, 20, 20, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.05) inset,
      0 8px 32px 0 rgba(0, 0, 0, 0.6),
      0 4px 16px 0 rgba(0, 0, 0, 0.4);
  }
  
  .apple-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.15) inset,
      0 20px 60px 0 rgba(0, 0, 0, 0.12),
      0 8px 24px 0 rgba(0, 0, 0, 0.08);
  }
  
  .dark .apple-card:hover {
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.08) inset,
      0 20px 60px 0 rgba(0, 0, 0, 0.8),
      0 8px 24px 0 rgba(0, 0, 0, 0.6);
  }
  
  .apple-button {
    background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
    border: none;
    border-radius: 16px;
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.1) inset,
      0 4px 16px 0 rgba(0, 122, 255, 0.3),
      0 2px 8px 0 rgba(0, 122, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  
  .apple-button:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 0 0 0.5px rgba(255, 255, 255, 0.15) inset,
      0 8px 24px 0 rgba(0, 122, 255, 0.4),
      0 4px 12px 0 rgba(0, 122, 255, 0.3);
    background: linear-gradient(135deg, #0056CC 0%, #4A47B8 100%);
  }
  
  .apple-button:active {
    transform: translateY(0px) scale(0.98);
  }
  
  .apple-nav {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .dark .apple-nav {
    background: rgba(20, 20, 20, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .apple-floating {
    animation: apple-float 6s ease-in-out infinite;
  }
  
  @keyframes apple-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(1deg); }
    50% { transform: translateY(-20px) rotate(0deg); }
    75% { transform: translateY(-10px) rotate(-1deg); }
  }
  
  .apple-glow {
    box-shadow: 0 0 60px rgba(0, 122, 255, 0.3);
    animation: apple-pulse-glow 3s ease-in-out infinite;
  }
  
  @keyframes apple-pulse-glow {
    0%, 100% { box-shadow: 0 0 60px rgba(0, 122, 255, 0.3); }
    50% { box-shadow: 0 0 80px rgba(0, 122, 255, 0.5); }
  }
  
  .apple-text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .dark .apple-text-shadow {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .apple-input {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    transition: all 0.3s ease;
  }
  
  .dark .apple-input {
    background: rgba(40, 40, 40, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .apple-input:focus {
    border-color: #007AFF;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
  }
  
  .text-balance {
    text-wrap: balance;
  }
`;

// Enhanced animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut" as const
    } 
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut" as const
    } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const appleScaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.7,
      ease: "easeOut" as const,
      type: "spring" as const,
      stiffness: 100
    } 
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut" as const
    } 
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut" as const
    } 
  },
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch('/api/waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      let data;
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to join waitlist');
      }
      
      setIsSubmitted(true);
      setEmail("");
    } catch (err) {
      console.error("Waitlist signup error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: appleStyles }} />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-black dark:via-slate-900/95 dark:to-blue-950/20 text-foreground relative overflow-x-hidden">
        
        {/* Enhanced background elements */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-[32rem] h-[32rem] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.8, 0.4],
              x: [0, -60, 0],
              y: [0, 40, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.6, 0.2],
              x: [0, 40, 0],
              y: [0, -25, 0]
            }}
            transition={{ 
              duration: 18, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>

        {/* Enhanced Navbar */}
        <motion.nav 
          className="apple-nav w-full px-8 py-6 flex items-center justify-between sticky top-0 z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="flex items-center gap-4 font-bold text-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div className="relative apple-floating">
              <img 
                src="/logo.png" 
                alt="Fiverr Extractor Logo" 
                className="w-14 h-14 rounded-2xl object-contain apple-glow" 
              />
            </motion.div>
            <span className="apple-gradient-text text-2xl font-black tracking-tight apple-text-shadow">
              Fiverr Extractor
            </span>
          </motion.div>
          
          <div className="hidden lg:flex gap-8 text-slate-600 dark:text-slate-400 font-medium">
            {[
              { name: "Features", href: "#features" },
              { name: "Pricing", href: "#pricing" },
              { name: "About", href: "#about" },
              { name: "Contact", href: "#contact" }
            ].map((item, i) => (
              <motion.a 
                key={item.name}
                href={item.href} 
                className="hover:text-slate-900 dark:hover:text-white transition-all duration-300 relative group px-4 py-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
              >
                {item.name}
                <motion.div 
                  className="absolute -bottom-1 left-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-8 transition-all duration-300 transform -translate-x-1/2"
                />
              </motion.a>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <ThemeToggle />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="hidden md:flex apple-button text-white font-semibold px-8 py-3 text-base"
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </motion.nav>

        {/* Enhanced Hero Section */}
        <motion.section
          className="flex flex-col lg:flex-row items-center justify-center px-8 py-24 relative z-10 min-h-[85vh]"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div className="text-center lg:text-left" variants={slideInLeft}>
                <motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight"
                  variants={fadeIn}
                >
                  <motion.span
                    className="block mb-2 apple-text-shadow"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                  >
                    Never Lose Your
                  </motion.span>
                  <motion.span 
                    className="apple-gradient-text block mb-2 relative"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1 }}
                  >
                    Fiverr Conversations
                    <motion.div 
                      className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.span>
                  <motion.span
                    className="block apple-text-shadow"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1 }}
                  >
                    Again
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl mb-12 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium text-balance"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  Secure, export, and analyze your Fiverr conversations with our powerful Chrome extension. 
                  Never worry about losing important client communications again.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="apple-button text-white font-semibold px-12 py-6 text-lg"
                      onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Get Started Free
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="apple-glass border-slate-200 dark:border-slate-700 font-semibold px-12 py-6 text-lg"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Enhanced demo conversation */}
              <motion.div className="relative" variants={slideInRight}>
                <motion.div 
                  className="apple-card p-8 max-w-md mx-auto"
                  variants={appleScaleIn}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">FC</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Freelancer Chat</h4>
                        <p className="text-slate-500 text-sm">Active conversation</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Client message */}
                      <motion.div 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex-shrink-0"></div>
                        <div className="apple-glass p-4 rounded-2xl rounded-tl-lg max-w-xs">
                          <p className="text-sm">Hi! I loved your portfolio. Can you help me with my project?</p>
                        </div>
                      </motion.div>
                      
                      {/* Your message */}
                      <motion.div 
                        className="flex gap-3 justify-end"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 }}
                      >
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl rounded-tr-lg max-w-xs">
                          <p className="text-white text-sm">Absolutely! I&apos;d be happy to help. What kind of project are you working on?</p>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
                      </motion.div>
                      
                      {/* Status indicator */}
                      <motion.div 
                        className="flex items-center gap-2 text-xs text-slate-500 justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                        <span>Conversation saved & analyzed</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Enhanced Waitlist Section */}
        <motion.section 
          id="waitlist"
          className="py-32 px-8 relative z-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <motion.div
                className="inline-block mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Badge className="apple-glass border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-6 py-2 text-base font-medium">
                  🚀 Early Access Available
                </Badge>
              </motion.div>
              
              <motion.h2 
                className="text-5xl md:text-6xl font-black mb-8 apple-gradient-text apple-text-shadow"
                variants={fadeIn}
              >
                Join the Revolution
              </motion.h2>
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed text-balance"
                variants={fadeIn}
              >
                Be among the first to experience the future of freelancer communication management. 
                Get exclusive early access and shape the product with your feedback.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg mx-auto"
            >
              {!isSubmitted ? (
                <div className="apple-card p-8">
                  <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="apple-input w-full px-6 py-4 text-lg"
                        disabled={isSubmitting}
                      />
                      {error && (
                        <motion.p 
                          className="text-red-500 text-sm mt-3 text-left"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {error}
                        </motion.p>
                      )}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="apple-button w-full text-white font-semibold px-8 py-4 text-lg"
                      >
                        {isSubmitting ? (
                          <motion.div className="flex items-center gap-3">
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Joining Waitlist...
                          </motion.div>
                        ) : (
                          "Join Early Access"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="apple-card p-10"
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-3xl font-bold text-green-600 mb-4">Welcome to the Future!</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                    You&apos;re officially on our early access list. We&apos;ll send you exclusive updates and first access to new features.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="apple-glass border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 font-medium px-6 py-3"
                  >
                    Add Another Email
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Enhanced benefits grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-20 grid md:grid-cols-3 gap-8"
            >
              {[
                { 
                  icon: "🎯", 
                  title: "Early Access", 
                  desc: "Be the first to experience new features and improvements",
                  gradient: "from-blue-500 to-cyan-500"
                },
                { 
                  icon: "💎", 
                  title: "Exclusive Updates", 
                  desc: "Get insider tips, tutorials, and product roadmap insights",
                  gradient: "from-purple-500 to-pink-500"
                },
                { 
                  icon: "🚀", 
                  title: "Priority Support", 
                  desc: "Direct access to our team and priority customer support",
                  gradient: "from-orange-500 to-red-500"
                }
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="apple-card p-8 text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl`}>
                    {benefit.icon}
                  </div>
                  <h4 className="font-bold text-xl mb-3">{benefit.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-32 px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-20">
              <motion.h2 
                className="text-5xl md:text-6xl font-black mb-8 apple-gradient-text apple-text-shadow" 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeInUp}
              >
                Powerful Features for Freelancers
              </motion.h2>
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance" 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeIn}
              >
                Everything you need to manage and backup your Fiverr conversations with style and intelligence
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { badge: "Export", title: "Multiple Export Formats", desc: "Export your conversations as PDF, Excel, Markdown, JSON, or CSV files. Choose the format that works best for your workflow.", icon: "📄", gradient: "from-blue-500 to-cyan-500" },
                { badge: "Bulk", title: "Bulk Export", desc: "Export all your conversations at once with our intelligent bulk export feature. Save time and keep everything organized.", icon: "📦", gradient: "from-purple-500 to-pink-500" },
                { badge: "Analytics", title: "Conversation Analytics", desc: "Get deep insights into your conversations with detailed analytics. Track patterns and client interactions over time.", icon: "📊", gradient: "from-green-500 to-emerald-500" },
                { badge: "AI", title: "AI-Powered Analysis", desc: "Advanced AI analysis using GROQ Cloud AI. Get sentiment analysis, action items, communication insights, and strategic recommendations.", icon: "🤖", gradient: "from-orange-500 to-red-500" },
                { badge: "Attachments", title: "Attachment Management", desc: "View and download all attachments from your conversations. Keep files organized and easily accessible.", icon: "📎", gradient: "from-indigo-500 to-purple-500" },
                { badge: "Privacy", title: "Privacy First", desc: "All processing happens locally in your browser. Your conversations never leave your device and stay completely private.", icon: "🔒", gradient: "from-slate-500 to-gray-500" },
                { badge: "Easy", title: "Easy to Use", desc: "Simple Chrome extension that works seamlessly with your existing Fiverr account. No complex setup required.", icon: "✨", gradient: "from-yellow-500 to-orange-500" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="group"
                >
                  <div className="apple-card p-8 h-full">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        transition: { type: "spring", stiffness: 400 }
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <Badge variant="outline" className="apple-glass border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 w-fit mb-4 mx-auto block text-center">
                      {feature.badge}
                    </Badge>
                    <h3 className="text-xl font-bold text-center mb-4 apple-text-shadow">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enhanced AI Features Section */}
        <section className="py-32 px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-20">
              <motion.h2 
                className="text-5xl md:text-6xl font-black mb-8 apple-gradient-text apple-text-shadow" 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeInUp}
              >
                AI-Powered Conversation Analysis
              </motion.h2>
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance" 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeIn}
              >
                Leverage advanced AI to gain deeper insights into your client conversations and improve your business relationships
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid lg:grid-cols-2 gap-20 items-center mb-20"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.div variants={slideInLeft}>
                <motion.h3 
                  className="text-4xl font-black mb-8 apple-gradient-text apple-text-shadow"
                  variants={fadeIn}
                >
                  🤖 Smart Analysis with GROQ AI
                </motion.h3>
                <motion.p 
                  className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed"
                  variants={fadeIn}
                >
                  Our AI-powered analysis goes beyond simple export. Get comprehensive insights into your conversations, 
                  including sentiment analysis, action item extraction, and communication effectiveness evaluation.
                </motion.p>
                
                <motion.div 
                  className="space-y-6"
                  variants={staggerContainer}
                >
                  {[
                    { icon: "💭", title: "Sentiment Analysis", desc: "Understand the emotional tone and sentiment of conversations", gradient: "from-blue-500 to-cyan-500" },
                    { icon: "📋", title: "Action Items", desc: "Automatically extract tasks, deadlines, and commitments", gradient: "from-purple-500 to-pink-500" },
                    { icon: "📊", title: "Communication Insights", desc: "Get feedback on communication effectiveness and professionalism", gradient: "from-green-500 to-emerald-500" },
                    { icon: "🎯", title: "Strategic Recommendations", desc: "Receive actionable advice for better client relationships", gradient: "from-orange-500 to-red-500" },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={fadeInUp}
                      className="apple-card p-6"
                      whileHover={{ scale: 1.02, x: 10 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2 apple-text-shadow">{feature.title}</h4>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div variants={slideInRight} className="relative">
                <motion.div
                  className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="apple-card p-8 relative z-10">
                  <h4 className="text-2xl font-bold text-center mb-8 apple-text-shadow">AI Analysis Preview</h4>
                  <div className="space-y-6">
                    <motion.div 
                      className="apple-glass p-6 rounded-2xl border border-blue-200 dark:border-blue-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <span className="text-lg">💭</span>
                        </div>
                        <span className="font-bold text-base">Sentiment Analysis</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Overall: Positive | Tone: Professional | Engagement: High</p>
                    </motion.div>
                    
                    <motion.div 
                      className="apple-glass p-6 rounded-2xl border border-purple-200 dark:border-purple-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <span className="text-lg">📋</span>
                        </div>
                        <span className="font-bold text-base">Action Items Found</span>
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <li>• Deliver final design by Friday</li>
                        <li>• Send invoice for project completion</li>
                        <li>• Schedule follow-up meeting</li>
                      </ul>
                    </motion.div>
                    
                    <motion.div 
                      className="apple-glass p-6 rounded-2xl border border-green-200 dark:border-green-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <span className="text-lg">📊</span>
                        </div>
                        <span className="font-bold text-base">Communication Score</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <motion.div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ delay: 1.1, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-sm font-bold">85%</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="apple-button text-white font-semibold px-12 py-6 text-lg">
                  Try AI Analysis
                </Button>
              </motion.div>
              <p className="text-slate-500 mt-6 text-base">
                Powered by GROQ Cloud AI • Privacy-focused • Real-time analysis
              </p>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Pricing Section */}
        <section id="pricing" className="py-32 px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-20">
              <motion.h2 
                className="text-5xl md:text-6xl font-black mb-8 apple-gradient-text apple-text-shadow" 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeInUp}
              >
                Simple, Transparent Pricing
              </motion.h2>
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance" 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeIn}
              >
                Choose the plan that works best for your freelancing needs
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Free",
                  price: "",
                  features: ["✅ Markdown Export", "✅ JSON Export", "✅ Basic Conversation View", "✅ Contact List", "❌ PDF Export", "❌ Excel Export", "❌ Bulk Export", "❌ Analytics", "❌ AI Analysis", "❌ Sentiment Analysis", "❌ Action Items", "❌ Communication Insights"],
                  buttonText: "Get Started Free",
                  popular: false
                },
                {
                  title: "Pro",
                  price: "$4.99/mo",
                  features: ["✅ Everything in Free", "✅ PDF Export", "✅ Excel Export", "✅ Bulk Export All", "✅ Conversation Analytics", "✅ AI-Powered Analysis", "✅ Sentiment Analysis", "✅ Action Item Extraction", "✅ Communication Insights", "✅ Strategic Recommendations", "✅ Attachment Management", "✅ Priority Support"],
                  buttonText: "Upgrade to Pro",
                  popular: true
                }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -10,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="relative"
                >
                  {plan.popular && (
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Badge className="apple-button border-none text-white font-semibold px-6 py-2">
                        Most Popular
                      </Badge>
                    </motion.div>
                  )}
                  <div className={`apple-card p-10 h-full ${
                    plan.popular ? "ring-2 ring-blue-500/20" : ""
                  }`}>
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-black mb-2 apple-text-shadow">
                        {plan.title} 
                      </h3>
                      {plan.price && (
                        <div className="apple-gradient-text text-4xl font-black mb-2">{plan.price}</div>
                      )}
                    </div>
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((feature, j) => (
                        <motion.li 
                          key={j}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * j }}
                          className="text-slate-600 dark:text-slate-300 text-base leading-relaxed"
                        >
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full py-6 text-lg font-semibold ${plan.popular ? "apple-button text-white" : "apple-glass border-slate-200 dark:border-slate-700"}`}
                      >
                        {plan.buttonText}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <motion.section 
          className="py-32 px-8 text-center relative z-10" 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={fadeInUp}
        >
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              className="text-5xl md:text-6xl font-black mb-8 apple-gradient-text apple-text-shadow" 
              variants={fadeIn}
            >
              Ready to Secure Your Conversations?
            </motion.h2>
            <motion.p 
              className="mb-12 text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance" 
              variants={fadeIn}
            >
              Join thousands of freelancers who trust Fiverr Conversation Extractor to backup their important client communications and gain valuable insights.
            </motion.p>
            <motion.div 
              whileHover={{ scale: 1.05, y: -3 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="apple-button text-white font-semibold px-16 py-8 text-xl">
                Get Started Now
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Footer */}
        <footer className="py-20 px-8 apple-glass relative z-10 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-16 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                  <img src="/logo.png" alt="Fiverr Extractor Logo" className="w-12 h-12 rounded-2xl object-contain apple-glow" />
                  <h4 className="font-black text-xl apple-text-shadow">Fiverr Extractor</h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  Secure your Fiverr conversations with powerful export tools and AI-driven insights.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <h4 className="font-bold text-xl mb-6 apple-text-shadow">Features</h4>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  {["Export Formats", "Bulk Export", "AI Analytics", "Privacy First"].map((item, i) => (
                    <motion.li 
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors text-base">
                        {item}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center md:text-right"
              >
                <h4 className="font-bold text-xl mb-6 apple-text-shadow">Support</h4>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  {["Contact", "Privacy Policy", "Terms of Service"].map((item, i) => (
                    <motion.li 
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: -5 }}
                    >
                      <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors text-base">
                        {item}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
            
            <Separator className="bg-slate-200 dark:bg-slate-800 mb-8" />
            
            <motion.div 
              className="text-center text-slate-500 text-base"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              &copy; {new Date().getFullYear()} Fiverr Conversation Extractor. All rights reserved.
            </motion.div>
          </div>
        </footer>
      </div>
    </>
  );
}
