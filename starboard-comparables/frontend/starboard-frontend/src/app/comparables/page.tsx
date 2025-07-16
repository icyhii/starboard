'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import dynamic from 'next/dynamic';

// Dynamically import components that use browser APIs
const Chart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
const RadarChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Radar), { ssr: false });

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface Property {
  id: string;
  address: string;
  square_feet: number;
  year_built: number;
  zoning: string;
  latitude: number;
  longitude: number;
}

interface Comparable {
  property: Property;
  score: number;
  breakdown: {
    [key: string]: number;
  };
}

export default function ComparablesPage() {
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    latitude: 41.8781,
    longitude: -87.6298,
    square_feet: 5100,
    year_built: 1982,
    zoning: 'M1'
  });

  useEffect(() => {
    setMounted(true);
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      await axios.get('http://localhost:8000/properties', { timeout: 5000 });
      setBackendConnected(true);
    } catch (error) {
      setBackendConnected(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backendConnected) {
      setError('Backend is not connected. Please ensure the FastAPI server is running.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/comparable', formData, { timeout: 30000 });
      setComparables(response.data);
      setActiveTab('overview');
    } catch (error: any) {
      setError(`API Error: ${error.response?.status || 'Network'} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'from-emerald-500 to-emerald-600';
    if (score >= 0.8) return 'from-green-500 to-green-600';
    if (score >= 0.7) return 'from-yellow-400 to-yellow-500';
    if (score >= 0.6) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return '🏆 Excellent Match';
    if (score >= 0.8) return '⭐ Very Good Match';
    if (score >= 0.7) return '👍 Good Match';
    if (score >= 0.6) return '👌 Fair Match';
    return '⚠️ Poor Match';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl mr-4"
              >
                🏭
              </motion.div>
              <h1 className="text-4xl font-bold text-white">Starboard Comparables</h1>
            </div>
            <p className="text-xl text-blue-100 mb-4">
              Interactive Property Analytics Platform
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${backendConnected ? 'text-green-300' : 'text-red-300'}`}>
                {backendConnected ? '✅ Backend Connected' : '❌ Backend Offline'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                Property Search
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-100">📍 Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-100">📍 Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-100">📐 Square Feet</label>
                  <input
                    type="number"
                    min="100"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({...formData, square_feet: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-100">📅 Year Built</label>
                  <input
                    type="number"
                    min="1800"
                    max="2024"
                    value={formData.year_built}
                    onChange={(e) => setFormData({...formData, year_built: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-100">🏙️ Zoning</label>
                  <select
                    value={formData.zoning}
                    onChange={(e) => setFormData({...formData, zoning: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="M1">M1 - Manufacturing</option>
                    <option value="M2">M2 - Manufacturing</option>
                    <option value="M3">M3 - Manufacturing</option>
                    <option value="I-1">I-1 - Industrial</option>
                    <option value="I-2">I-2 - Industrial</option>
                    <option value="C1">C1 - Commercial</option>
                    <option value="C2">C2 - Commercial</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !backendConnected}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">⚡</span>
                      Find Comparables
                    </span>
                  )}
                </motion.button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
                >
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="xl:col-span-3"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 min-h-[700px]">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full py-20"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-blue-300 border-t-white rounded-full mb-6"
                    ></motion.div>
                    <h3 className="text-2xl font-semibold text-white mb-2">🔍 Analyzing Properties</h3>
                    <p className="text-blue-200">Our AI is finding the best comparable properties...</p>
                  </motion.div>
                ) : comparables.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-20"
                  >
                    <motion.div
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-8xl mb-8"
                    >
                      🎯
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white mb-4">Ready to Discover Comparables</h3>
                    <p className="text-blue-100 max-w-md text-lg">
                      Enter your property details to discover similar industrial properties with detailed scoring.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Results Header */}
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-3xl font-bold text-white flex items-center">
                          <span className="text-4xl mr-3">🎯</span>
                          Comparable Properties
                        </h3>
                        <p className="text-blue-100 text-lg">
                          🎉 Found {comparables.length} excellent matches • Ranked by AI similarity score
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-6 py-3 rounded-full font-bold text-lg">
                        {comparables.length} Results
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 bg-white/20 rounded-xl p-2 mb-8">
                      {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'charts', label: 'Analytics', icon: '📈' },
                        { id: 'map', label: 'Map', icon: '🗺️' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${
                            activeTab === tab.id
                              ? 'bg-white text-blue-600 shadow-lg'
                              : 'text-white hover:bg-white/20'
                          }`}
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                      {activeTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6 max-h-96 overflow-y-auto pr-4"
                        >
                          {comparables.map((comp, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className={`bg-gradient-to-r ${getScoreColor(comp.score)} inline-block px-4 py-2 rounded-full text-white text-sm font-bold mb-2`}>
                                    #{index + 1} - {(comp.score * 100).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-gray-500">{getScoreLabel(comp.score)}</div>
                                </div>
                                <div className="text-right">
                                  <h4 className="text-lg font-bold text-gray-800">🏢 {comp.property.address}</h4>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                  <div className="text-2xl text-blue-600 mb-1">📐</div>
                                  <div className="text-xs text-gray-500 uppercase">Size</div>
                                  <div className="font-semibold">{comp.property.square_feet?.toLocaleString()} sq ft</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                  <div className="text-2xl text-green-600 mb-1">📅</div>
                                  <div className="text-xs text-gray-500 uppercase">Year</div>
                                  <div className="font-semibold">{comp.property.year_built}</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                  <div className="text-2xl text-purple-600 mb-1">🏙️</div>
                                  <div className="text-xs text-gray-500 uppercase">Zoning</div>
                                  <div className="font-semibold">{comp.property.zoning}</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3 text-center">
                                  <div className="text-2xl text-orange-600 mb-1">📍</div>
                                  <div className="text-xs text-gray-500 uppercase">Location</div>
                                  <div className="font-semibold text-xs">{comp.property.latitude?.toFixed(3)}, {comp.property.longitude?.toFixed(3)}</div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="text-sm font-bold text-gray-700 mb-3">🎯 Score Breakdown</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(comp.breakdown).map(([factor, score]) => (
                                    <div key={factor} className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600 capitalize">{factor.replace('_', ' ')}</span>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 rounded-full"
                                            style={{ width: `${score * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-semibold w-8">{(score * 100).toFixed(0)}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      {activeTab === 'charts' && (
                        <motion.div
                          key="charts"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                          <div className="bg-white rounded-xl p-6">
                            <h4 className="text-lg font-semibold mb-4">📊 Compatibility Scores</h4>
                            <div className="h-80">
                              {mounted && (
                                <Chart
                                  data={{
                                    labels: comparables.map((_, index) => `Property #${index + 1}`),
                                    datasets: [{
                                      label: 'Compatibility Score (%)',
                                      data: comparables.map(comp => comp.score * 100),
                                      backgroundColor: comparables.map(comp => {
                                        const score = comp.score;
                                        if (score >= 0.8) return 'rgba(59, 130, 246, 0.8)';
                                        if (score >= 0.6) return 'rgba(245, 158, 11, 0.8)';
                                        return 'rgba(239, 68, 68, 0.8)';
                                      }),
                                      borderColor: comparables.map(comp => {
                                        const score = comp.score;
                                        if (score >= 0.8) return 'rgba(59, 130, 246, 1)';
                                        if (score >= 0.6) return 'rgba(245, 158, 11, 1)';
                                        return 'rgba(239, 68, 68, 1)';
                                      }),
                                      borderWidth: 2,
                                      borderRadius: 8,
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                      y: { beginAtZero: true, max: 100 }
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          
                          {comparables.length > 0 && (
                            <div className="bg-white rounded-xl p-6">
                              <h4 className="text-lg font-semibold mb-4">📈 Top Match Factors</h4>
                              <div className="h-80">
                                {mounted && (
                                  <RadarChart
                                    data={{
                                      labels: Object.keys(comparables[0].breakdown).map(factor => 
                                        factor.replace('_', ' ').toUpperCase()
                                      ),
                                      datasets: [{
                                        label: 'Score Factors',
                                        data: Object.values(comparables[0].breakdown).map(score => score * 100),
                                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                        borderWidth: 2
                                      }]
                                    }}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: { legend: { display: false } },
                                      scales: {
                                        r: { beginAtZero: true, max: 100 }
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === 'map' && (
                        <motion.div
                          key="map"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-xl overflow-hidden"
                        >
                          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            <h4 className="text-lg font-semibold">🗺️ Property Locations</h4>
                            <p className="text-blue-100 text-sm">Interactive map showing your property and comparables</p>
                          </div>
                          <div className="h-96">
                            {mounted && typeof window !== 'undefined' && (
                              <MapContainer
                                center={[formData.latitude, formData.longitude]}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {/* Input property marker would go here */}
                                {/* Comparable markers would go here */}
                              </MapContainer>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
