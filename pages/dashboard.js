import React, { useState, useEffect, useCallback } from "react";
import { User, Assessment, UserAssessmentResult } from "../src/entities/all";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Progress } from "../src/components/ui/progress";
import { Badge } from "../src/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../src/utils";
import { 
  BookOpen, 
  Target, 
  User as UserIcon, 
  TrendingUp,
  Clock,
  Award,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import MarketTrends from "../src/components/dashboard/MarketTrends"; 

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await User.me();

      // Redirection logic
      if (!currentUser.academic_info?.education_status) {
        navigate(createPageUrl("Welcome"));
        return; 
      }

      const allAssessments = await Assessment.list();
      const results = await UserAssessmentResult.filter({ user_email: currentUser.email });
      
      setUser(currentUser);
      setAssessments(allAssessments);
      setUserResults(results);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // On error, like not being logged in, redirect to Welcome page
      navigate(createPageUrl("Welcome"));
    } finally {
        setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getCompletionPercentage = () => {
    if (assessments.length === 0) return 0;
    return Math.round((userResults.length / assessments.length) * 100);
  };

  const getNextAssessment = () => {
    const completedIds = userResults.map(r => r.assessment_id);
    return assessments.find(a => !completedIds.includes(a.id));
  };

  const getRecentInsights = () => {
    return userResults
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 3)
      .filter(r => r.insights?.primary_traits);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Explorer'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Continue your journey of self-discovery and unlock your potential
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assessment Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{getCompletionPercentage()}%</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={getCompletionPercentage()} className="h-2 mb-2" />
              <p className="text-sm text-gray-600">
                {userResults.length} of {assessments.length} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Insights Gained</p>
                  <p className="text-2xl font-bold text-gray-900">{getRecentInsights().length}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                New insights from recent assessments
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Career Matches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.career_recommendations?.length || 0}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Potential career paths identified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Assessment */}
          {getNextAssessment() && (
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <Clock className="w-5 h-5" />
                  Continue Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-900">{getNextAssessment().title}</h3>
                  <p className="text-sm text-blue-700 mt-1">{getNextAssessment().description}</p>
                  <Badge variant="secondary" className="mt-2 bg-blue-200 text-blue-800">
                    {getNextAssessment().duration_minutes} minutes
                  </Badge>
                </div>
                <Link to={createPageUrl("Assessments")}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Insights */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-900">
                <TrendingUp className="w-5 h-5" />
                Recent Discoveries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getRecentInsights().length > 0 ? (
                <div className="space-y-3">
                  {getRecentInsights().slice(0, 2).map((result, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {result.insights.primary_traits?.slice(0, 2).map((trait, i) => (
                          <Badge key={i} variant="outline" className="text-green-700 border-green-300">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link to={createPageUrl("Profile")}>
                    <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-green-700 text-sm">Complete assessments to discover insights about yourself</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Trends */}
        <MarketTrends />

        {/* Call to Action */}
        {getCompletionPercentage() < 100 && (
          <Card className="border-none shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Discover More?</h2>
              <p className="text-purple-100 mb-6">
                Complete more assessments to unlock deeper insights about your personality, 
                strengths, and ideal career paths.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Assessments")}>
                  <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                    Take Assessment
                  </Button>
                </Link>
                <Link to={createPageUrl("CareerRecommendations")}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                    Explore Careers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
