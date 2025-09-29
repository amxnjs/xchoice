
import React, { useState } from 'react';
import { InvokeLLM } from '../src/integrations/Core';
import { Button } from '../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Input } from '../src/components/ui/input';
import { Label } from '../src/components/ui/label';
import { Slider } from '../src/components/ui/slider';
import { Checkbox } from '../src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/ui/select';
import { Loader2, School, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Combobox } from "../src/components/ui/Combobox";
import CurrencyConverter from "../src/components/tools/CurrencyConverter";

export default function UniversitySearchPage() {
    const [filters, setFilters] = useState({ 
        cost: [50000], 
        partTimeJobs: false, 
        boarding: false,
        careerField: '',
        location: '',
        major: ''
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const careerFields = [
        // STEM
        'Computer Science & Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 
        'Civil Engineering', 'Chemical Engineering', 'Biomedical Engineering', 'Data Science & Analytics',
        'Cybersecurity', 'Mathematics', 'Physics', 'Chemistry', 'Biology & Life Sciences', 
        'Environmental Science', 'Astronomy & Astrophysics',
        
        // Business & Economics
        'Business Administration', 'Finance & Banking', 'Accounting', 'Marketing & Digital Marketing',
        'Economics', 'International Business', 'Entrepreneurship', 'Supply Chain Management',
        'Human Resources', 'Project Management',
        
        // Health & Medical Sciences
        'Pre-Medicine', 'Nursing', 'Pharmacy', 'Physical Therapy', 'Occupational Therapy',
        'Public Health', 'Nutrition & Dietetics', 'Medical Technology', 'Veterinary Medicine',
        'Dentistry', 'Clinical Psychology',
        
        // Social Sciences & Humanities
        'Psychology', 'Sociology', 'Political Science', 'International Relations', 'History',
        'Philosophy', 'English Literature', 'Foreign Languages', 'Anthropology', 'Geography',
        'Religious Studies',
        
        // Arts & Creative Fields
        'Graphic Design', 'Fine Arts', 'Music', 'Theater & Performing Arts', 'Film & Media Production',
        'Architecture', 'Fashion Design', 'Interior Design', 'Creative Writing', 'Photography',
        
        // Education & Human Services
        'Elementary Education', 'Secondary Education', 'Special Education', 'Social Work',
        'Criminal Justice', 'Pre-Law', 'Public Administration', 'Non-Profit Management',
        
        // Communications & Media
        'Journalism', 'Communications', 'Public Relations', 'Broadcasting & Media Studies',
        'Digital Media', 'Advertising',
        
        // Agriculture & Natural Resources
        'Agriculture & Farming', 'Forestry', 'Marine Biology', 'Natural Resource Management', 'Food Science'
    ];

    const careerFieldOptions = careerFields.map(field => ({ value: field, label: field }));

    const handleSearch = async () => {
        setLoading(true);
        setResults([]);
        
        const prompt = `
            Find universities or colleges based on these specific criteria. Use accurate, real-time data from official university websites and educational databases:
            
            - Major/Field of study: "${filters.major || filters.careerField || 'any'}"
            - Location: "${filters.location || 'any location'}"
            - Maximum annual tuition cost: $${filters.cost[0]}
            - Must have nearby part-time job opportunities: ${filters.partTimeJobs ? 'Yes' : 'No'}
            - Must offer on-campus boarding/housing: ${filters.boarding ? 'Yes' : 'No'}
            
            Return a list of 5-6 matching institutions with accurate information in this JSON format:
            {
              "universities": [
                {
                  "name": "University Name",
                  "location": "City, State",
                  "description": "Brief description focusing on the specific major/program strength.",
                  "tuition_cost": "Annual tuition estimate",
                  "website": "Official university website URL",
                  "program_highlights": "Key strengths of their program in the specified field"
                }
              ]
            }
            
            Important: Provide accurate, verifiable information only. Include direct links to official university websites.
        `;
        
        try {
            const response = await InvokeLLM({ 
                prompt, 
                add_context_from_internet: true, 
                response_json_schema: { 
                    type: 'object', 
                    properties: { 
                        universities: { 
                            type: 'array', 
                            items: { 
                                type: 'object', 
                                properties: { 
                                    name: { type: 'string' }, 
                                    location: { type: 'string' }, 
                                    description: { type: 'string' }, 
                                    tuition_cost: { type: 'string' },
                                    website: { type: 'string' },
                                    program_highlights: { type: 'string' }
                                },
                                required: ["name", "location", "description", "website"]
                            } 
                        } 
                    } 
                } 
            });
            setResults(response.universities || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">University & College Search</h1>
                <p className="text-lg text-gray-600">
                    Find universities that match your career interests, budget, and lifestyle preferences.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="sticky top-4">
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Filter className="w-5 h-5" />
                            <CardTitle>Search Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Career Field of Interest</Label>
                                <Combobox
                                    options={careerFieldOptions}
                                    value={filters.careerField}
                                    onValueChange={value => setFilters({...filters, careerField: value})}
                                    placeholder="Select a field..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Specific Major (Optional)</Label>
                                <Input 
                                    placeholder="e.g., Software Engineering" 
                                    value={filters.major}
                                    onChange={e => setFilters({...filters, major: e.target.value})} 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Preferred Location</Label>
                                <Input 
                                    placeholder="e.g., California, New York" 
                                    value={filters.location}
                                    onChange={e => setFilters({...filters, location: e.target.value})} 
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <Label>Max Annual Cost: ${filters.cost[0].toLocaleString()}</Label>
                                <Slider 
                                    value={filters.cost} 
                                    onValueChange={v => setFilters({...filters, cost: v})} 
                                    max={100000} 
                                    min={5000}
                                    step={1000} 
                                    className="w-full"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="boarding" 
                                        checked={filters.boarding} 
                                        onCheckedChange={c => setFilters({...filters, boarding: c})} 
                                    />
                                    <Label htmlFor="boarding">On-campus Housing Required</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="jobs" 
                                        checked={filters.partTimeJobs} 
                                        onCheckedChange={c => setFilters({...filters, partTimeJobs: c})} 
                                    />
                                    <Label htmlFor="jobs">Nearby Part-time Job Opportunities</Label>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={handleSearch} 
                                disabled={loading} 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Searching...
                                    </>
                                ) : (
                                    "Search Universities"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    {/* Currency Converter */}
                    <CurrencyConverter />
                </div>
                
                <div className="lg:col-span-3 space-y-6">
                    {results.map((uni, i) => (
                        <motion.div 
                            key={i} 
                            initial={{opacity: 0, y: 20}} 
                            animate={{opacity: 1, y: 0}} 
                            transition={{delay: i * 0.1}}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <School className="w-8 h-8 text-blue-600 mt-1"/>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl">{uni.name}</CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">{uni.location}</p>
                                                {uni.tuition_cost && (
                                                    <p className="text-sm font-medium text-green-600 mt-1">
                                                        {uni.tuition_cost}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-700">{uni.description}</p>
                                    
                                    {uni.program_highlights && (
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-blue-900 mb-2">Program Highlights:</h4>
                                            <p className="text-blue-800 text-sm">{uni.program_highlights}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                Visit Official Website
                                            </Button>
                                        </a>
                                        <Button variant="outline" className="px-6">
                                            Save to Compare
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    
                    {loading && (
                        <div className="text-center p-8">
                            <Loader2 className="animate-spin w-8 h-8 mx-auto text-blue-600"/>
                            <p className="mt-4 text-gray-600">Searching for the best universities for you...</p>
                        </div>
                    )}
                    
                    {!loading && results.length === 0 && (
                        <Card className="p-8 text-center">
                            <School className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Explore?</h3>
                            <p className="text-gray-600">
                                Use the filters on the left to find universities that match your interests and requirements.
                            </p>
                        </Card>
                    )}
                    
                    {!loading && results.length > 0 && (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Disclaimer:</strong> University information is sourced from the internet. 
                                Always verify details, costs, and requirements on the official university website.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
