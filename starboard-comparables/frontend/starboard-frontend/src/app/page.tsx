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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="relative">
            {/* Floating Factory Icon */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl mb-8"
            >
              🏭
            </motion.div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Starboard
              </span>
              <br />
              <span className="text-white">Comparables</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              🚀 Next-Generation Property Analytics Platform with AI-Powered Comparable Analysis
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {[
                { icon: "📊", title: "AI Analytics", desc: "Smart property scoring" },
                { icon: "🗺️", title: "Interactive Maps", desc: "Visual location analysis" },
                { icon: "⚡", title: "Real-time Data", desc: "Live property insights" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
            
            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/comparables"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="mr-2">🎯</span>
                Start Property Analysis
                <span className="ml-2">→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            🔥 How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: "📍", title: "Input Property", desc: "Enter location, size, and details" },
              { step: "2", icon: "🤖", title: "AI Analysis", desc: "Our AI finds comparable properties" },
              { step: "3", icon: "📈", title: "Get Results", desc: "Interactive charts, maps & insights" }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + 0.2 * index, duration: 0.6 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <div className="text-4xl mb-3">{step.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-blue-100 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Powered by Modern Tech</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-100">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Chart.js", "Leaflet", "FastAPI", "Framer Motion"].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7 + 0.1 * index, duration: 0.4 }}
                className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
