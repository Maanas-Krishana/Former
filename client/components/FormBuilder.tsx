"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layout, Settings, Share2, BarChart2, Eye, Send, 
  Type, Mail, Hash, ChevronDown, CheckSquare, CircleDot, 
  Calendar, AlignLeft, GripVertical, Plus, Trash2, UploadCloud
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableField } from './SortableField';
import { useAuth } from './AuthProvider';
import { QRCodeSVG } from 'qrcode.react';

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
  const [formTitle, setFormTitle] = useState("Customer Feedback Form");
  const [themeColor, setThemeColor] = useState("indigo");
  const [requireGoogleSignIn, setRequireGoogleSignIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formViews, setFormViews] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const { token, logout, user } = useAuth();

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
              if (data.themeColor) setThemeColor(data.themeColor);
              if (data.requireGoogleSignIn !== undefined) setRequireGoogleSignIn(data.requireGoogleSignIn);
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
      options: ['dropdown', 'checkbox', 'radio'].includes(fieldType) ? ['Option 1'] : [],
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const publishForm = async () => {
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
          themeColor: themeColor,
          requireGoogleSignIn: requireGoogleSignIn,
          fields: fields,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (!formId) {
          setFormId(data._id);
          window.history.replaceState(null, '', `/builder?id=${data._id}`);
        }
        if (data.views) setFormViews(data.views);
        setIsSaving(false);
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
    <div className="flex flex-col h-screen bg-[#F6F4EE]">
      {/* Top Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <a href="/dashboard" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Former Logo" className="w-7 h-7 object-contain rounded-md" />
            <span className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors hidden sm:block">Former</span>
          </a>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="bg-transparent border-b-0 h-auto p-0 space-x-6">
              <TabsTrigger value="build" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none bg-transparent pb-2 px-0 shadow-none font-medium text-gray-500">Build</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none bg-transparent pb-2 px-0 shadow-none font-medium text-gray-500">Settings</TabsTrigger>
              <TabsTrigger value="share" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none bg-transparent pb-2 px-0 shadow-none font-medium text-gray-500">Share</TabsTrigger>
              <TabsTrigger value="responses" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none bg-transparent pb-2 px-0 shadow-none font-medium text-gray-500">Responses</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 mr-2">Hello, {user?.name?.split(' ')[0] || 'User'}</span>
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === 'preview' ? 'build' : 'preview')} className="text-gray-600 font-medium">
            <Eye className="w-4 h-4 mr-2" />
            {activeTab === 'preview' ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button size="sm" onClick={publishForm} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white font-medium">
            <Send className="w-4 h-4 mr-2" />
            {isSaving ? "Publishing..." : "Publish"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/login'; }} className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium ml-2">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Elements */}
        {activeTab === "build" && (
          <div className="w-64 bg-white border-r overflow-y-auto p-4 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">Add Fields</h2>
            <div className="space-y-2">
              {FIELD_TYPES.map((field) => {
                const Icon = field.icon;
                return (
                  <button
                    key={field.type}
                    onClick={() => addField(field.type)}
                    className="flex items-center w-full p-3 border rounded-md bg-white hover:bg-[#F6F4EE] hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left text-sm font-medium text-gray-700 shadow-sm group"
                  >
                    <Icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" />
                    {field.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F6F4EE] flex justify-center items-start">
          {activeTab === "build" && (
            <div className="max-w-3xl w-full h-fit bg-white rounded-xl shadow-sm border p-8 space-y-6">
              
              {/* Form Header */}
              <div className="text-center mb-8 border-b pb-6">
                <Input 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  className="text-2xl font-bold text-center border-transparent hover:border-gray-200 focus:border-teal-500 focus:ring-teal-500 px-0 h-auto py-2 shadow-none"
                />
              </div>

              {/* Form Fields Canvas */}
              <div className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Click on fields in the sidebar to add them</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      {fields.map((field, index) => (
                        <SortableField key={field.id} id={field.id}>
                          {(dragHandleProps: any) => (
                            <div className="group relative border border-transparent hover:border-gray-200 p-4 rounded-lg bg-white transition-all">
                              <div className="flex items-start">
                                <div {...dragHandleProps} className="mt-2 mr-3 opacity-0 group-hover:opacity-100 cursor-grab hover:text-indigo-500 text-gray-400">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Input 
                                      value={field.label}
                                      onChange={(e) => {
                                        const newFields = [...fields];
                                        newFields[index].label = e.target.value;
                                        setFields(newFields);
                                      }}
                                      className="font-medium text-gray-700 border-transparent hover:border-gray-200 focus:border-indigo-500 shadow-none px-2 h-8 flex-1"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
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
                                        className="bg-gray-50 border-gray-200 text-gray-500 text-sm focus:border-indigo-500 w-full" 
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
                                        className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:border-indigo-500" 
                                      />
                                    )}
                                    {['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                                      <div className="space-y-2 mt-2 w-full">
                                        <div className="text-xs font-semibold text-gray-500 uppercase">Options</div>
                                        {field.options?.map((opt: string, oIndex: number) => (
                                          <div key={oIndex} className="flex items-center space-x-2">
                                            {field.type === 'checkbox' && <div className="h-4 w-4 rounded border border-gray-300 bg-white flex-shrink-0"></div>}
                                            {field.type === 'radio' && <div className="h-4 w-4 rounded-full border border-gray-300 bg-white flex-shrink-0"></div>}
                                            {field.type === 'dropdown' && <div className="text-xs text-gray-400 w-4 text-center">{oIndex + 1}.</div>}
                                            <Input 
                                              value={opt}
                                              onChange={(e) => {
                                                const newFields = [...fields];
                                                newFields[index].options[oIndex] = e.target.value;
                                                setFields(newFields);
                                              }}
                                              className="h-8 text-sm bg-white border-gray-200 w-full"
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
                                        <Button variant="outline" size="sm" onClick={() => {
                                          const newFields = [...fields];
                                          newFields[index].options.push(`Option ${newFields[index].options.length + 1}`);
                                          setFields(newFields);
                                        }} className="h-8 text-xs text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                                          <Plus className="w-3 h-3 mr-1" /> Add Option
                                        </Button>
                                      </div>
                                    )}
                                    {field.type === 'date' && <Input type="date" disabled className="bg-gray-50 w-full" />}
                                    {field.type === 'file' && <Input type="file" disabled className="bg-gray-50 w-full" />}
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
          )}
          
          {activeTab === "preview" && (
            <div className="max-w-3xl w-full h-fit bg-white rounded-xl shadow-sm border p-8 space-y-8">
              <div className="text-center mb-8 border-b pb-6">
                <h2 className="text-3xl font-bold text-gray-800">{formTitle}</h2>
              </div>
              <div className="space-y-6">
                {fields.length === 0 ? (
                  <p className="text-center text-gray-500">No fields added yet.</p>
                ) : (
                  fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-base font-medium text-gray-800">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {['text', 'email', 'number'].includes(field.type) && (
                        <Input type={field.type} placeholder={field.placeholder} className="w-full" />
                      )}
                      {field.type === 'textarea' && (
                        <textarea placeholder={field.placeholder} className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" />
                      )}
                      {field.type === 'dropdown' && (
                        <select className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
                              <input type="checkbox" id={`${field.id}-${i}`} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                              <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt}</label>
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
            <div className="max-w-3xl w-full h-fit bg-white rounded-xl shadow-sm border p-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Form Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Form Title</Label>
                  <Input 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)} 
                    className="max-w-md focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label>Theme Color</Label>
                  <p className="text-sm text-gray-500 mb-2">Choose an accent color for your published form.</p>
                  <div className="flex items-center space-x-3">
                    {THEME_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setThemeColor(color.id)}
                        className={`w-8 h-8 rounded-full ${color.bg} ${themeColor === color.id ? 'ring-2 ring-offset-2 ring-gray-900' : 'ring-1 ring-black/10'} transition-all`}
                        title={color.id}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t mt-6">
                  <h3 className="text-lg font-medium mb-4">Field Requirements</h3>
                  <div className="space-y-4">
                    {fields.length === 0 ? (
                      <p className="text-gray-500 text-sm">Add fields in the Build tab to manage their settings here.</p>
                    ) : fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col p-4 border rounded-lg bg-gray-50 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{field.label}</p>
                            <p className="text-xs text-gray-500 uppercase">{field.type}</p>
                          </div>
                          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border shadow-sm">
                            <Label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer font-medium text-gray-700">Required</Label>
                            <input 
                              type="checkbox" 
                              id={`req-${field.id}`}
                              checked={field.required}
                              onChange={(e) => {
                                const newFields = [...fields];
                                newFields[index].required = e.target.checked;
                                setFields(newFields);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>
                        </div>
                        
                        {(field.type === 'text' || field.type === 'textarea') && (
                          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                            <div>
                              <Label className="text-xs text-gray-500 mb-1 block">Min Length</Label>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="E.g. 10" 
                                className="h-8 text-sm"
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
                              <Label className="text-xs text-gray-500 mb-1 block">Max Length</Label>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="E.g. 50" 
                                className="h-8 text-sm"
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
                                  <Label className="text-xs text-gray-500 mb-1 block">Regex Pattern (Optional)</Label>
                                  <Input 
                                    placeholder="E.g. ^\d{10}$" 
                                    className="h-8 text-sm font-mono"
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
                                  <Label className="text-xs text-gray-500 mb-1 block">Custom Error Message</Label>
                                  <Input 
                                    placeholder="E.g. Must be 10 digits" 
                                    className="h-8 text-sm"
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
                  <Label className="text-base font-semibold text-gray-800 mb-4 block">Security</Label>
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">Require Google Sign-In</h4>
                      <p className="text-xs text-gray-500">Respondents must log in with Google to fill out this form. Prevents spam.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={requireGoogleSignIn} onChange={(e) => setRequireGoogleSignIn(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "share" && (
            <div className="max-w-3xl w-full h-fit bg-white rounded-xl shadow-sm border p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Share Your Form</h2>
              {!formId ? (
                <div className="p-8 border rounded-xl bg-gray-50 text-gray-500">
                  You must publish the form before you can share it.
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-gray-500 max-w-md mx-auto">Your form is live and ready to collect responses. Share the QR code or copy the link below.</p>
                  
                  <div className="flex justify-center">
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm inline-block">
                      <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}`} size={200} />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 max-w-lg mx-auto bg-gray-50 p-2 rounded-lg border">
                    <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}`} className="bg-transparent border-0 font-mono text-sm focus-visible:ring-0 shadow-none" />
                    <Button onClick={() => {
                      navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/f/${formId}`);
                      alert("Link copied to clipboard!");
                    }} className="bg-indigo-600 hover:bg-indigo-700">Copy Link</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "responses" && (
            <div className="max-w-4xl w-full h-fit bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold mb-6">Form Responses</h2>
              {!formId ? (
                <div className="text-center p-12 border rounded-xl bg-gray-50 text-gray-500">
                  You must publish the form before you can view responses.
                </div>
              ) : isLoadingResponses ? (
                <div className="text-center p-12 text-gray-500">Loading responses...</div>
              ) : responses.length === 0 ? (
                <div className="text-center p-12 border rounded-xl bg-gray-50 text-gray-500">
                  No responses yet. Share your form link! <br />
                  <span className="font-mono text-xs mt-2 inline-block bg-white p-2 rounded border">http://localhost:3001/f/{formId}</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-6 border rounded-xl flex flex-col items-center justify-center bg-gray-50">
                      <div className="text-4xl font-bold text-teal-600 mb-2">{responses.length}</div>
                      <div className="text-sm text-gray-500 font-medium">Total Submissions</div>
                    </div>
                    <div className="p-6 border rounded-xl flex flex-col items-center justify-center bg-gray-50">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{formViews}</div>
                      <div className="text-sm text-gray-500 font-medium">Total Views</div>
                    </div>
                    <div className="p-6 border rounded-xl flex flex-col items-center justify-center bg-gray-50">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {formViews > 0 ? Math.round((responses.length / formViews) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Conversion Rate</div>
                    </div>
                  </div>
                  <div className="border rounded-xl overflow-hidden">
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
                                {Array.isArray(item.answers[f.id]) 
                                  ? item.answers[f.id].join(', ') 
                                  : item.answers[f.id]?.toString() || '-'}
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
