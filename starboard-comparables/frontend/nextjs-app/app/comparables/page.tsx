'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import dynamic from 'next/dynamic';

// Dynamic imports for client-side only components
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinecap="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const MapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

interface PropertyData {
  latitude: number;
  longitude: number;
  square_feet: number;
  year_built: number;
  zoning: string;
}

interface ComparableProperty {
  id: string;
  score: number;
  breakdown: {
    location: number;
    size: number;
    year_built: number;
    zoning: number;
  };
  property: {
    id: string;
    address: string;
    square_feet: number;
    year_built: number;
    zoning: string;
    latitude: number;
    longitude: number;
  };
}

const ComparablesPage: React.FC = () => {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    latitude: 41.8781,
    longitude: -87.6298,
    square_feet: 5100,
    year_built: 1982,
    zoning: 'M1'
  });

  const [comparables, setComparables] = useState<ComparableProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'map'>('overview');

  // Chart.js registration
  useEffect(() => {
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  }, []);

  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get('http://localhost:8000/properties', { timeout: 5000 });
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ComparableProperty[]>(
        'http://localhost:8000/comparable',
        propertyData,
        { timeout: 30000 }
      );
      setComparables(response.data);
      setActiveTab('overview');
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? `API Error: ${error.response?.status} - ${error.message}`
          : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score >= 0.8) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (score >= 0.7) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (score >= 0.6) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-orange-500 to-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 0.9) return 'Excellent Match';
    if (score >= 0.8) return 'Very Good Match';
    if (score >= 0.7) return 'Good Match';
    if (score >= 0.6) return 'Fair Match';
    return 'Poor Match';
  };

  const chartData = {
    labels: comparables.map((_, index) => `#${index + 1}`),
    datasets: [
      {
        label: 'Compatibility Score (%)',
        data: comparables.map(comp => comp.score * 100),
        backgroundColor: comparables.map(comp => {
          const score = comp.score;
          if (score >= 0.8) return 'rgba(34, 197, 94, 0.8)';
          if (score >= 0.6) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(239, 68, 68, 0.8)';
        }),
        borderColor: comparables.map(comp => {
          const score = comp.score;
          if (score >= 0.8) return 'rgba(34, 197, 94, 1)';
          if (score >= 0.6) return 'rgba(245, 158, 11, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any) {
            const index = tooltipItems[0].dataIndex;
            return comparables[index]?.property.address || '';
          },
          label: function(context: any) {
            return `Score: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="glass-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <motion.a
                href="/"
                className="flex items-center mr-6 text-gray-600 hover:text-gray-800 transition-colors"
                whileHover={{ x: -5 }}
              >
                <BackIcon />
                <span className="ml-2">Back to Home</span>
              </motion.a>
              <BuildingIcon />
              <h1 className="text-4xl font-bold text-gray-800 ml-3">
                Find Comparables
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enter your property details below to discover the most similar industrial properties 
              with detailed scoring and interactive visualizations
            </p>
            
            {/* Backend Status */}
            <div className="mt-6 inline-flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`} />
              <span className="text-sm text-gray-600">
                {backendStatus === 'connected' ? 'Backend Connected' :
                 backendStatus === 'disconnected' ? 'Backend Offline' : 'Checking Connection...'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center mb-6">
                <SearchIcon />
                <h2 className="text-2xl font-bold text-gray-800 ml-2">Property Search</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <LocationIcon />
                    <span className="ml-2">Latitude</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={propertyData.latitude}
                    onChange={(e) => setPropertyData({...propertyData, latitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <LocationIcon />
                    <span className="ml-2">Longitude</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={propertyData.longitude}
                    onChange={(e) => setPropertyData({...propertyData, longitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <BuildingIcon />
                    <span className="ml-2">Square Feet</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={propertyData.square_feet}
                    onChange={(e) => setPropertyData({...propertyData, square_feet: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon />
                    <span className="ml-2">Year Built</span>
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max="2024"
                    value={propertyData.year_built}
                    onChange={(e) => setPropertyData({...propertyData, year_built: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <BuildingIcon />
                    <span className="ml-2">Zoning</span>
                  </label>
                  <select
                    value={propertyData.zoning}
                    onChange={(e) => setPropertyData({...propertyData, zoning: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  disabled={loading || backendStatus !== 'connected'}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading || backendStatus !== 'connected'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg'
                  }`}
                  whileHover={loading ? {} : { scale: 1.02 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-3" />
                      Searching for Comparables...
                    </div>
                  ) : (
                    'Find Comparable Properties'
                  )}
                </motion.button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="glass-white rounded-2xl p-6 shadow-xl min-h-[600px]">
              {comparables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl mb-6 text-gray-300"
                  >
                    🏭
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready to Find Comparables</h3>
                  <p className="text-gray-500 max-w-md">
                    Enter property details in the form to discover similar industrial properties 
                    with detailed scoring and beautiful visualizations.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Results Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Comparable Properties</h3>
                      <p className="text-gray-600">Found {comparables.length} matches • Ranked by similarity</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                      {comparables.length} Results
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {[
                      { id: 'overview', label: 'Overview', icon: BuildingIcon },
                      { id: 'charts', label: 'Charts', icon: ChartIcon },
                      { id: 'map', label: 'Map', icon: MapIcon }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <tab.icon />
                        <span className="ml-2">{tab.label}</span>
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
                        transition={{ duration: 0.3 }}
                        className="space-y-4 max-h-96 overflow-y-auto"
                      >
                        {comparables.map((comp, index) => (
                          <motion.div
                            key={comp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 card-hover"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold mb-2 ${getScoreColor(comp.score)}`}>
                                  #{index + 1} - {(comp.score * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">{getScoreLabel(comp.score)}</div>
                              </div>
                              <div className="text-right">
                                <h4 className="text-lg font-bold text-gray-800">{comp.property.address}</h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center text-gray-600">
                                <BuildingIcon />
                                <span className="ml-2 text-sm">{comp.property.square_feet?.toLocaleString() || 'N/A'} sq ft</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <CalendarIcon />
                                <span className="ml-2 text-sm">Built {comp.property.year_built}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <BuildingIcon />
                                <span className="ml-2 text-sm">{comp.property.zoning}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <LocationIcon />
                                <span className="ml-2 text-sm">{comp.property.latitude?.toFixed(3)}, {comp.property.longitude?.toFixed(3)}</span>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown:</h5>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(comp.breakdown).map(([factor, score]) => (
                                  <div key={factor} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 capitalize">
                                      {factor.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${score * 100}%` }}
                                          transition={{ duration: 1, delay: index * 0.1 }}
                                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                        />
                                      </div>
                                      <span className="text-xs font-semibold text-gray-700 w-8">
                                        {(score * 100).toFixed(0)}%
                                      </span>
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
                        transition={{ duration: 0.3 }}
                        className="chart-container"
                      >
                        <Chart data={chartData} options={chartOptions} />
                      </motion.div>
                    )}

                    {activeTab === 'map' && (
                      <motion.div
                        key="map"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-96 rounded-lg overflow-hidden"
                      >
                        {typeof window !== 'undefined' && (
                          <MapContainer
                            center={[propertyData.latitude, propertyData.longitude]}
                            zoom={13}
                            className="w-full h-full"
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* Input property marker */}
                            <Marker position={[propertyData.latitude, propertyData.longitude]}>
                              <Popup>
                                <div className="text-sm">
                                  <strong>🎯 Input Property</strong><br/>
                                  📐 {propertyData.square_feet.toLocaleString()} sq ft<br/>
                                  📅 Built {propertyData.year_built}<br/>
                                  🏙️ {propertyData.zoning}
                                </div>
                              </Popup>
                            </Marker>

                            {/* Comparable markers */}
                            {comparables.map((comp, index) => (
                              comp.property.latitude && comp.property.longitude && (
                                <Marker 
                                  key={comp.id}
                                  position={[comp.property.latitude, comp.property.longitude]}
                                >
                                  <Popup>
                                    <div className="text-sm">
                                      <strong>#{index + 1} {comp.property.address}</strong><br/>
                                      ⭐ Score: {(comp.score * 100).toFixed(1)}%<br/>
                                      📐 {comp.property.square_feet?.toLocaleString() || 'N/A'} sq ft<br/>
                                      📅 Built {comp.property.year_built}<br/>
                                      🏙️ {comp.property.zoning}
                                    </div>
                                  </Popup>
                                </Marker>
                              )
                            ))}
                          </MapContainer>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ComparablesPage;
