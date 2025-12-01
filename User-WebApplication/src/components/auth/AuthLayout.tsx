/**
 * Auth Layout Component
 * Provides a consistent layout wrapper for all authentication pages
 */

import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 flex flex-col lg:flex-row">
      {/* Left Section - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-ancient-600 via-ancient-700 to-ancient-800">
        {/* Decorative patterns */}
        <div className="absolute inset-0 bg-ancient-pattern opacity-10" />
        
        {/* Om Symbol Animation */}
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 text-9xl text-saffron-400/20 font-sanskrit"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          ॐ
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-saffron-400/20 to-saffron-600/20 blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-lotus-400/20 to-lotus-600/20 blur-xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-5xl font-ancient font-bold text-saffron-400 mb-2">
                श्लोकयुग
              </h1>
              <h2 className="text-2xl font-elegant text-ancient-200">
                ShlokaYug
              </h2>
            </div>

            {/* Tagline */}
            <p className="text-ancient-200 text-lg font-elegant max-w-md mx-auto leading-relaxed mb-8">
              Embark on a sacred journey through the timeless wisdom of Sanskrit.
              Discover ancient verses that illuminate the path to knowledge.
            </p>

            {/* Sanskrit Quote */}
            <div className="bg-ancient-800/50 backdrop-blur-sm rounded-2xl p-6 border border-ancient-600/30">
              <p className="text-saffron-300 font-sanskrit text-xl mb-2">
                विद्या ददाति विनयं
              </p>
              <p className="text-ancient-300 text-sm font-elegant italic">
                "Knowledge gives humility"
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ancient-900/50 to-transparent" />
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-ancient font-bold text-ancient-700">
              श्लोकयुग
            </h1>
            <p className="text-ancient-600 text-sm">ShlokaYug</p>
          </div>

          {/* Back Button */}
          {showBackButton && (
            <Link
              to="/"
              className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full border border-ancient-200 text-ancient-600 hover:bg-ancient-50 hover:border-ancient-300 transition-all duration-300 mb-6 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          )}

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-ancient font-bold text-ancient-800 mb-2">
              {title}
            </h2>
            <p className="text-ancient-600 font-elegant">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
