"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, easeOut, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";
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
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

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
        className="w-full px-6 py-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="flex items-center gap-2 font-bold text-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.div 
            className="inline-block w-8 h-8 bg-primary rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <span className="gradient-text">Fiverr Extractor</span>
        </motion.div>
        <div className="hidden md:flex gap-6 text-muted-foreground font-medium">
          {["Features", "Pricing", "Contact"].map((item, i) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="hover:text-foreground transition-colors relative group"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {item}
              <motion.div 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </motion.a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button className="md:hidden" variant="outline" size="sm">Menu</Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="flex flex-col md:flex-row items-center justify-between px-6 py-24 relative z-10"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.div className="flex-1 max-w-xl" variants={slideInLeft}>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
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
          <motion.p className="text-lg mb-8 text-muted-foreground" variants={fadeIn}>
            Extract, backup, and analyze your Fiverr conversations with powerful export tools. Keep your client communications safe and organized.
          </motion.p>
          <motion.div className="flex gap-4 flex-wrap" variants={fadeIn}>
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg btn-hover-effect">
                Learn More
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button size="lg" variant="outline" className="border-border hover:bg-accent shadow-lg btn-hover-effect">
                View Pricing
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div 
          className="flex-1 flex justify-center mt-12 md:mt-0" 
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
            <Card className="w-[350px] relative z-10 border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Inbox Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <motion.div 
                      className="inline-block w-10 h-10 bg-primary rounded-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                    <div>
                      <div className="font-semibold">Client Name <span className="text-xs text-muted-foreground ml-2">2:30 PM</span></div>
                      <div className="text-sm text-muted-foreground">Hi! I loved your work on the previous project...</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-start gap-3 flex-row-reverse"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <motion.div 
                      className="inline-block w-10 h-10 bg-secondary rounded-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                    <div className="text-right">
                      <div className="font-semibold">You <span className="text-xs text-muted-foreground ml-2">2:32 PM</span></div>
                      <div className="text-sm text-muted-foreground">Thank you! I&apos;m glad you liked it. What can I help you with?</div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-4 gradient-text" 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={fadeInUp}
          >
            Powerful Features for Freelancers
          </motion.h2>
          <motion.p 
            className="text-center text-muted-foreground mb-12" 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={fadeIn}
          >
            Everything you need to manage and backup your Fiverr conversations
          </motion.p>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
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
                <Card className="h-full border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-primary/50">
                  <CardHeader>
                    <motion.div 
                      className="text-3xl mb-2"
                      animate={floatingAnimation.animate}
                      transition={{ delay: i * 0.1 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <Badge variant="outline" className="border-border text-muted-foreground w-fit">
                      {feature.badge}
                    </Badge>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-4 gradient-text" 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={fadeInUp}
          >
            Simple Pricing
          </motion.h2>
          <motion.p 
            className="text-center text-muted-foreground mb-12" 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={fadeIn}
          >
            Choose the plan that works best for you
          </motion.p>
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
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
                <Card className={`h-full border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""
                }`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {plan.title} {plan.price && <span className="text-primary ml-2">{plan.price}</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, j) => (
                        <motion.li 
                          key={j}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * j }}
                          className="text-muted-foreground"
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
                        className={`w-full ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-border hover:bg-accent"} btn-hover-effect`}
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
        className="py-24 px-6 text-center relative z-10" 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }} 
        variants={fadeInUp}
      >
        <div className="max-w-2xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold mb-4 gradient-text" 
            variants={fadeIn}
          >
            Ready to Secure Your Conversations?
          </motion.h2>
          <motion.p 
            className="mb-8 text-lg text-muted-foreground" 
            variants={fadeIn}
          >
            Join thousands of freelancers who trust Fiverr Conversation Extractor to backup their important client communications.
          </motion.p>
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Button size="lg" className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg btn-hover-effect">
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </motion.section>



      {/* Footer */}
      <footer className="py-12 px-6 bg-card/50 text-card-foreground relative z-10 border-t border-border/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="font-bold text-lg mb-2">Fiverr Extractor</h4>
            <p className="text-muted-foreground">Secure your Fiverr conversations with powerful export tools.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-bold text-lg mb-2">Features</h4>
            <ul className="space-y-1 text-muted-foreground">
              {["Export Formats", "Bulk Export", "Analytics", "Privacy"].map((item, i) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <a href="#features" className="hover:text-foreground transition-colors">{item}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bold text-lg mb-2">Support</h4>
            <ul className="space-y-1 text-muted-foreground">
              {["Contact", "Privacy Policy", "Terms of Service"].map((item, i) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <a href="#" className="hover:text-foreground transition-colors">{item}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
        <Separator className="bg-border/50 mb-6" />
        <motion.div 
          className="text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          &copy; 2024 Fiverr Conversation Extractor. All rights reserved.
        </motion.div>
      </footer>
    </div>
  );
}
