"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layout, Settings, Share2, BarChart2, Eye, Send, LogOut, Menu, X, Star, Sparkles, Download,
  Type, Mail, Hash, ChevronDown, CheckSquare, CircleDot, 
  Calendar, AlignLeft, GripVertical, Plus, Trash2, UploadCloud
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableField } from './SortableField';
import { useAuth } from './AuthProvider';
import { useModal } from './ModalProvider';
import { QRCodeSVG } from 'qrcode.react';
import { ThemeToggle } from './ThemeToggle';

// Field types definitions
const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio Button', icon: CircleDot },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft },
  { type: 'file', label: 'File Upload', icon: UploadCloud },
  { type: 'rating', label: 'Star Rating', icon: Star },
];

const THEME_COLORS = [
  { id: 'indigo', bg: 'bg-indigo-600', text: 'text-indigo-600' },
  { id: 'teal', bg: 'bg-teal-600', text: 'text-teal-600' },
  { id: 'rose', bg: 'bg-rose-600', text: 'text-rose-600' },
  { id: 'amber', bg: 'bg-amber-600', text: 'text-amber-600' },
  { id: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { id: 'blue', bg: 'bg-blue-600', text: 'text-blue-600' },
  { id: 'violet', bg: 'bg-violet-600', text: 'text-violet-600' },
  { id: 'slate', bg: 'bg-slate-600', text: 'text-slate-600' },
];

export default function FormBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("build");
  const [showSidebar, setShowSidebar] = useState(false);
  const [formTitle, setFormTitle] = useState("Customer Feedback Form");
  const [formDescription, setFormDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [themeColor, setThemeColor] = useState("indigo");
  const [requireGoogleSignIn, setRequireGoogleSignIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [formViews, setFormViews] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [previewRatings, setPreviewRatings] = useState<Record<string, number>>({});
  const { token, logout, user } = useAuth();
  const { toast } = useModal();

  useEffect(() => {
    if (!token && typeof window !== 'undefined' && localStorage.getItem('token') === null) {
      window.location.href = '/login';
    } else if (token && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('id');
      if (editId) {
        setFormId(editId);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${editId}`)
          .then(res => res.json())
          .then(data => {
            if (data && data._id) {
              setFormTitle(data.title);
              setFields(data.fields);
              if (data.description) setFormDescription(data.description);
              if (data.logoUrl) setLogoUrl(data.logoUrl);
              if (data.themeColor) setThemeColor(data.themeColor);
              if (data.requireGoogleSignIn !== undefined) setRequireGoogleSignIn(data.requireGoogleSignIn);
              if (data.published !== undefined) setIsPublished(data.published);
            }
          })
          .catch(console.error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "responses" && formId && token) {
      setIsLoadingResponses(true);
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${formId}/responses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${formId}`).then(res => res.json())
      ])
        .then(([responsesData, formData]) => {
          setResponses(responsesData);
          if (formData && formData.views) setFormViews(formData.views);
          setIsLoadingResponses(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingResponses(false);
        });
    }
  }, [activeTab, formId, token]);

  const addField = (fieldType: string) => {
    const newField = {
      id: uuidv4(),
      type: fieldType,
      label: `New ${fieldType} field`,
      placeholder: `Enter your ${fieldType}...`,
      required: false,
      options: ['dropdown', 'select', 'checkbox', 'radio'].includes(fieldType) ? ['Option 1'] : [],
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const publishForm = async () => {
    if (!token) {
      alert("You must be logged in to publish forms.");
      return;
    }
    if (fields.length === 0) {
      alert("Please add at least one field before publishing.");
      return;
    }
    setIsSaving(true);
    try {
      const url = formId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${formId}` 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms`;
      const method = formId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          logoUrl: logoUrl,
          themeColor: themeColor,
          requireGoogleSignIn: requireGoogleSignIn,
          fields: fields,
          published: true,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (!formId) {
          setFormId(data._id);
          window.history.replaceState(null, '', `/builder?id=${data._id}`);
        }
        if (data.views) setFormViews(data.views);
        setIsPublished(true);
        setIsSaving(false);
        alert("Form published successfully!");
      } else {
        alert("Failed to publish form.");
      }
    } catch (error) {
      console.error(error);
      alert("Error publishing form. Is the backend running?");
    } finally {
      setIsSaving(false);
    }
  };

  const unpublishForm = async () => {
    if (!formId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${formId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          logoUrl: logoUrl,
          themeColor: themeColor,
          requireGoogleSignIn: requireGoogleSignIn,
          fields: fields,
          published: false,
        }),
      });
      if (response.ok) {
        setIsPublished(false);
        alert("Form unpublished successfully!");
      } else {
        alert("Failed to unpublish form.");
      }
    } catch (error) {
      console.error(error);
      alert("Error unpublishing form.");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;
    
    const headers = ['Submission Date'];
    if (requireGoogleSignIn) {
      headers.push('Verified Email');
    }
    fields.forEach((f) => {
      headers.push(f.label);
    });
    
    const rows = responses.map((r) => {
      const row = [new Date(r.createdAt).toLocaleString()];
      if (requireGoogleSignIn) {
        row.push(r.respondentEmail || 'N/A');
      }
      fields.forEach((f) => {
        const val = r.answers?.[f.id];
        row.push(val !== undefined ? String(val) : '');
      });
      return row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${formTitle.toLowerCase().replace(/\s+/g, '_')}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAISummary = async () => {
    if (responses.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/ai/summarize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formTitle,
          fields,
          responses
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      } else {
        alert("Failed to generate AI summary.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F6F4EE] dark:bg-zinc-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
          <a href="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
            <img src="/logo.png" alt="Former Logo" className="w-7 h-7 object-contain rounded-md" />
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hidden md:block">Former</span>
          </a>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto flex-1">
            <TabsList className="bg-gray-100/70 dark:bg-zinc-800/60 p-1.5 rounded-xl space-x-1 flex items-center border dark:border-zinc-800/80">
              <TabsTrigger 
                value="build" 
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all duration-200 flex items-center data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:-translate-y-[1px] data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-zinc-700/80"
              >
                <Layout className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Build</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all duration-200 flex items-center data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:-translate-y-[1px] data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-zinc-700/80"
              >
                <Settings className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="share" 
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all duration-200 flex items-center data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:-translate-y-[1px] data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-zinc-700/80"
              >
                <Share2 className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Share</span>
              </TabsTrigger>
              <TabsTrigger 
                value="responses" 
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all duration-200 flex items-center data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:-translate-y-[1px] data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-zinc-700/80"
              >
                <BarChart2 className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Responses</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <ThemeToggle />
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden lg:inline">Hello, {user?.name?.split(' ')[0] || 'User'}</span>
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === 'preview' ? 'build' : 'preview')} className="text-gray-600 dark:text-gray-300 dark:border-zinc-700 font-medium px-2.5 sm:px-3">
            <Eye className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">{activeTab === 'preview' ? 'Exit Preview' : 'Preview'}</span>
          </Button>
          {formId && isPublished ? (
            <Button size="sm" onClick={unpublishForm} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 sm:px-3">
              <Send className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{isSaving ? "Unpublishing..." : "Unpublish"}</span>
            </Button>
          ) : (
            <Button size="sm" onClick={publishForm} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-2.5 sm:px-3">
              <Send className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{isSaving ? "Publishing..." : "Publish"}</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/login'; }} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium px-2.5 sm:px-3">
            <LogOut className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar backdrop */}
        {activeTab === "build" && showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Left Sidebar - Elements */}
        {activeTab === "build" && (
          <div className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 overflow-y-auto p-4 flex flex-col transition-transform duration-200 md:relative md:translate-x-0",
            showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="space-y-2 mt-2">
              {FIELD_TYPES.map((field) => {
                const Icon = field.icon;
                return (
                  <button
                    key={field.type}
                    onClick={() => {
                      addField(field.type);
                      setShowSidebar(false);
                    }}
                    className="flex items-center w-full p-3 border dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 hover:bg-[#F6F4EE] dark:hover:bg-zinc-800 hover:border-indigo-500 transition-all text-left text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm group"
                  >
                    <Icon className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                    {field.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F6F4EE] dark:bg-zinc-950 flex flex-col items-center">
          {activeTab === "build" && (
            <>
              {/* Mobile Sidebar Toggle */}
              <Button 
                onClick={() => setShowSidebar(true)} 
                className="md:hidden w-full mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Form Fields
              </Button>

              <div className="max-w-3xl w-full h-fit bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-4 sm:p-8 space-y-6">
              
              {/* Form Header */}
              <div className="text-center mb-8 border-b dark:border-zinc-800 pb-6 space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-md" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  )}
                  <Input 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)} 
                    className="text-2xl font-bold text-center text-gray-900 dark:text-white border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-teal-500 focus:ring-teal-500 px-0 h-auto py-2 shadow-none w-auto min-w-[200px] bg-transparent"
                  />
                </div>
                <Input 
                  placeholder="Form description (optional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="text-gray-500 dark:text-gray-400 text-sm text-center border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-teal-500 focus:ring-teal-500 px-0 h-auto py-1 shadow-none bg-transparent"
                />
              </div>

              {/* Form Fields Canvas */}
              <div className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                    <Layout className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Click on fields in the sidebar to add them</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      {fields.map((field, index) => (
                        <SortableField key={field.id} id={field.id}>
                          {(dragHandleProps: any) => (
                            <div className="group relative border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 p-4 rounded-lg bg-white dark:bg-zinc-900 transition-all">
                              <div className="flex items-start">
                                <div {...dragHandleProps} className="mt-2 mr-3 opacity-0 group-hover:opacity-100 cursor-grab hover:text-indigo-500 text-gray-400 dark:text-gray-500">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Input 
                                      value={field.label} 
                                      onChange={(e) => {
                                        const newFields = [...fields];
                                        newFields[index].label = e.target.value;
                                        setFields(newFields);
                                      }}
                                      className="font-medium text-gray-800 dark:text-gray-100 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-indigo-500 px-1 py-0 h-auto text-base bg-transparent"
                                    />
                                    <div className="flex items-center space-x-2">
                                      <label className="flex items-center text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={field.required || false}
                                          onChange={(e) => {
                                            const newFields = [...fields];
                                            newFields[index].required = e.target.checked;
                                            setFields(newFields);
                                          }}
                                          className="mr-1 rounded border-gray-300 dark:border-zinc-700"
                                        />
                                        Required
                                      </label>
                                      <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="h-8 w-8 text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Field Preview based on type */}
                                  <div className="px-2 pt-1 overflow-hidden w-full">
                                    {['text', 'email', 'number'].includes(field.type) && (
                                      <Input 
                                        placeholder="Placeholder text (click to edit)" 
                                        value={field.placeholder}
                                        onChange={(e) => {
                                          const newFields = [...fields];
                                          newFields[index].placeholder = e.target.value;
                                          setFields(newFields);
                                        }}
                                        className="bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-100 text-sm focus:border-indigo-500 w-full" 
                                      />
                                    )}
                                    {field.type === 'textarea' && (
                                      <textarea 
                                        value={field.placeholder}
                                        onChange={(e) => {
                                          const newFields = [...fields];
                                          newFields[index].placeholder = e.target.value;
                                          setFields(newFields);
                                        }}
                                        placeholder="Placeholder text (click to edit)" 
                                        className="w-full flex min-h-[80px] rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-background focus-visible:outline-none focus-visible:border-indigo-500" 
                                      />
                                    )}
                                    {['dropdown', 'select', 'checkbox', 'radio'].includes(field.type) && (
                                       <div className="space-y-2 mt-2 w-full">
                                         <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Options</div>
                                         {field.options?.map((opt: string, oIndex: number) => (
                                           <div key={oIndex} className="flex items-center space-x-2">
                                             {field.type === 'checkbox' && <div className="h-4 w-4 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-shrink-0"></div>}
                                             {field.type === 'radio' && <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-shrink-0"></div>}
                                             {['dropdown', 'select'].includes(field.type) && <div className="text-xs text-gray-400 w-4 text-center">{oIndex + 1}.</div>}
                                             <Input 
                                               value={opt}
                                               onChange={(e) => {
                                                 const newFields = [...fields];
                                                 newFields[index].options[oIndex] = e.target.value;
                                                 setFields(newFields);
                                               }}
                                               className="h-8 text-sm bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 w-full"
                                             />
                                             <Button variant="ghost" size="icon" onClick={() => {
                                               const newFields = [...fields];
                                               newFields[index].options = newFields[index].options.filter((_: any, i: number) => i !== oIndex);
                                               setFields(newFields);
                                             }} className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-red-500">
                                               <Trash2 className="h-3 w-3" />
                                             </Button>
                                           </div>
                                         ))}
                                         <Button variant="ghost" size="sm" onClick={() => {
                                           const newFields = [...fields];
                                           if (!newFields[index].options) newFields[index].options = [];
                                           newFields[index].options.push(`Option ${newFields[index].options.length + 1}`);
                                           setFields(newFields);
                                         }} className="text-xs text-indigo-600 dark:text-indigo-400 p-0 h-auto">
                                           + Add Option
                                         </Button>
                                       </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </SortableField>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>

            </div>
          </>
        )}
          
          {activeTab === "preview" && (
            <div className="max-w-3xl w-full h-fit bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-4 sm:p-8 space-y-8">
              <div className="text-center mb-8 border-b dark:border-zinc-800 pb-6 space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-md" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  )}
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{formTitle}</h2>
                </div>
                {formDescription && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">{formDescription}</p>
                )}
              </div>
              <div className="space-y-6">
                {fields.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">No fields added yet.</p>
                ) : (
                  fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-base font-medium text-gray-800 dark:text-gray-200">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {['text', 'email', 'number'].includes(field.type) && (
                        <Input type={field.type} placeholder={field.placeholder} className="w-full bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100" />
                      )}
                      {field.type === 'textarea' && (
                        <textarea placeholder={field.placeholder} className="w-full flex min-h-[100px] rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" />
                      )}
                      {['dropdown', 'select'].includes(field.type) && (
                        <select className="w-full flex h-10 items-center justify-between rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Select an option</option>
                          {field.options?.map((opt: string, i: number) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'checkbox' && (
                        <div className="space-y-2 pt-1">
                          {field.options?.map((opt: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              <input type="checkbox" id={`${field.id}-${i}`} className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500" />
                              <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      {field.type === 'radio' && (
                        <div className="space-y-2 pt-1">
                          {field.options?.map((opt: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              <input type="radio" name={field.id} id={`${field.id}-${i}`} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                              <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      {field.type === 'date' && <Input type="date" className="w-full" />}
                      {field.type === 'file' && <Input type="file" className="w-full" />}
                      {field.type === 'rating' && (
                        <div className="flex items-center space-x-1 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = (previewRatings[field.id] || 0) >= star;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setPreviewRatings({ ...previewRatings, [field.id]: star })}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star className={cn("w-8 h-8", isFilled ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-transparent")} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {fields.length > 0 && (
                <div className="pt-6 border-t mt-8">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg">Submit Response</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl w-full h-fit bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-4 sm:p-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Form Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-800 dark:text-gray-200">Form Title</Label>
                  <Input 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)} 
                    className="max-w-md focus:border-indigo-500 bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-800 dark:text-gray-200">Form Description</Label>
                  <textarea 
                    value={formDescription} 
                    onChange={(e) => setFormDescription(e.target.value)} 
                    placeholder="Enter description for your form..."
                    className="w-full max-w-md flex min-h-[80px] rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-800 dark:text-gray-200">Form Logo Image URL</Label>
                  <Input 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)} 
                    placeholder="https://example.com/logo.png"
                    className="max-w-md focus:border-indigo-500 bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Provide an absolute image URL for your organization/form logo.</p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label className="text-gray-800 dark:text-gray-200">Theme Color</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Choose an accent color for your published form.</p>
                  <div className="flex items-center space-x-3">
                    {THEME_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setThemeColor(color.id)}
                        className={`w-8 h-8 rounded-full ${color.bg} ${themeColor === color.id ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-zinc-900' : 'ring-1 ring-black/10 dark:ring-white/20'} transition-all`}
                        title={color.id}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-zinc-800 mt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Field Requirements</h3>
                  <div className="space-y-4">
                    {fields.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Add fields in the Build tab to manage their settings here.</p>
                    ) : fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col p-4 border dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-950 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{field.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{field.type}</p>
                          </div>
                          <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-md border dark:border-zinc-800 shadow-sm">
                            <Label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer font-medium text-gray-700 dark:text-gray-300">Required</Label>
                            <input 
                              type="checkbox" 
                              id={`req-${field.id}`}
                              checked={field.required}
                              onChange={(e) => {
                                const newFields = [...fields];
                                newFields[index].required = e.target.checked;
                                setFields(newFields);
                              }}
                              className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>
                        </div>
                        
                        {(field.type === 'text' || field.type === 'textarea') && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t dark:border-zinc-800 pt-4">
                            <div>
                              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Length</Label>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="E.g. 10" 
                                className="h-8 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100"
                                value={field.validation?.minLength || ''}
                                onChange={(e) => {
                                  const newFields = [...fields];
                                  if (!newFields[index].validation) newFields[index].validation = {};
                                  newFields[index].validation.minLength = e.target.value ? parseInt(e.target.value) : undefined;
                                  setFields(newFields);
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Length</Label>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="E.g. 50" 
                                className="h-8 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100"
                                value={field.validation?.maxLength || ''}
                                onChange={(e) => {
                                  const newFields = [...fields];
                                  if (!newFields[index].validation) newFields[index].validation = {};
                                  newFields[index].validation.maxLength = e.target.value ? parseInt(e.target.value) : undefined;
                                  setFields(newFields);
                                }}
                              />
                            </div>
                            
                            {field.type === 'text' && (
                              <>
                                <div>
                                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Regex Pattern (Optional)</Label>
                                  <Input 
                                    placeholder="E.g. ^\d{10}$" 
                                    className="h-8 text-sm font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100"
                                    value={field.validation?.pattern || ''}
                                    onChange={(e) => {
                                      const newFields = [...fields];
                                      if (!newFields[index].validation) newFields[index].validation = {};
                                      newFields[index].validation.pattern = e.target.value;
                                      setFields(newFields);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Custom Error Message</Label>
                                  <Input 
                                    placeholder="E.g. Must be 10 digits" 
                                    className="h-8 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100"
                                    value={field.validation?.customError || ''}
                                    onChange={(e) => {
                                      const newFields = [...fields];
                                      if (!newFields[index].validation) newFields[index].validation = {};
                                      newFields[index].validation.customError = e.target.value;
                                      setFields(newFields);
                                    }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 block">Security</Label>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Require Google Sign-In</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Respondents must log in with Google to fill out this form. Prevents spam.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={requireGoogleSignIn} onChange={(e) => setRequireGoogleSignIn(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "share" && (
            <div className="max-w-3xl w-full h-fit bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Share Your Form</h2>
              {!formId ? (
                <div className="p-8 border dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-gray-400">
                  You must publish the form before you can share it.
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Your form is live and ready to collect responses. Share the QR code or copy the link below.</p>
                  
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 inline-block">
                      <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}`} size={200} />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 max-w-lg mx-auto bg-gray-50 dark:bg-zinc-950 p-2 rounded-lg border dark:border-zinc-800">
                    <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}`} className="bg-transparent border-0 font-mono text-sm text-gray-900 dark:text-gray-100 focus-visible:ring-0 shadow-none" />
                    <Button onClick={() => {
                      navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}`);
                      toast("Link copied to clipboard!", "success");
                    }} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0">Copy Link</Button>
                  </div>

                  <div className="border-t dark:border-zinc-800 pt-8 space-y-4 text-left max-w-lg mx-auto">
                    <h3 className="font-bold text-gray-800 dark:text-white text-base">Embed in your Website</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">Copy the code snippet below to seamlessly embed this live form inside any HTML page, React app, WordPress, or site builder.</p>
                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-zinc-950 p-2 rounded-lg border dark:border-zinc-800">
                      <Input 
                        readOnly 
                        value={`<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}" width="100%" height="600px" frameborder="0" style="border:none; border-radius:12px;">Loading...</iframe>`} 
                        className="bg-transparent border-0 font-mono text-xs text-gray-900 dark:text-gray-100 focus-visible:ring-0 shadow-none truncate" 
                      />
                      <Button onClick={() => {
                        const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}" width="100%" height="600px" frameborder="0" style="border:none; border-radius:12px;">Loading...</iframe>`;
                        navigator.clipboard.writeText(embedCode);
                        toast("Embed code copied to clipboard!", "success");
                      }} className="bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 px-3 h-9 flex-shrink-0">Copy Code</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "responses" && (
            <div className="max-w-4xl w-full h-fit bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 border-b dark:border-zinc-800 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Form Responses</h2>
                {responses.length > 0 && (
                  <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2 border-gray-300 dark:border-zinc-700 dark:text-gray-200">
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </Button>
                )}
              </div>
              {!formId ? (
                <div className="text-center p-12 border dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-gray-400">
                  You must publish the form before you can view responses.
                </div>
              ) : isLoadingResponses ? (
                <div className="text-center p-12 text-gray-500 dark:text-gray-400">Loading responses...</div>
              ) : responses.length === 0 ? (
                <div className="text-center p-12 border dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-gray-400">
                  No responses yet. Share your form link! <br />
                  <span className="font-mono text-xs mt-2 inline-block bg-white dark:bg-zinc-900 p-2 rounded border dark:border-zinc-800 text-gray-800 dark:text-gray-200 break-all max-w-full">
                    {typeof window !== 'undefined' ? `${window.location.origin}/f/${formId}` : `https://former-six.vercel.app/f/${formId}`}
                  </span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 w-full">
                    <div className="p-4 sm:p-6 border dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
                      <div className="text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">{responses.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">Total Submissions</div>
                    </div>
                    <div className="p-4 sm:p-6 border dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formViews}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">Total Views</div>
                    </div>
                    <div className="p-4 sm:p-6 border dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
                      <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {formViews > 0 ? Math.round((responses.length / formViews) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">Conversion Rate</div>
                    </div>
                  </div>

                  {/* AI Summary Insights */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 rounded-xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg flex-shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">AI Response Analysis</h3>
                      </div>
                      <Button 
                        onClick={generateAISummary} 
                        disabled={isGeneratingSummary} 
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 shadow-sm sm:w-auto w-full justify-center flex-shrink-0"
                      >
                        {isGeneratingSummary ? (
                          <span>Analyzing...</span>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>{aiSummary ? 'Regenerate Analysis' : 'Analyze with AI'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {aiSummary ? (
                      <div className="text-sm text-gray-700 leading-relaxed bg-white border border-indigo-50 p-5 rounded-lg whitespace-pre-line shadow-inner max-h-[300px] overflow-y-auto">
                        {aiSummary}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Click &quot;Analyze with AI&quot; to summarize the submissions and extract trends and actionable recommendations.
                      </p>
                    )}
                  </div>

                  <div className="border rounded-xl overflow-x-auto w-full">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          {requireGoogleSignIn && <th className="px-6 py-4">Verified Email</th>}
                          {fields.slice(0, 3).map((f) => (
                            <th key={f.id} className="px-6 py-4 truncate max-w-[150px]">{f.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {responses.map((item, index) => (
                          <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                            {requireGoogleSignIn && (
                              <td className="px-6 py-4 font-medium text-indigo-600 truncate max-w-[150px]">
                                {item.respondentEmail || 'N/A'}
                              </td>
                            )}
                            {fields.slice(0, 3).map((f) => (
                              <td key={f.id} className="px-6 py-4 font-medium truncate max-w-[150px]">
                                {item.answers && Array.isArray(item.answers[f.id]) 
                                  ? item.answers[f.id].join(', ') 
                                  : (item.answers && item.answers[f.id]?.toString()) || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
