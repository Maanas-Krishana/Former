"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Settings, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!token && typeof window !== 'undefined' && localStorage.getItem('token') === null) {
      window.location.href = '/login';
      return;
    }

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setForms(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setForms(forms.filter(f => f._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      
      if (!aiRes.ok) throw new Error("AI failed");
      const { title, fields } = await aiRes.json();

      const formRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: title || aiPrompt, fields })
      });
      const formData = await formRes.json();
      router.push(`/builder?id=${formData._id}`);
    } catch (err) {
      alert("Failed to generate form. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE]">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <img src="/logo.png" alt="Former Logo" className="w-8 h-8 object-contain rounded-md" />
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Former</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Hello, {user?.name || 'User'}</span>
          <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/login'; }} className="text-red-600 hover:text-red-700">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Forms</h2>
            <p className="text-gray-500 mt-1">Manage and view responses for your forms.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Input 
                placeholder="E.g. Create a feedback survey for a coffee shop..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="pl-10 h-10 w-[350px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
              />
              <Sparkles className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" />
            </div>
            <Button onClick={handleGenerateAI} disabled={isGenerating || !aiPrompt.trim()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-sm transition-all border-0">
              {isGenerating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
            <div className="text-gray-300 font-light hidden sm:block">|</div>
            <Button onClick={() => window.location.href = '/builder'} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white">
              <Plus className="w-4 h-4 mr-2" /> Blank Form
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading forms...</div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms created yet</h3>
            <p className="text-gray-500 mb-6">Create your first form to start collecting responses.</p>
            <Button onClick={() => window.location.href = '/builder'} className="bg-indigo-600 hover:bg-indigo-700">
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <div key={form._id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(form._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{form.title}</h3>
                <p className="text-sm text-gray-500 mb-6">Created {new Date(form.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <a href={`/builder?id=${form._id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Edit Form
                  </a>
                  <a href={`/f/${form._id}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    View Live
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
