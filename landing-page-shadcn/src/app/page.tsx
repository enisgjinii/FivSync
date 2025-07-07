"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { motion, easeOut } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect, useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: easeOut } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const,
      type: "spring" as const,
      stiffness: 200
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
      // Call the actual waitlist API
      console.log('Sending waitlist signup request for:', email);
      const response = await fetch('https://fiv-sync.vercel.app/api/waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      let data;
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
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
      
      console.log("Waitlist signup successful:", email);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-background/90 text-foreground relative overflow-x-hidden font-inter">
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        className="w-full px-6 py-6 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="flex items-center gap-3 font-bold text-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.div 
            className="inline-block w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl mr-3 shadow-lg"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <span className="gradient-text text-2xl">Fiverr Extractor</span>
        </motion.div>
        
        <div className="hidden lg:flex gap-8 text-muted-foreground font-medium">
          {[
            { name: "Features", href: "#features" },
            { name: "Pricing", href: "#pricing" },
            { name: "About", href: "#about" },
            { name: "Contact", href: "#contact" }
          ].map((item, i) => (
            <motion.a 
              key={item.name}
              href={item.href} 
              className="hover:text-foreground transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-accent/50"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {item.name}
              <motion.div 
                className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 group-hover:w-full transition-all duration-300 transform -translate-x-1/2"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </motion.a>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ThemeToggle />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-6 py-2"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="lg:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="sm"
              className="border-border hover:bg-accent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="flex flex-col lg:flex-row items-center justify-center px-6 py-32 relative z-10 min-h-[80vh]"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div className="text-center lg:text-left" variants={slideInLeft}>
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
                variants={fadeIn}
              >
                Never Lose Your{" "}
                <motion.span 
                  className="gradient-text"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
                >
                  Fiverr Conversations
                </motion.span>{" "}
                Again
              </motion.h1>
              <motion.p className="text-xl mb-10 text-muted-foreground max-w-2xl mx-auto lg:mx-0" variants={fadeIn}>
                Extract, backup, and analyze your Fiverr conversations with powerful export tools. Keep your client communications safe and organized.
              </motion.p>
              <motion.div className="flex gap-6 flex-wrap justify-center lg:justify-start" variants={fadeIn}>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg btn-hover-effect px-8 py-6 text-lg">
                    Learn More
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button size="lg" variant="outline" className="border-border hover:bg-accent shadow-lg btn-hover-effect px-8 py-6 text-lg">
                    View Pricing
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex justify-center" 
              initial="hidden" 
              animate="show" 
              variants={slideInRight}
            >
              <motion.div 
                initial="hidden" 
                animate="show" 
                variants={bounceIn} 
                whileHover={{ scale: 1.03, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
              >
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Card className="w-[400px] relative z-10 border-border/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">Inbox Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <motion.div 
                          className="inline-block w-12 h-12 bg-primary rounded-full"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        />
                        <div className="flex-1">
                          <div className="font-semibold">Client Name <span className="text-xs text-muted-foreground ml-2">2:30 PM</span></div>
                          <div className="text-sm text-muted-foreground">Hi! I loved your work on the previous project...</div>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-start gap-4 flex-row-reverse"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <motion.div 
                          className="inline-block w-12 h-12 bg-secondary rounded-full"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        />
                        <div className="flex-1 text-right">
                          <div className="font-semibold">You <span className="text-xs text-muted-foreground ml-2">2:32 PM</span></div>
                          <div className="text-sm text-muted-foreground">Thank you! I&apos;m glad you liked it. What can I help you with?</div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <motion.section 
        id="waitlist"
        className="py-24 px-6 relative z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              🚀 Coming Soon
            </Badge>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 gradient-text"
              variants={fadeIn}
            >
              Join the Waitlist
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              variants={fadeIn}
            >
              Be among the first to experience the future of Fiverr conversation management. 
              Get early access and exclusive updates.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary transition-all duration-300"
                    disabled={isSubmitting}
                  />
                  {error && (
                    <motion.p 
                      className="text-red-500 text-sm mt-2 text-left"
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
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-8 py-4 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <motion.div className="flex items-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Joining Waitlist...
                      </motion.div>
                    ) : (
                      "Join Waitlist"
                    )}
                  </Button>
                </motion.div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-8"
              >
                <motion.div
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                                  <h3 className="text-2xl font-bold text-green-600 mb-2">You&apos;re on the list!</h3>
                <p className="text-muted-foreground mb-4">
                  Thanks for joining our waitlist. We&apos;ll notify you as soon as we launch!
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                >
                  Join Another Email
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: "🎯", title: "Early Access", desc: "Be the first to try new features" },
              { icon: "💎", title: "Exclusive Updates", desc: "Get insider information and tips" },
              { icon: "🚀", title: "Priority Support", desc: "Direct access to our development team" }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 gradient-text" 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }} 
              variants={fadeInUp}
            >
              Powerful Features for Freelancers
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto" 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }} 
              variants={fadeIn}
            >
              Everything you need to manage and backup your Fiverr conversations
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
              { badge: "Export", title: "Multiple Export Formats", desc: "Export your conversations as PDF, Excel, Markdown, JSON, or CSV files. Choose the format that works best for your needs.", icon: "📄" },
              { badge: "Bulk", title: "Bulk Export", desc: "Export all your conversations at once with our bulk export feature. Save time and keep everything organized.", icon: "📦" },
              { badge: "Analytics", title: "Conversation Analytics", desc: "Get insights into your conversations with detailed analytics. Track message patterns and client interactions.", icon: "📊" },
              { badge: "Attachments", title: "Attachment Management", desc: "View and download all attachments from your conversations. Keep files organized and accessible.", icon: "📎" },
              { badge: "Privacy", title: "Privacy First", desc: "All processing happens locally in your browser. Your conversations never leave your device and stay completely private.", icon: "🔒" },
              { badge: "Easy", title: "Easy to Use", desc: "Simple Chrome extension that works seamlessly with your existing Fiverr account. No complex setup required.", icon: "✨" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card className="h-full border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-primary/50 p-6">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="text-4xl mb-4"
                      animate={floatingAnimation.animate}
                      transition={{ delay: i * 0.1 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <Badge variant="outline" className="border-border text-muted-foreground w-fit mb-3">
                      {feature.badge}
                    </Badge>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 gradient-text" 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }} 
              variants={fadeInUp}
            >
              Simple Pricing
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto" 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }} 
              variants={fadeIn}
            >
              Choose the plan that works best for you
            </motion.p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Free",
                price: "",
                features: ["✅ Markdown Export", "✅ JSON Export", "✅ Basic Conversation View", "✅ Contact List", "❌ PDF Export", "❌ Excel Export", "❌ Bulk Export", "❌ Analytics"],
                buttonText: "Get Started Free",
                popular: false
              },
              {
                title: "Pro",
                price: "$9.99/mo",
                features: ["✅ Everything in Free", "✅ PDF Export", "✅ Excel Export", "✅ Bulk Export All", "✅ Conversation Analytics", "✅ Attachment Management", "✅ Advanced Insights", "✅ Priority Support"],
                buttonText: "Upgrade to Pro",
                popular: true
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.03, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="relative"
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Badge className="bg-primary text-primary-foreground border-primary">
                      Most Popular
                    </Badge>
                  </motion.div>
                )}
                <Card className={`h-full border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 ${
                  plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""
                }`}>
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-3xl">
                      {plan.title} {plan.price && <span className="text-primary ml-2">{plan.price}</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, j) => (
                        <motion.li 
                          key={j}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * j }}
                          className="text-muted-foreground text-base"
                        >
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full py-6 text-lg ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-border hover:bg-accent"} btn-hover-effect`}
                      >
                        {plan.buttonText}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-32 px-6 text-center relative z-10" 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }} 
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6 gradient-text" 
            variants={fadeIn}
          >
            Ready to Secure Your Conversations?
          </motion.h2>
          <motion.p 
            className="mb-10 text-xl text-muted-foreground max-w-3xl mx-auto" 
            variants={fadeIn}
          >
            Join thousands of freelancers who trust Fiverr Conversation Extractor to backup their important client communications.
          </motion.p>
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Button size="lg" className="text-xl px-10 py-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg btn-hover-effect">
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-card/50 text-card-foreground relative z-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <h4 className="font-bold text-xl mb-4">Fiverr Extractor</h4>
              <p className="text-muted-foreground text-base leading-relaxed">Secure your Fiverr conversations with powerful export tools.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <h4 className="font-bold text-xl mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                {["Export Formats", "Bulk Export", "Analytics", "Privacy"].map((item, i) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <a href="#features" className="hover:text-foreground transition-colors text-base">{item}</a>
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
              <h4 className="font-bold text-xl mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                {["Contact", "Privacy Policy", "Terms of Service"].map((item, i) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <a href="#" className="hover:text-foreground transition-colors text-base">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
          <Separator className="bg-border/50 mb-8" />
          <motion.div 
            className="text-center text-muted-foreground text-base"
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
  );
}
