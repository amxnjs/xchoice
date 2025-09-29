
import React, { useState } from 'react';
import { InvokeLLM } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Briefcase, Filter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Combobox } from "@/components/ui/Combobox";

export default function JobSearchPage() {
    const [filters, setFilters] = useState({
        field: '',
        location: '',
        experience: '',
        salary: ''
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const careerFields = [
        // STEM
        'Software Development', 'Data Science', 'Engineering', 'Cybersecurity', 'Healthcare Technology',
        'Biotechnology', 'Environmental Science', 'Research & Development',
        
        // Business & Finance
        'Finance & Banking', 'Accounting', 'Marketing & Digital Marketing', 'Business Analysis',
        'Project Management', 'Human Resources', 'Sales', 'Consulting',
        
        // Healthcare
        'Healthcare', 'Nursing', 'Physical Therapy', 'Mental Health', 'Public Health',
        'Medical Technology', 'Pharmacy',
        
        // Education & Social Services
        'Education', 'Social Work', 'Non-profit', 'Government & Public Service',
        
        // Creative & Media
        'Design & Creative', 'Media & Communications', 'Entertainment', 'Publishing',
        'Advertising & PR',
        
        // Other Professional Fields
        'Legal Services', 'Real Estate', 'Hospitality & Tourism', 'Retail Management',
        'Manufacturing', 'Transportation & Logistics'
    ];

    const experienceLevels = [
        'Entry Level', 'Mid Level', 'Senior Level', 'Executive'
    ];

    const careerFieldOptions = careerFields.map(field => ({ value: field, label: field }));
    const experienceLevelOptions = experienceLevels.map(level => ({ value: level, label: level }));

    const handleSearch = async () => {
        setLoading(true);
        setResults([]);
        
        const prompt = `
            Find current job opportunities based on these criteria. Use accurate, real-time data from major job boards like Indeed, LinkedIn, Glassdoor:
            
            - Job Field: "${filters.field || 'any field'}"
            - Location: "${filters.location || 'any location'}"
            - Experience Level: "${filters.experience || 'entry-level'}"
            - Salary Range: "${filters.salary || 'any salary'}"
            
            Return a list of 5-6 actual job listings in this JSON format:
            {
              "jobs": [
                {
                  "title": "Exact Job Title",
                  "company": "Company Name",
                  "location": "City, State",
                  "summary": "Brief job description focusing on key responsibilities.",
                  "salary_range": "Salary information if available",
                  "experience_required": "Experience level needed",
                  "link": "Direct URL to the actual job posting on the job board"
                }
              ]
            }
            
            Important: Provide links to real, current job postings that users can actually apply to. Focus on accuracy and current market availability.
        `;
        
        try {
            const response = await InvokeLLM({ 
                prompt, 
                add_context_from_internet: true, 
                response_json_schema: { 
                    type: 'object', 
                    properties: { 
                        jobs: { 
                            type: 'array', 
                            items: { 
                                type: 'object', 
                                properties: { 
                                    title: { type: 'string' }, 
                                    company: { type: 'string' }, 
                                    location: { type: 'string' }, 
                                    summary: { type: 'string' }, 
                                    salary_range: { type: 'string' },
                                    experience_required: { type: 'string' },
                                    link: { type: 'string' } 
                                },
                                required: ["title", "company", "location", "link"]
                            } 
                        } 
                    } 
                } 
            });
            setResults(response.jobs || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Search</h1>
                <p className="text-lg text-gray-600">
                    Discover current job opportunities across multiple career fields that interest you.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Filter className="w-5 h-5" />
                            <CardTitle>Job Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Career Field</Label>
                                <Combobox
                                    options={careerFieldOptions}
                                    value={filters.field}
                                    onValueChange={value => setFilters({...filters, field: value})}
                                    placeholder="Select field..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input 
                                    placeholder="e.g., San Francisco, Remote" 
                                    value={filters.location}
                                    onChange={e => setFilters({...filters, location: e.target.value})} 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <Combobox
                                    options={experienceLevelOptions}
                                    value={filters.experience}
                                    onValueChange={value => setFilters({...filters, experience: value})}
                                    placeholder="Select level..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Salary Range (Optional)</Label>
                                <Input 
                                    placeholder="e.g., $50,000-$70,000" 
                                    value={filters.salary}
                                    onChange={e => setFilters({...filters, salary: e.target.value})} 
                                />
                            </div>
                            
                            <Button 
                                onClick={handleSearch} 
                                disabled={loading} 
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Searching...
                                    </>
                                ) : (
                                    "Search Jobs"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-3 space-y-6">
                    {results.map((job, i) => (
                        <motion.div 
                            key={i} 
                            initial={{opacity: 0, y: 20}} 
                            animate={{opacity: 1, y: 0}} 
                            transition={{delay: i * 0.1}}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <Briefcase className="w-8 h-8 text-green-600 mt-1"/>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl">{job.title}</CardTitle>
                                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.company}</p>
                                                <p className="text-sm text-gray-500">{job.location}</p>
                                                {job.salary_range && (
                                                    <p className="text-sm font-medium text-green-600 mt-1">
                                                        {job.salary_range}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-700">{job.summary}</p>
                                    
                                    {job.experience_required && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600">Experience Required:</span>
                                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {job.experience_required}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View & Apply
                                            </Button>
                                        </a>
                                        <Button variant="outline" className="px-6">
                                            Save Job
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    
                    {loading && (
                        <div className="text-center p-8">
                            <Loader2 className="animate-spin w-8 h-8 mx-auto text-green-600"/>
                            <p className="mt-4 text-gray-600">Finding the latest job opportunities for you...</p>
                        </div>
                    )}
                    
                    {!loading && results.length === 0 && (
                        <Card className="p-8 text-center">
                            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Find Jobs?</h3>
                            <p className="text-gray-600">
                                Use the filters on the left to search for current job openings in your areas of interest.
                            </p>
                        </Card>
                    )}
                    
                    {!loading && results.length > 0 && (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Disclaimer:</strong> Job information is sourced from the internet. 
                                Always verify details on the original job posting and apply directly through the provided links.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
