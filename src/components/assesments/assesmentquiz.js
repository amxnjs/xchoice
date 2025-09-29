
import React, { useState, useEffect, useCallback } from "react";
import { UserAssessmentResult, User } from "../src/entities/all";
import { InvokeLLM } from "../src/integrations/Core";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Progress } from "../src/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Label } from "../src/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssessmentQuiz({ assessment, onComplete, onCancel }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]); // New state for dynamically generated questions
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true); // New state for loading questions indicator
  const [startTime] = useState(Date.now());
  const [user, setUser] = useState(null); // New state to store user data

  const getUserContext = (educationStatus, age) => {
    if (age < 16) return 'young high school student';
    if (age < 18) return 'high school student approaching graduation';
    if (age < 22) return 'college-age young adult';
    if (age < 30) return 'young professional';
    return 'adult professional';
  };

  const getPersonalizedScenarios = (age, hobbies, challenges, educationStatus) => {
    let scenarios = [];
    
    // Age-based scenarios
    if (age < 18) {
      scenarios.push('school projects', 'friend groups', 'family expectations', 'college decisions');
    } else if (age < 25) {
      scenarios.push('college life', 'internships', 'first jobs', 'independence');
    } else {
      scenarios.push('career decisions', 'workplace dynamics', 'life goals', 'relationships');
    }
    
    // Hobby-based scenarios
    if (hobbies.includes('Gaming')) scenarios.push('online gaming communities', 'competitive gaming');
    if (hobbies.includes('Sports')) scenarios.push('team sports', 'athletic challenges');
    if (hobbies.includes('Music')) scenarios.push('musical performances', 'creative expression');
    if (hobbies.includes('Art/Drawing')) scenarios.push('artistic projects', 'creative showcases');
    if (hobbies.includes('Technology')) scenarios.push('tech projects', 'digital innovation');
    if (hobbies.includes('Social Media')) scenarios.push('online interactions', 'digital communication');
    if (hobbies.includes('Volunteering')) scenarios.push('community service', 'helping others');
    
    return scenarios.slice(0, 4).join(', ') || 'everyday life situations';
  };

  const generateDynamicQuestions = useCallback(async (currentUser) => {
    setLoadingQuestions(true);
    
    const educationStatus = currentUser?.academic_info?.education_status || 'high_school_graduate';
    const age = currentUser?.personal_background?.age || 18;
    const hobbies = currentUser?.personal_background?.hobbies || [];
    const challenges = currentUser?.personal_background?.current_challenges || [];
    // const location = currentUser?.personal_background?.location || 'general'; // Not used in this particular implementation, but extracted for completeness
    
    const userContext = getUserContext(educationStatus, age);
    const personalizedScenarios = getPersonalizedScenarios(age, hobbies, challenges, educationStatus);
    
    let questionPrompt = '';
    
    if (assessment.category === 'personality') {
      questionPrompt = `
        Generate 8 psychological personality assessment questions for a ${age}-year-old ${userContext}.
        Their hobbies include: ${hobbies.join(', ') || 'general activities'}
        Their challenges include: ${challenges.join(', ') || 'typical life challenges'}
        
        Create relatable scenarios based on their actual interests and age-appropriate situations.
        
        Return in this exact JSON format:
        {
          "questions": [
            {
              "question": "Age and interest-appropriate scenario question",
              "options": ["Response reflecting personality trait 1", "Response reflecting personality trait 2", "Response reflecting personality trait 3", "Response reflecting personality trait 4"],
              "dimension": "personality_trait_being_measured"
            }
          ]
        }
        
        Guidelines:
        - Use scenarios from their actual hobbies: ${hobbies.slice(0,3).join(', ')}
        - Reference age-appropriate situations for ${age}-year-olds
        - Include scenarios about ${personalizedScenarios}
        - NO generic "agree/disagree" questions
        - Make options reflect different personality approaches, not right/wrong answers
        - Measure: extroversion, conscientiousness, openness, agreeableness, emotional_stability, leadership, decision_making, stress_response
      `;
    } else if (assessment.category === 'strengths') {
      questionPrompt = `
        Generate 6 strengths discovery questions for a ${age}-year-old ${userContext}.
        Focus on their actual experiences with: ${hobbies.join(', ') || 'various activities'}
        Consider their challenges: ${challenges.join(', ') || 'general challenges'}
        
        Return in this exact JSON format:
        {
          "questions": [
            {
              "question": "Question about their actual experiences and natural talents",
              "options": ["Strength indicator 1", "Strength indicator 2", "Strength indicator 3", "Strength indicator 4"],
              "dimension": "strength_area_being_measured"
            }
          ]
        }
        
        Guidelines:
        - Ask about their experiences with their actual hobbies: ${hobbies.slice(0,3).join(', ')}
        - Use age ${age} appropriate scenarios
        - Reference ${personalizedScenarios}
        - Measure: analytical_thinking, creativity, leadership, communication, empathy, organization, problem_solving
      `;
    } else if (assessment.category === 'interests') {
      questionPrompt = `
        Generate 6 interest exploration questions for a ${age}-year-old ${userContext}.
        They currently enjoy: ${hobbies.join(', ') || 'various activities'}
        Expand beyond their current hobbies to discover new interests.
        
        Return in this exact JSON format:
        {
          "questions": [
            {
              "question": "Question about potential new interests and motivations",
              "options": ["Interest area 1", "Interest area 2", "Interest area 3", "Interest area 4"],
              "dimension": "interest_category"
            }
          ]
        }
        
        Guidelines:
        - Reference their current hobbies: ${hobbies.slice(0,3).join(', ')} but explore beyond them
        - Use age ${age} appropriate scenarios
        - Include scenarios about ${personalizedScenarios}
        - Measure: stem_interests, business_interests, creative_interests, social_interests, hands_on_interests
      `;
    } else if (assessment.category === 'values') {
      questionPrompt = `
        Generate 6 values assessment questions for a ${age}-year-old ${userContext}.
        Consider their life stage and challenges: ${challenges.join(', ') || 'general life decisions'}
        
        Return in this exact JSON format:
        {
          "questions": [
            {
              "question": "Question about meaningful choices and priorities at age ${age}",
              "options": ["Value-driven choice 1", "Value-driven choice 2", "Value-driven choice 3", "Value-driven choice 4"],
              "dimension": "core_value"
            }
          ]
        }
        
        Guidelines:
        - Use age ${age} appropriate life decisions and dilemmas
        - Reference ${personalizedScenarios}
        - Consider their current challenges: ${challenges.slice(0,3).join(', ')}
        - Measure: achievement, security, helping_others, creativity, independence, stability, adventure, recognition
      `;
    } else if (assessment.category === 'cognitive_skills') {
      questionPrompt = `
        Generate 5 cognitive skills questions for a ${age}-year-old ${userContext}.
        Focus on their learning style and thinking patterns.
        
        Return in this exact JSON format:
        {
          "questions": [
            {
              "question": "Question about their thinking and learning preferences",
              "options": ["Learning style 1", "Learning style 2", "Learning style 3", "Learning style 4"],
              "dimension": "cognitive_skill"
            }
          ]
        }
        
        Guidelines:
        - Use age ${age} appropriate learning scenarios
        - Reference ${personalizedScenarios}
        - Consider their hobbies: ${hobbies.slice(0,3).join(', ')}
        - Measure: analytical_thinking, creative_thinking, spatial_reasoning, verbal_reasoning, memory_strategies
      `;
    } else {
      // Fallback for categories not explicitly handled by dynamic generation, or if `assessment.category` is missing
      questionPrompt = `
        Generate 5 general assessment questions for the category "${assessment.title || assessment.category}".
        Focus on broad areas relevant to personal and career development.
        
        Return in this exact JSON format:
        {
          "questions": [
            {
              "question": "General question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "dimension": "general_development"
            }
          ]
        }
        
        Guidelines:
        - Options should be distinct and reflect different approaches.
        - Ensure questions are neutral and applicable to a ${userContext}.
      `;
    }

    try {
      const result = await InvokeLLM({
        prompt: questionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  dimension: { type: "string" }
                },
                required: ["question", "options", "dimension"]
              }
            }
          },
          required: ["questions"]
        }
      });
      
      setQuestions(result.questions || []); // Set the dynamically generated questions
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback to a single, basic question if generation fails
      setQuestions([{
        question: "We encountered an issue generating your personalized assessment. Please try again later.",
        options: ["Ok"],
        dimension: "fallback"
      }]);
    }
    
    setLoadingQuestions(false); // Finished loading questions
  }, [assessment.category, setQuestions, setLoadingQuestions]); // getUserContext and getPersonalizedScenarios are stable outside, InvokeLLM is stable

  const loadUserAndGenerateQuestions = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser); // Store user data in state
      await generateDynamicQuestions(currentUser);
    } catch (error) {
      console.error("Error loading user or generating questions:", error);
      setLoadingQuestions(false); // Ensure loading state is reset even on error
      // Fallback in case user or question generation fails completely
      setQuestions([{
        question: "We encountered an issue personalizing your assessment. Please try again later.",
        options: ["Ok"],
        dimension: "fallback"
      }]);
    }
  }, [generateDynamicQuestions, setQuestions, setLoadingQuestions]); // Dependency array updated to include generateDynamicQuestions, and state setters

  useEffect(() => {
    // Load user data and then generate questions based on user's context
    loadUserAndGenerateQuestions();
  }, [loadUserAndGenerateQuestions]); // Dependency array updated for useCallback

  // Display a loading screen while questions are being generated
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalizing Your Assessment</h3>
              <p className="text-gray-600">
                Creating questions tailored specifically for your background and interests...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Once questions are loaded, proceed with the quiz
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = {
      question_index: currentQuestion,
      answer: answer.toString() // Answers from dynamic questions are always strings (options)
    };
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) { // Use dynamically loaded questions length
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // User data is already available in the `user` state
      const completionTime = Math.round((Date.now() - startTime) / 60000);
      
      // Construct the prompt for analysis using the dynamically generated questions
      // and the user's context
      const userEducationStatus = user?.academic_info?.education_status || 'high_school_graduate';
      const userAge = user?.personal_background?.age || 18;
      const analysisUserContext = getUserContext(userEducationStatus, userAge);

      const prompt = `
        Analyze these assessment responses for the "${assessment.title}" assessment:
        
        User Context: ${analysisUserContext}
        
        Assessment Questions and Responses:
        ${questions.map((q, i) => `
        Question ${i + 1}: ${q.question}
        Answer: ${responses[i]?.answer || 'Not answered'}
        Dimension: ${q.dimension}
        `).join('\n')}
        
        Based on these responses, provide insights in the following JSON format:
        {
          "scores": {
            // Calculate scores for each dimension (0-100 scale)
          },
          "insights": {
            "primary_traits": ["trait1", "trait2", "trait3"],
            "strengths": ["strength1", "strength2", "strength3"],
            "development_areas": ["area1", "area2"],
            "summary": "A comprehensive 2-3 sentence summary of this person's profile based on their responses"
          }
        }
        
        Make the insights specific, actionable, and encouraging for a ${analysisUserContext}.
      `;

      const analysisResult = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              additionalProperties: { type: "number" }
            },
            insights: {
              type: "object",
              properties: {
                primary_traits: { type: "array", items: { type: "string" } },
                strengths: { type: "array", items: { type: "string" } },
                development_areas: { type: "array", items: { type: "string" } },
                summary: { type: "string" }
              }
            }
          },
          required: ["scores", "insights"] // Ensure these are present
        }
      });

      // Save the assessment result
      await UserAssessmentResult.create({
        assessment_id: assessment.id,
        user_email: user.email, // Use user from state
        responses,
        scores: analysisResult.scores || {},
        insights: analysisResult.insights || {},
        completion_time_minutes: completionTime
      });

      // Update user's assessment progress
      const currentProgress = user.assessment_progress || {};
      const completedAssessments = currentProgress.completed_assessments || [];
      
      await User.updateMyUserData({
        assessment_progress: {
          completed_assessments: [...completedAssessments, assessment.id],
          completion_percentage: Math.round((completedAssessments.length + 1) / 5 * 100), // Assuming 5 total assessments
          next_recommended: null // This will be determined by other logic later
        }
      });

      onComplete(); // Callback to indicate assessment completion
    } catch (error) {
      console.error("Error submitting assessment:", error);
      // TODO: Display a user-friendly error message
    }
    
    setIsProcessing(false);
  };

  const getCurrentResponse = () => {
    return responses[currentQuestion]?.answer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assessments
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length} {/* Use dynamic questions length */}
            </p>
            <p className="font-medium text-gray-900">{assessment.title}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-gray-900 leading-relaxed">
                  {question?.question} {/* Safely access question text */}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dynamically generated questions are all multiple choice */}
                <RadioGroup 
                  value={getCurrentResponse()} 
                  onValueChange={handleAnswer}
                  className="space-y-4"
                >
                  {question?.options?.map((option, index) => ( // Safely access options
                    <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} className="text-blue-600" />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="text-gray-700 text-lg cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!getCurrentResponse() || isProcessing}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Complete Assessment
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!getCurrentResponse()}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
