import React, { useState, useEffect, useCallback } from "react";
import { PortfolioItem, User } from "../src/entities/all";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../src/components/ui/dialog";
import { Input } from "../src/components/ui/input";
import { Textarea } from "../src/components/ui/textarea";
import { UploadFile } from "../src/integrations/Core";
import { Plus, Edit, Trash2, Link as LinkIcon, Share2, Lightbulb, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "../src/components/ui/badge";
import { Combobox } from "../src/components/ui/Combobox";
import { InvokeLLM } from "../src/integrations/Core";

const portfolioCategories = [
    { value: "project", label: "Project" },
    { value: "achievement", label: "Achievement" },
    { value: "experience", label: "Experience" },
    { value: "skill", label: "Skill" },
];

const PortfolioForm = ({ item, onSave, onCancel }) => {
    const [title, setTitle] = useState(item?.title || "");
    const [description, setDescription] = useState(item?.description || "");
    const [category, setCategory] = useState(item?.category || "");
    const [date, setDate] = useState(item?.date || "");
    const [link, setLink] = useState(item?.link || "");
    const [file, setFile] = useState(null);

    useEffect(() => {
        setTitle(item?.title || "");
        setDescription(item?.description || "");
        setCategory(item?.category || "");
        setDate(item?.date || "");
        setLink(item?.link || "");
        setFile(null);
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description, category, date, link, file, existingFileUrl: item?.file_url });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Title (e.g., 'Science Fair Project')" value={title} onChange={e => setTitle(e.target.value)} required />
            <Textarea name="description" placeholder="Describe your project, achievement, or experience" value={description} onChange={e => setDescription(e.target.value)} />
            <Combobox
                options={portfolioCategories}
                value={category}
                onValueChange={setCategory}
                placeholder="Select Category"
            />
            <Input name="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input name="link" placeholder="External Link (e.g., GitHub, Behance)" value={link} onChange={e => setLink(e.target.value)} />
            <Input name="file" type="file" onChange={e => setFile(e.target.files[0])} />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Item</Button>
            </div>
        </form>
    );
};

export default function PortfolioPage() {
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [checklist, setChecklist] = useState([]);
    const [loadingChecklist, setLoadingChecklist] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const generatePortfolioChecklist = useCallback(async () => {
        const careerPath = user?.selected_career_path?.field;
        
        if (!careerPath) {
            setChecklist([]);
            setLoadingChecklist(false);
            return;
        }

        setLoadingChecklist(true);
        try {
            const prompt = `A user wants to build a portfolio for a career in "${careerPath}". What are 5-6 essential components of a strong portfolio for this specific field?

            Return in this exact JSON format:
            {
              "checklist": [
                {
                  "item": "Essential portfolio item (e.g., 'Project Case Studies')",
                  "description": "Brief explanation of what this is and why it's important for a ${careerPath} role."
                }
              ]
            }`;
            const result = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        checklist: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    item: { type: "string" },
                                    description: { type: "string" }
                                },
                                required: ["item", "description"]
                            }
                        }
                    },
                    required: ["checklist"]
                }
            });
            setChecklist(result.checklist || []);
        } catch(e) {
            console.error("Error generating portfolio checklist:", e);
            setChecklist([]);
        } finally {
            setLoadingChecklist(false);
        }
    }, [user?.selected_career_path?.field]);

    useEffect(() => {
        generatePortfolioChecklist();
    }, [generatePortfolioChecklist]);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const portfolioItems = await PortfolioItem.filter({ user_email: currentUser.email }, "-date");
            setItems(portfolioItems);
        } catch (error) {
            console.error("Error loading portfolio:", error);
        }
        setLoading(false);
    };
    
    const handleSaveItem = async (itemData) => {
        let file_url = itemData.existingFileUrl || null;

        if (itemData.file && itemData.file.size > 0) {
            const uploadResult = await UploadFile({ file: itemData.file });
            file_url = uploadResult.file_url;
        }

        const dataToSave = {
            user_email: user.email,
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            date: itemData.date,
            link: itemData.link,
            file_url: file_url,
        };

        if (editingItem?.id) {
            await PortfolioItem.update(editingItem.id, dataToSave);
        } else {
            await PortfolioItem.create(dataToSave);
        }
        setOpenDialog(false);
        setEditingItem(null);
        loadData();
    };
    
    const handleDeleteItem = async (itemId) => {
        await PortfolioItem.delete(itemId);
        loadData();
    };

    const careerPath = user?.selected_career_path?.field;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Portfolio</h1>
                <div className="flex gap-2">
                    <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                    <Dialog open={openDialog} onOpenChange={(isOpen) => { setOpenDialog(isOpen); if(!isOpen) setEditingItem(null); }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingItem(null)}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>{editingItem?.id ? "Edit Item" : "Add to Portfolio"}</DialogTitle></DialogHeader>
                            <PortfolioForm item={editingItem} onSave={handleSaveItem} onCancel={() => setOpenDialog(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {careerPath && (
                <Card className="mb-8 bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900">
                            <Lightbulb />
                            Portfolio Guide for {careerPath}
                        </CardTitle>
                        <CardDescription>
                            Here are the key components of a strong portfolio for your chosen field.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingChecklist ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span>Generating your portfolio guide...</span>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {checklist.map((check, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                                        <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{check.item}</p>
                                            <p className="text-sm text-gray-600">{check.description}</p>
                                        </div>
                                    </li>
                                ))}
                                {checklist.length === 0 && !loadingChecklist && (
                                    <p className="text-gray-500 text-center">No specific guide available for your career path yet. Add some items to your portfolio!</p>
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map(item => (
                        <motion.div key={item.id} layout>
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle>{item.title}</CardTitle>
                                    <div className="flex justify-between items-center text-sm">
                                        <Badge variant="secondary">{item.category}</Badge>
                                        {item.date && <p className="text-gray-500">{format(new Date(item.date), "MMM yyyy")}</p>}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-600">{item.description}</p>
                                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1 text-sm"><LinkIcon className="h-3 w-3"/>View Link</a>}
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setOpenDialog(true); }}><Edit className="mr-2 h-3 w-3" /> Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}><Trash2 className="mr-2 h-3 w-3" /> Delete</Button>
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
