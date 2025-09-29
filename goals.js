import React, { useState, useEffect } from "react";
import { Goal, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle, Edit, Trash2, Lightbulb, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/Combobox";
import { InvokeLLM } from "@/integrations/Core";

const goalCategories = [
    { value: "academic", label: "Academic" },
    { value: "skill_development", label: "Skill Development" },
    { value: "personal_growth", label: "Personal Growth" },
    { value: "career", label: "Career" },
];

const GoalForm = ({ goal, onSave, onCancel }) => {
    const [title, setTitle] = useState(goal?.title || "");
    const [description, setDescription] = useState(goal?.description || "");
    const [category, setCategory] = useState(goal?.category || "");
    const [dueDate, setDueDate] = useState(goal?.due_date || "");

    useEffect(() => {
        setTitle(goal?.title || "");
        setDescription(goal?.description || "");
        setCategory(goal?.category || "");
        setDueDate(goal?.due_date || "");
    }, [goal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description, category, due_date: dueDate });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Goal Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <Textarea name="description" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Combobox
                    options={goalCategories}
                    value={category}
                    onValueChange={setCategory}
                    placeholder="Category"
                />
                <Input name="due_date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Goal</Button>
            </div>
        </form>
    );
};

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [suggestedGoals, setSuggestedGoals] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const userGoals = await Goal.filter({ user_email: currentUser.email }, "-created_date");
            setGoals(userGoals);
        } catch (error) {
            console.error("Error loading goals:", error);
        }
        setLoading(false);
    };

    const handleSaveGoal = async (goalData) => {
        const dataWithUser = { ...goalData, user_email: user.email };

        if (editingGoal?.id) {
            await Goal.update(editingGoal.id, dataWithUser);
        } else {
            await Goal.create(dataWithUser);
        }
        setOpenDialog(false);
        setEditingGoal(null);
        loadData();
    };

    const handleDeleteGoal = async (goalId) => {
        await Goal.delete(goalId);
        loadData();
    };
    
    const toggleGoalStatus = async (goal) => {
        const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
        await Goal.update(goal.id, { status: newStatus });
        loadData();
    };
    
    const generateGoalSuggestions = async () => {
        if (!user) return;

        setLoadingSuggestions(true);
        setSuggestedGoals([]);
        const careerPath = user?.selected_career_path?.field || "their chosen career";
        const educationStatus = user?.academic_info?.education_status || "a student";
        const userAge = user?.personal_background?.age || "unknown age";
        
        try {
            const prompt = `
                Based on a user's goal of pursuing a career in "${careerPath}", their current status as ${educationStatus}, and their age of ${userAge}, generate 3-4 specific and actionable goals.
                Categorize each goal as 'academic', 'skill_development', or 'career'.

                Return in this exact JSON format:
                {
                  "suggested_goals": [
                    {
                      "title": "Specific Goal Title",
                      "description": "A brief description of the goal and why it's important for ${careerPath}.",
                      "category": "academic"
                    }
                  ]
                }
            `;
            const result = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggested_goals: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    category: { type: "string", enum: ["academic", "skill_development", "personal_growth", "career"] },
                                },
                                required: ["title", "description", "category"]
                            }
                        }
                    },
                    required: ["suggested_goals"]
                }
            });
            setSuggestedGoals(result.suggested_goals || []);
        } catch (error) {
            console.error("Error generating goal suggestions:", error);
        }
        setLoadingSuggestions(false);
    };

    const handleAddSuggestedGoal = (suggestedGoal) => {
        setEditingGoal({
            id: null,
            ...suggestedGoal,
            due_date: ''
        });
        setOpenDialog(true);
    };

    const careerPath = user?.selected_career_path?.field;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Goals</h1>
                <Dialog open={openDialog} onOpenChange={(isOpen) => { setOpenDialog(isOpen); if (!isOpen) setEditingGoal(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingGoal(null)}><Plus className="mr-2 h-4 w-4" /> Add Goal</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingGoal?.id ? "Edit Goal" : "Create a New Goal"}</DialogTitle>
                        </DialogHeader>
                        <GoalForm goal={editingGoal} onSave={handleSaveGoal} onCancel={() => setOpenDialog(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {user && careerPath && (
                <Card className="mb-8 bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Lightbulb />
                            AI Goal Suggestions for {careerPath}
                        </CardTitle>
                        <CardDescription>
                            Here are some AI-powered goal suggestions to help you on your path.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingSuggestions ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span>Generating ideas...</span>
                            </div>
                        ) : suggestedGoals.length > 0 ? (
                            <div className="space-y-4">
                                {suggestedGoals.map((goal, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-semibold text-base">{goal.title}</p>
                                            <p className="text-sm text-gray-600">{goal.description}</p>
                                            <Badge variant="secondary" className="mt-1 capitalize">{goal.category.replace(/_/g, ' ')}</Badge>
                                        </div>
                                        <Button size="sm" onClick={() => handleAddSuggestedGoal(goal)}>
                                            <Plus className="mr-1 h-4 w-4" /> Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Button onClick={generateGoalSuggestions} disabled={loadingSuggestions}>
                                Generate Goal Ideas
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <motion.div key={goal.id} layout>
                            <Card className={goal.status === 'completed' ? "bg-green-50" : "bg-white"}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => toggleGoalStatus(goal)}>
                                            <CheckCircle className={goal.status === 'completed' ? "text-green-600" : "text-gray-300"} />
                                        </Button>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{goal.category?.replace(/_/g, ' ')}</Badge>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600">{goal.description}</p>
                                    {goal.due_date && <p className="text-xs text-gray-500">Due: {format(new Date(goal.due_date), "PPP")}</p>}
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setEditingGoal(goal); setOpenDialog(true); }}>
                                            <Edit className="mr-2 h-3 w-3" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
