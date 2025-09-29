import React, { useState, useEffect } from "react";
import { Assessment, UserAssessmentResult, User } from "../src/entities/all";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Progress } from "../src/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play,
  Brain,
  Heart,
  Lightbulb,
  Target,
  Users,
  Zap // New icon for cognitive skills
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AssessmentQuiz from "../components/assessments/AssessmentQuiz";

const categoryIcons = {
  personality: Brain,
  strengths: Target,
  interests: Heart,
  values: Lightbulb,
  learning_style: BookOpen,
  cognitive_skills: Zap // Add new category icon
};

const categoryColors = {
  personality: "bg-blue-100 text-blue-800 border-blue-200",
  strengths: "bg-green-100 text-green-800 border-green-200", 
  interests: "bg-red-100 text-red-800 border-red-200",
  values: "bg-yellow-100 text-yellow-800 border-yellow-200",
  learning_style: "bg-purple-100 text-purple-800 border-purple-200",
  cognitive_skills: "bg-indigo-100 text-indigo-800 border-indigo-200" // Add new category color
};

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      const allAssessments = await Assessment.list();
      const results = await UserAssessmentResult.filter({ user_email: currentUser.email });
      
      setUser(currentUser);
      setAssessments(allAssessments);
      setUserResults(results);
    } catch (error) {
      console.error("Error loading assessments:", error);
    }
    setLoading(false);
  };

  const isCompleted = (assessmentId) => {
    return userResults.some(r => r.assessment_id === assessmentId);
  };

  const handleStartAssessment = (assessment) => {
    setCurrentAssessment(assessment);
  };

  const handleAssessmentComplete = () => {
    setCurrentAssessment(null);
    loadData(); // Reload to update completion status
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

  if (currentAssessment) {
    return (
      <AssessmentQuiz 
        assessment={currentAssessment}
        onComplete={handleAssessmentComplete}
        onCancel={() => setCurrentAssessment(null)}
      />
    );
  }

  const completedCount = userResults.length;
  const totalCount = assessments.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Self-Discovery Assessments</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore different aspects of your personality through scientifically-backed assessments.
            Each quiz reveals unique insights about who you are and what drives you.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h3>
                <p className="text-gray-600">
                  {completedCount} of {totalCount} assessments completed
                </p>
              </div>
              <div className="w-full md:w-64">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-lg font-bold text-gray-900">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {assessments.map((assessment, index) => {
              const IconComponent = categoryIcons[assessment.category] || BookOpen;
              const completed = isCompleted(assessment.id);
              
              return (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-none shadow-lg transition-all duration-300 hover:shadow-xl ${
                    completed ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${
                            completed ? 'bg-green-100' : 'bg-gray-100'
                          } flex items-center justify-center`}>
                            {completed ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <IconComponent className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900 mb-1">
                              {assessment.title}
                            </CardTitle>
                            <Badge className={categoryColors[assessment.category]} variant="outline">
                              {assessment.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        {completed && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {assessment.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {assessment.duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {assessment.questions?.length || 0} questions
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartAssessment(assessment)}
                        disabled={completed}
                        className={`w-full ${
                          completed 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {completed ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Assessment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <Card className="border-none shadow-lg bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Congratulations! 🎉</h2>
              <p className="text-green-100 text-lg mb-6">
                You've completed all available assessments. Now you can explore your 
                comprehensive personality profile and career recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  View My Profile
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  Explore Careers
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
