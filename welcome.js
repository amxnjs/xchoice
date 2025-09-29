
import React, { useState } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Combobox } from "@/components/ui/Combobox";

export default function WelcomePage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        education_status: '',
        current_education_details: '',
        age: '',
        location: '',
        family_background: '',
        hobbies: [],
        current_challenges: [],
        future_goals: '',
        preferred_work_environment: '',
        financial_considerations: ''
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const academic_info = {
            education_status: formData.education_status,
            current_education_details: formData.current_education_details,
        };

        const personal_background = {
            age: parseInt(formData.age),
            location: formData.location,
            family_background: formData.family_background,
            hobbies: formData.hobbies,
            current_challenges: formData.current_challenges,
            future_goals: formData.future_goals,
            preferred_work_environment: formData.preferred_work_environment,
            financial_considerations: formData.financial_considerations
        };

        await User.updateMyUserData({ academic_info, personal_background });
        navigate(createPageUrl('Dashboard'));
    };

    const hobbiesOptions = [
        'Reading', 'Gaming', 'Sports', 'Music', 'Art/Drawing', 'Cooking', 'Technology', 
        'Social Media', 'Movies/TV', 'Outdoor Activities', 'Photography', 'Writing',
        'Dance', 'Volunteering', 'Travel', 'Fashion', 'Fitness', 'Learning Languages'
    ];

    const challengesOptions = [
        'Choosing a career path', 'Academic pressure', 'Financial concerns', 'Social anxiety',
        'Time management', 'Family expectations', 'Peer pressure', 'Self-confidence',
        'Work-life balance', 'Technology skills', 'Public speaking', 'Decision making'
    ];

    const educationStatusOptions = [
        { value: 'high_school_student', label: 'High School Student' },
        { value: 'high_school_graduate', label: 'High School Graduate' },
        { value: 'university_student', label: 'University/College Student' },
        { value: 'university_graduate', label: 'University/College Graduate' },
        { value: 'professional', label: 'Working Professional' },
    ];
    
    const familyBackgroundOptions = [
        { value: 'supportive_academic', label: 'Very supportive of education and career goals' },
        { value: 'practical_focused', label: 'Focused on practical, stable career choices' },
        { value: 'creative_encouraging', label: 'Encouraging of creative and artistic pursuits' },
        { value: 'business_oriented', label: 'Business and entrepreneurship focused' },
        { value: 'independent_choice', label: 'Lets me make my own choices' },
        { value: 'traditional_expectations', label: 'Has traditional career expectations' },
    ];

    const futureGoalsOptions = [
        { value: 'get_into_university', label: 'Get into a good university/college' },
        { value: 'find_career_path', label: 'Discover my ideal career path' },
        { value: 'develop_skills', label: 'Develop specific skills and talents' },
        { value: 'start_career', label: 'Start my professional career' },
        { value: 'change_career', label: 'Change to a different career' },
        { value: 'start_business', label: 'Start my own business' },
    ];
    
    const workEnvironmentOptions = [
        { value: 'collaborative_office', label: 'Collaborative office with team projects' },
        { value: 'quiet_focused', label: 'Quiet, focused environment for deep work' },
        { value: 'creative_flexible', label: 'Creative, flexible workspace' },
        { value: 'remote_home', label: 'Working from home/remotely' },
        { value: 'active_outdoors', label: 'Active, outdoors, or hands-on work' },
        { value: 'client_facing', label: 'Meeting and helping people directly' },
    ];

    const financialConsiderationsOptions = [
        { value: 'very_important', label: 'Very important - I need financial security' },
        { value: 'moderately_important', label: 'Moderately important - decent income is needed' },
        { value: 'somewhat_important', label: 'Somewhat important - passion over pay' },
        { value: 'not_important', label: 'Not important - I\'ll follow my passion' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-sage mb-4">
                            <Compass className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Welcome to PathFinder</CardTitle>
                        <p className="text-gray-600">Let's get to know you better to personalize your journey</p>
                        <div className="flex justify-center mt-4">
                            <div className="flex space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-sage' : 'bg-gray-300'}`} />
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-lg font-semibold text-center">Basic Information</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Your Age</Label>
                                            <Input 
                                                type="number" 
                                                min="13" 
                                                max="65" 
                                                placeholder="18" 
                                                value={formData.age}
                                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input 
                                                placeholder="City, Country" 
                                                value={formData.location}
                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Current Status</Label>
                                        <Combobox
                                            options={educationStatusOptions}
                                            value={formData.education_status}
                                            onValueChange={(value) => setFormData({...formData, education_status: value})}
                                            placeholder="Select your current status..."
                                            required
                                        />
                                    </div>

                                    {(formData.education_status === 'high_school_student' || formData.education_status === 'university_student') && (
                                        <div className="space-y-2">
                                            <Label>Current Grade/Year</Label>
                                            <Input 
                                                placeholder="e.g., Grade 11, Year 2, Senior Year" 
                                                value={formData.current_education_details}
                                                onChange={(e) => setFormData({...formData, current_education_details: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Family Background</Label>
                                        <Combobox
                                            options={familyBackgroundOptions}
                                            value={formData.family_background}
                                            onValueChange={(value) => setFormData({...formData, family_background: value})}
                                            placeholder="What best describes your family?"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-lg font-semibold text-center">Your Interests & Challenges</h3>
                                    
                                    <div className="space-y-4">
                                        <Label>What do you enjoy doing in your free time? (Select all that apply)</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {hobbiesOptions.map((hobby) => (
                                                <div key={hobby} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={hobby}
                                                        checked={formData.hobbies.includes(hobby)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setFormData({...formData, hobbies: [...formData.hobbies, hobby]});
                                                            } else {
                                                                setFormData({...formData, hobbies: formData.hobbies.filter(h => h !== hobby)});
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={hobby} className="text-sm">{hobby}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What challenges are you currently facing? (Select all that apply)</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {challengesOptions.map((challenge) => (
                                                <div key={challenge} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={challenge}
                                                        checked={formData.current_challenges.includes(challenge)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setFormData({...formData, current_challenges: [...formData.current_challenges, challenge]});
                                                            } else {
                                                                setFormData({...formData, current_challenges: formData.current_challenges.filter(c => c !== challenge)});
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={challenge} className="text-sm">{challenge}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-lg font-semibold text-center">Your Goals & Preferences</h3>
                                    
                                    <div className="space-y-2">
                                        <Label>What's your main goal for the next 2-3 years?</Label>
                                        <Combobox
                                            options={futureGoalsOptions}
                                            value={formData.future_goals}
                                            onValueChange={(value) => setFormData({...formData, future_goals: value})}
                                            placeholder="Select your primary goal..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>What work environment appeals to you most?</Label>
                                        <Combobox
                                            options={workEnvironmentOptions}
                                            value={formData.preferred_work_environment}
                                            onValueChange={(value) => setFormData({...formData, preferred_work_environment: value})}
                                            placeholder="Choose your preferred environment..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>How important are financial considerations in your career choice?</Label>
                                        <Combobox
                                            options={financialConsiderationsOptions}
                                            value={formData.financial_considerations}
                                            onValueChange={(value) => setFormData({...formData, financial_considerations: value})}
                                            placeholder="Select importance level..."
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex justify-between pt-6">
                                {step > 1 && (
                                    <Button type="button" variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button 
                                        type="button" 
                                        onClick={handleNext} 
                                        className="bg-sage hover:bg-sage-dark ml-auto"
                                        disabled={step === 1 && (!formData.education_status || !formData.age)}
                                    >
                                        Next <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" className="bg-sage hover:bg-sage-dark ml-auto">
                                        Complete Setup
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
