
import React, { useState, useEffect } from "react";
import { User, UserAssessmentResult, CareerField } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Users,
  Brain,
  Lightbulb,
  Search,
  Check, // New import
  Zap, // New import
  Loader2 // New import
} from "lucide-react";
import { motion } from "framer-motion";

function SkillRoadmap({ careerField }) {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateRoadmap = async () => {
        setLoading(true);
        try {
            const prompt = `Create a skill roadmap for someone pursuing a career in "${careerField}". Include technical skills, soft skills, and key experiences to gain. Format as JSON: {"technical_skills": ["Skill 1", "Skill 2"], "soft_skills": ["Skill 1", "Skill 2"], "key_experiences": ["Experience 1", "Experience 2"]}`;
            const result = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        technical_skills: { type: 'array', items: { type: 'string' } },
                        soft_skills: { type: 'array', items: { type: 'string' } },
                        key_experiences: { type: 'array', items: { type: 'string' } }
                    },
                    required: ["technical_skills", "soft_skills", "key_experiences"]
                }
            });
            setRoadmap(result);
        } catch (error) {
            console.error("Error generating skill roadmap:", error);
            // Optionally, set an error state or display a message
        } finally {
            setLoading(false);
        }
    };

    if (!roadmap && !loading) {
        return <Button onClick={generateRoadmap}>Generate Skill Roadmap</Button>;
    }
    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Generating Roadmap...</span>
            </div>
        );
    }
    return (
        <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-800">Skill Roadmap for {careerField}</h4>
            <div>
                <h5 className="font-semibold text-gray-700">Technical Skills</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                    {roadmap.technical_skills?.map(s => <Badge key={s} className="bg-blue-100 text-blue-800">{s}</Badge>)}
                </div>
            </div>
            <div>
                <h5 className="font-semibold text-gray-700">Soft Skills</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                    {roadmap.soft_skills?.map(s => <Badge variant="secondary" key={s} className="bg-purple-100 text-purple-800">{s}</Badge>)}
                </div>
            </div>
            <div>
                <h5 className="font-semibold text-gray-700">Key Experiences</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-1">
                    {roadmap.key_experiences?.map(e => <li key={e}>{e}</li>)}
                </ul>
            </div>
        </div>
    );
}

