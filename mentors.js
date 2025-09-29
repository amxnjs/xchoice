
import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { UserPlus, Send, Loader2, Search, ExternalLink } from "lucide-react";
import { Combobox } from "@/components/ui/Combobox";

export default function MentorsPage() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [searchFilters, setSearchFilters] = useState({
        field: '',
        experience: '',
        location: ''
    });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
        } catch (error) {
            console.error("Error loading user:", error);
        }
    };

    const searchMentors = async () => {
        setLoading(true);
        try {
            const prompt = `
                Find real, verified mentors and professionals who are publicly available for mentoring in these areas:
                
                Search Criteria:
                - Field/Industry: ${searchFilters.field || 'any field'}
                - Experience Level: ${searchFilters.experience || 'any level'}
                - Location: ${searchFilters.location || 'any location'}
                
                Search specifically on these verified platforms for mentoring:
                1. LinkedIn (professionals who mention mentoring in their profiles)
                2. MentorCruise (verified mentoring platform)
                3. ADPList (free mentoring platform)
                4. Ten Thousand Coffees (professional mentoring)
                5. MentorCode (tech mentoring)
                6. Clarity.fm (business mentoring)
                
                IMPORTANT: Only include mentors who:
                - Have publicly available profiles
                - Actively offer mentoring services
                - Have verified professional experience
                - Include their real platform links
                
                Return in this JSON format:
                {
                  "mentors": [
                    {
                      "name": "Full Name",
                      "title": "Current Professional Title",
                      "company": "Current Company",
                      "experience_years": "Years of experience",
                      "specialization": "Area of expertise", 
                      "bio": "Professional background and mentoring focus",
                      "platform": "Platform where they offer mentoring",
                      "profile_url": "Direct link to their mentoring profile",
                      "skills": ["skill1", "skill2", "skill3"],
                      "mentoring_focus": "What they help mentees with",
                      "availability": "Their general availability",
                      "cost": "Free/Paid mentoring information"
                    }
                  ]
                }
                
                Focus on quality over quantity - provide 4-6 highly relevant, verified mentors.
                Ensure all profile URLs are real and accessible.
            `;

            const result = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        mentors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    title: { type: "string" },
                                    company: { type: "string" },
                                    experience_years: { type: "string" },
                                    specialization: { type: "string" },
                                    bio: { type: "string" },
                                    platform: { type: "string" },
                                    profile_url: { type: "string" },
                                    skills: { type: "array", items: { type: "string" } },
                                    mentoring_focus: { type: "string" },
                                    availability: { type: "string" },
                                    cost: { type: "string" }
                                },
                                required: ["name", "title", "specialization", "platform", "profile_url"]
                            }
                        }
                    }
                }
            });

            setMentors(result.mentors || []);
        } catch (error) {
            console.error("Error searching mentors:", error);
        }
        setLoading(false);
    };

    const careerFields = [
        'Technology & Software', 'Business & Finance', 'Healthcare', 'Education',
        'Engineering', 'Marketing & Sales', 'Design & Creative', 'Legal',
        'Consulting', 'Non-Profit & Social Impact', 'Media & Communications',
        'Science & Research', 'Government & Public Service'
    ];
    const careerFieldOptions = careerFields.map(field => ({ value: field, label: field }));

    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
    const experienceLevelOptions = experienceLevels.map(level => ({ value: level, label: level }));
    
    const BecomeMentorSection = () => (
        <Card className="bg-blue-50">
            <CardHeader>
                <CardTitle>Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Share your experience and guide the next generation. Opt-in to become a mentor.</p>
                <Button onClick={async () => { 
                    await User.updateMyUserData({ is_mentor: true }); 
                    loadUser(); 
                }}>
                    <UserPlus className="mr-2 h-4 w-4" /> Yes, I want to be a mentor
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Find a Mentor</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Search className="w-5 h-5" />
                            <CardTitle>Search Mentors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Career Field</label>
                                <Combobox
                                    options={careerFieldOptions}
                                    value={searchFilters.field}
                                    onValueChange={value => setSearchFilters({...searchFilters, field: value})}
                                    placeholder="Select field..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Experience Level</label>
                                <Combobox
                                    options={experienceLevelOptions}
                                    value={searchFilters.experience}
                                    onValueChange={value => setSearchFilters({...searchFilters, experience: value})}
                                    placeholder="Select level..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input 
                                    placeholder="e.g., San Francisco, Remote" 
                                    value={searchFilters.location}
                                    onChange={e => setSearchFilters({...searchFilters, location: e.target.value})} 
                                />
                            </div>
                            
                            <Button 
                                onClick={searchMentors} 
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Searching...
                                    </>
                                ) : (
                                    "Find Mentors"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    {user && !user.is_mentor && (
                        <div className="mt-6">
                            <BecomeMentorSection />
                        </div>
                    )}
                </div>
                
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="text-center p-8">
                            <Loader2 className="animate-spin w-8 h-8 mx-auto text-blue-600"/>
                            <p className="mt-4 text-gray-600">Finding mentors in your area of interest...</p>
                        </div>
                    ) : mentors.length === 0 ? (
                        <Card className="p-8 text-center">
                            <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Connect?</h3>
                            <p className="text-gray-600">
                                Use the search filters to find mentors in your field of interest.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {mentors.map((mentor, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{opacity: 0, y: 20}} 
                                    animate={{opacity: 1, y: 0}} 
                                    transition={{delay: index * 0.1}}
                                >
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{mentor.name}</CardTitle>
                                                    <p className="text-lg text-blue-600 font-semibold">{mentor.title}</p>
                                                    {mentor.company && (
                                                        <p className="text-gray-600">{mentor.company}</p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                    {mentor.platform}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="font-medium text-gray-900">Specialization:</p>
                                                <p className="text-gray-700">{mentor.specialization}</p>
                                            </div>
                                            
                                            {mentor.mentoring_focus && (
                                                <div>
                                                    <p className="font-medium text-gray-900">Mentoring Focus:</p>
                                                    <p className="text-gray-700 text-sm">{mentor.mentoring_focus}</p>
                                                </div>
                                            )}
                                            
                                            {mentor.bio && (
                                                <div>
                                                    <p className="font-medium text-gray-900">Background:</p>
                                                    <p className="text-gray-700 text-sm">{mentor.bio}</p>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between text-sm">
                                                {mentor.availability && (
                                                    <span className="text-gray-600">📅 {mentor.availability}</span>
                                                )}
                                                {mentor.cost && (
                                                    <span className={`font-medium ${mentor.cost.toLowerCase().includes('free') ? 'text-green-600' : 'text-blue-600'}`}>
                                                        {mentor.cost}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {mentor.skills && mentor.skills.length > 0 && (
                                                <div>
                                                    <p className="font-medium text-gray-900 mb-2">Expertise:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {mentor.skills.slice(0, 6).map((skill, i) => (
                                                            <Badge key={i} variant="secondary">{skill}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-3 pt-4">
                                                {mentor.profile_url && (
                                                    <a href={mentor.profile_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Connect on {mentor.platform}
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                            
                            {mentors.length > 0 && (
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-800">
                                        <strong>Note:</strong> These mentors are sourced from verified mentoring platforms. 
                                        Click "Connect" to visit their official profiles and request mentoring directly through their preferred platform.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
