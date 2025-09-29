
import React, { useState, useEffect } from "react";
import { User, UserAssessmentResult, Assessment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User as UserIcon, 
  Brain, 
  Target, 
  Heart,
  Lightbulb,
  TrendingUp,
  Award,
  BookOpen,
  Zap // Add new icon
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = await User.me();
      const results = await UserAssessmentResult.filter({ user_email: currentUser.email });
      const allAssessments = await Assessment.list();
      
      setUser(currentUser);
      setUserResults(results);
      setAssessments(allAssessments);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  const getInsightsByCategory = (category) => {
    return userResults
      .filter(result => {
        const assessment = assessments.find(a => a.id === result.assessment_id);
        return assessment?.category === category;
      })
      .map(result => result.insights)
      .filter(Boolean);
  };

  const getCognitiveInsights = () => {
    return userResults
      .filter(result => {
        const assessment = assessments.find(a => a.id === result.assessment_id);
        return assessment?.category === 'cognitive_skills';
      })
      .map(result => result.insights)
      .filter(Boolean);
  };

  const getAllTraits = () => {
    const allTraits = userResults
      .flatMap(result => result.insights?.primary_traits || [])
      .filter(Boolean);
    return [...new Set(allTraits)]; // Remove duplicates
  };

  const getAllStrengths = () => {
    const allStrengths = userResults
      .flatMap(result => result.insights?.strengths || [])
      .filter(Boolean);
    return [...new Set(allStrengths)];
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = assessments.length > 0 
    ? Math.round((userResults.length / assessments.length) * 100) 
    : 0;
    
  const cognitiveInsights = getCognitiveInsights();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            {user?.full_name || "Your Profile"}
          </h1>
          <p className="text-lg text-gray-600">
            Discover the insights about your personality, strengths, and interests
          </p>
        </div>

        {/* Completion Status */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Assessment Progress</h3>
                <p className="text-gray-600">
                  {userResults.length} of {assessments.length} assessments completed
                </p>
              </div>
              <div className="w-full md:w-64">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-500">Completion</span>
                  <span className="text-lg font-bold text-gray-900">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {userResults.length > 0 ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-lg bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Personality Traits</p>
                      <p className="text-2xl font-bold text-gray-900">{getAllTraits().length}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-lg bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Key Strengths</p>
                      <p className="text-2xl font-bold text-gray-900">{getAllStrengths().length}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-lg bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assessments</p>
                      <p className="text-2xl font-bold text-gray-900">{userResults.length}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Personality Traits */}
            {getAllTraits().length > 0 && (
              <Card className="border-none shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Brain className="w-6 h-6 text-blue-600" />
                    Your Personality Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {getAllTraits().slice(0, 8).map((trait, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-4 py-2 text-base bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            {getAllStrengths().length > 0 && (
              <Card className="border-none shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Target className="w-6 h-6 text-green-600" />
                    Your Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {getAllStrengths().slice(0, 8).map((strength, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-4 py-2 text-base bg-green-100 text-green-800 border-green-200"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cognitive Skills & Development */}
            {cognitiveInsights.length > 0 && (
              <Card className="border-none shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Zap className="w-6 h-6 text-indigo-600" />
                    Cognitive Skill Development
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cognitiveInsights[0].development_areas?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">Areas for Growth:</h4>
                      <div className="flex flex-wrap gap-3">
                        {cognitiveInsights[0].development_areas.map((area, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="px-4 py-2 text-base bg-indigo-100 text-indigo-800 border-indigo-200"
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {cognitiveInsights[0].summary && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-indigo-900">Actionable Advice:</h4>
                      <p className="text-indigo-800">{cognitiveInsights[0].summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Insights */}
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Recent Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userResults.slice(-3).map((result, index) => {
                  const assessment = assessments.find(a => a.id === result.assessment_id);
                  return result.insights?.summary ? (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-purple-700 border-purple-300">
                          {assessment?.title || 'Assessment'}
                        </Badge>
                      </div>
                      <p className="text-gray-700">{result.insights.summary}</p>
                    </div>
                  ) : null;
                })}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-none shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
              <p className="text-gray-600 mb-6">
                Take your first assessment to begin discovering insights about your personality, 
                strengths, and interests.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Take Your First Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