export default function CareerRecommendations() {
  const [user, setUser] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [careerFields, setCareerFields] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null); // New state
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      const results = await UserAssessmentResult.filter({ user_email: currentUser.email });
      const careers = await CareerField.list();

      setUser(currentUser);
      setUserResults(results);
      setCareerFields(careers);
      setSelectedPath(currentUser.selected_career_path || null); // Load selected path

      // If user has existing recommendations, show them
      if (currentUser.career_recommendations) {
        setRecommendations(currentUser.career_recommendations);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const generateRecommendations = async () => {
    setGenerating(true);

    try {
      // Compile user insights
      const allInsights = userResults.map(result => ({
        category: result.category,
        traits: result.insights?.primary_traits || [],
        strengths: result.insights?.strengths || [],
        summary: result.insights?.summary || ''
      }));

      const prompt = `
        Based on the following personality assessment results, recommend the most suitable career fields:

        User Profile:
        - Academic Info: ${JSON.stringify(user.academic_info || {})}
        - Assessment Results: ${JSON.stringify(allInsights)}

        Available Career Fields:
        ${careerFields.map(field => `
        - ${field.title}: ${field.description}
          Category: ${field.category}
          Required Strengths: ${field.required_strengths?.join(', ') || 'None specified'}
          Personality Match: ${field.personality_match?.join(', ') || 'None specified'}
          Academic Requirements: ${JSON.stringify(field.academic_requirements || {})}
        `).join('\n')}

        Provide career recommendations in the following JSON format:
        {
          "recommendations": [
            {
              "field": "Career Field Name",
              "match_percentage": 85,
              "reasoning": "Detailed explanation of why this career matches the user's profile",
              "key_alignments": ["alignment1", "alignment2"],
              "growth_potential": "High/Medium/Low",
              "next_steps": "Specific actionable advice"
            }
          ]
        }

        Consider:
        1. Personality traits and how they align with career requirements
        2. Identified strengths and how they apply to different fields
        3. Academic performance and requirements
        4. Interest areas and values
        5. Growth potential and market demand

        Provide 5-8 recommendations, ranked by match percentage.
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  match_percentage: { type: "number" },
                  reasoning: { type: "string" },
                  key_alignments: { type: "array", items: { type: "string" } },
                  growth_potential: { type: "string" },
                  next_steps: { type: "string" }
                },
                required: ["field", "match_percentage", "reasoning", "key_alignments", "growth_potential", "next_steps"]
              }
            }
          },
          required: ["recommendations"]
        }
      });

      const newRecommendations = result.recommendations || [];
      setRecommendations(newRecommendations);

      // Update user profile with recommendations
      await User.updateMyUserData({
        career_recommendations: newRecommendations
      });

    } catch (error) {
      console.error("Error generating recommendations:", error);
    }

    setGenerating(false);
  };

  const handleSelectPath = async (rec) => {
      const path = { field: rec.field };
      setSelectedPath(path);
      try {
        await User.updateMyUserData({ selected_career_path: path });
      } catch (error) {
          console.error("Error updating selected career path:", error);
          // Revert UI or show error message if persistence fails
          setSelectedPath(null);
      }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasEnoughData = userResults.length >= 2; // Need at least 2 assessments

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Career Recommendations</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover career paths that align with your personality, strengths, and interests
          </p>
        </div>

        {selectedPath && (
            <Card className="border-none shadow-lg bg-green-50 p-6">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-green-800">
                        <Zap className="w-7 h-7 text-green-700"/>
                        Your Selected Path: {selectedPath.field}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <SkillRoadmap careerField={selectedPath.field}/>
                </CardContent>
            </Card>
        )}

        {!hasEnoughData ? (
          <Card className="border-none shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-8 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">More Data Needed</h2>
              <p className="text-gray-600 mb-6">
                Complete at least 2 assessments to get personalized career recommendations
                based on your personality profile.
              </p>
              <div className="w-64 mx-auto mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-lg font-bold text-gray-900">
                    {userResults.length}/2
                  </span>
                </div>
                <Progress value={(userResults.length / 2) * 100} className="h-3" />
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Take More Assessments
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {recommendations.length === 0 ? (
              <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-8 text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready for Career Insights?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Based on your {userResults.length} completed assessments,
                    we can now generate personalized career recommendations.
                  </p>
                  <Button
                    onClick={generateRecommendations}
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing Your Profile...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate My Recommendations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Recommendations Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Career Matches
                  </h2>
                  <Button
                    variant="outline"
                    onClick={generateRecommendations}
                    disabled={generating}
                  >
                    {generating ? "Updating..." : "Refresh Recommendations"}
                  </Button>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((rec, index) => {
                    const matchColor =
                      rec.match_percentage >= 80 ? 'text-green-600 bg-green-100' :
                      rec.match_percentage >= 60 ? 'text-yellow-600 bg-yellow-100' :
                      'text-blue-600 bg-blue-100';

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow h-full flex flex-col">
                          <CardHeader>
                            <div className="flex justify-between items-start mb-3">
                              <CardTitle className="text-xl text-gray-900">
                                {rec.field}
                              </CardTitle>
                              <div className={`px-3 py-1 rounded-full ${matchColor} font-bold`}>
                                {rec.match_percentage}%
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {rec.growth_potential} Growth Potential
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 flex-grow">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rec.reasoning}
                            </p>

                            {rec.key_alignments && rec.key_alignments.length > 0 && (
                              <div>
                                <p className="font-medium text-gray-900 mb-2 text-sm">
                                  Key Alignments:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {rec.key_alignments.slice(0, 3).map((alignment, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="bg-purple-100 text-purple-800 text-xs"
                                    >
                                      {alignment}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="border-t pt-4">
                              <p className="font-medium text-gray-900 mb-2 text-sm">
                                Next Steps:
                              </p>
                              <p className="text-gray-700 text-sm">
                                {rec.next_steps}
                              </p>
                            </div>
                          </CardContent>
                          <div className="p-4 pt-0">
                            <Button
                                className="w-full"
                                onClick={() => handleSelectPath(rec)}
                                disabled={selectedPath?.field === rec.field}
                            >
                                <Check className="mr-2 h-4 w-4"/> {selectedPath?.field === rec.field ? "Path Selected" : "Select This Path"}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="w-8 h-8 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Education Planning
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Research degree programs and educational pathways for your top career matches.
                      </p>
                      <Button variant="outline" className="w-full border-green-300 text-green-700">
                        Explore Education Options
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="w-8 h-8 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Skill Development
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Identify key skills to develop based on your career recommendations.
                      </p>
                      <Button variant="outline" className="w-full border-purple-300 text-purple-700">
                        View Skill Roadmap
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
