'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="glass-white rounded-3xl p-12 shadow-2xl">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-8xl mb-8"
            >
              🏭
            </motion.div>
            
            <h1 className="text-6xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Starboard Comparables
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Industrial Property Analytics Platform powered by AI. Discover the best comparable 
              properties in Cook County with intelligent scoring, beautiful visualizations, and real-time data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">AI-Powered Scoring</h3>
                <p className="text-gray-600 text-sm">Advanced algorithms analyze multiple factors to find perfect matches</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Beautiful Visualizations</h3>
                <p className="text-gray-600 text-sm">Interactive charts, maps, and detailed breakdowns</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Real-Time Data</h3>
                <p className="text-gray-600 text-sm">Live connection to Cook County open data sources</p>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/comparables"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 text-lg"
              >
                Start Finding Comparables →
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="glass-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🔍 How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Enter Property Details</h3>
                  <p className="text-gray-600 text-sm">Input location, size, year built, and zoning information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI Analysis</h3>
                  <p className="text-gray-600 text-sm">Our algorithms score properties based on multiple factors</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">View Results</h3>
                  <p className="text-gray-600 text-sm">Explore ranked comparables with interactive visualizations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📈 Features</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Multi-factor similarity scoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Interactive maps with property locations</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Real-time charts and visualizations</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Detailed scoring breakdowns</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Cook County industrial properties</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Export capabilities for reporting</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 glass-white rounded-2xl p-8 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">&lt;2s</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Properties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Availability</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
