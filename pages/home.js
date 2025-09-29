import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

const featuredCareers = [
  {
    title: "Software Engineer",
    gradient: "bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600"
  },
  {
    title: "Data Scientist", 
    gradient: "bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600"
  },
  {
    title: "Healthcare",
    gradient: "bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600"
  },
  {
    title: "Finance",
    gradient: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold">
          <span className="text-white">X</span>
          <span className="text-green-400">Choice</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-gray-300">
          <Link to={createPageUrl('Home')} className="hover:text-white transition-colors">Home</Link>
          <Link to={createPageUrl('Profile')} className="hover:text-white transition-colors">About</Link>
          <Link to={createPageUrl('CareerRecommendations')} className="hover:text-white transition-colors">Career Paths</Link>
          <Link to={createPageUrl('Assessments')} className="hover:text-white transition-colors">Assessments</Link>
          <Link to={createPageUrl('Dashboard')} className="hover:text-white transition-colors">Resources</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-8 py-16 max-w-7xl mx-auto">
        {/* Left Side - Hero Content */}
        <div className="lg:w-1/2 mb-16 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover your perfect{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                path with AI
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Personalized guidance based on your interests, personality and strengths
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link to={createPageUrl('Welcome')}>
                <Button 
                  size="lg" 
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start your journey
                </Button>
              </Link>
              
              <Link to={createPageUrl('Dashboard')}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-400 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  More info
                </Button>
              </Link>
            </div>
            
            {/* How it works */}
            <div>
              <h3 className="text-2xl font-bold mb-8">How it works</h3>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                    1
                  </div>
                  <p className="text-gray-300">Take the assessment</p>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                    2
                  </div>
                  <p className="text-gray-300">Discover your strengths</p>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                    3
                  </div>
                  <p className="text-gray-300">Explore tailored career paths</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Featured Careers */}
        <div className="lg:w-1/2 lg:pl-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center lg:text-left">Featured careers</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {featuredCareers.map((career, index) => (
                <motion.div
                  key={career.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="cursor-pointer"
                >
                  <Card className={`p-8 h-32 flex items-end relative overflow-hidden border-none ${career.gradient} shadow-2xl`}>
                    {/* Decorative pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
                      <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white rounded-full -translate-x-6 -translate-y-6"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white relative z-10">
                      {career.title}
                    </h3>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
    </div>
  );
}
