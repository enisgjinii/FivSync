"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState, Suspense } from "react";

function PaymentCancelContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-black dark:via-slate-900/95 dark:to-blue-950/20">
      <div className="flex-1 flex items-center justify-center px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="apple-card p-12">
            {/* Cancel Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <motion.svg
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </motion.svg>
            </motion.div>

            {/* Cancel Message */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-black mb-4 apple-text-shadow"
            >
              Payment Cancelled
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed"
            >
              Your payment was cancelled. No charges were made to your account. You can still try our free features or upgrade later.
            </motion.p>

            {/* Free Features Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="apple-glass p-6 rounded-xl mb-8"
            >
              <h3 className="font-bold text-lg mb-4 apple-text-shadow">Continue with Free Features</h3>
              <ul className="text-left space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Markdown Export
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  JSON Export
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Basic Conversation View
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Contact List
                </li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="apple-button w-full text-white font-semibold px-8 py-4 text-lg"
                  onClick={() => window.location.href = '/#pricing'}
                >
                  Try Again
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="apple-glass w-full border-slate-200 dark:border-slate-700 font-medium px-8 py-4"
                  onClick={() => window.location.href = '/'}
                >
                  Continue with Free
                </Button>
              </motion.div>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 p-4 apple-glass rounded-xl"
            >
              <p className="text-xs text-slate-500">
                Need help? Contact our support team at{' '}
                <button
                  onClick={() => window.open('mailto:support@fiverr-extractor.com')}
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  support@fiverr-extractor.com
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Apple-inspired styles */}
      <style jsx global>{`
        .apple-glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }
        
        .dark .apple-glass {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
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
        }
        
        .dark .apple-card {
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .apple-button {
          background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
          border: none;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .apple-button:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #0056CC 0%, #4A47B8 100%);
        }
        
        .apple-text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dark .apple-text-shadow {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
} 