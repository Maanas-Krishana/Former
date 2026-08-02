"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Settings, Trash2, Sparkles, Loader2, Copy } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useModal } from '@/components/ModalProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const { confirm, toast } = useModal();
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleUpdateProfile = async () => {
    setProfileMsg('');
    setProfileErr('');
    if (!newUsername.trim()) {
      setProfileErr('Username cannot be empty.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newUsername, password: newPassword || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Profile updated successfully!');
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.name = newUsername;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setProfileErr(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileErr('Network error occurred.');
    }
  };

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
    const isConfirmed = await confirm({
      title: "Delete Form",
      message: "Are you sure you want to delete this form? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setForms(forms.filter(f => f._id !== id));
        toast("Form deleted successfully", "success");
      } else {
        toast("Failed to delete form", "destructive");
      }
    } catch (err) {
      console.error(err);
      toast("Error deleting form", "destructive");
    }
  };

  const handleDuplicate = async (form: any) => {
    try {
      const duplicatedData = {
        title: `${form.title} (Copy)`,
        description: form.description || '',
        logoUrl: form.logoUrl || '',
        themeColor: form.themeColor || 'indigo',
        requireGoogleSignIn: form.requireGoogleSignIn || false,
        fields: form.fields || [],
        published: form.published !== undefined ? form.published : true,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(duplicatedData)
      });
      if (res.ok) {
        const newForm = await res.json();
        setForms([newForm, ...forms]);
        toast("Form duplicated", "success");
      } else {
        toast("Failed to duplicate form", "destructive");
      }
    } catch (err) {
      console.error(err);
      toast("Error duplicating form", "destructive");
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
      toast("Failed to generate form. Please try again.", "destructive");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE]">
      <header className="bg-white border-b px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <img src="/logo.png" alt="Former Logo" className="w-8 h-8 object-contain rounded-md" />
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Former</h1>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <ThemeToggle />
          <button 
            onClick={() => {
              setNewUsername(user?.name || '');
              setNewPassword('');
              setProfileMsg('');
              setProfileErr('');
              setShowProfileModal(true);
            }}
            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 flex-shrink-0"
            title="Manage Profile"
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden xs:inline">Hello, {user?.name || 'User'}</span>
          <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/login'; }} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 border-b pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-600 mb-1">
              Hi {user?.name || 'User'}, {getGreeting()}!
            </h2>
            <h3 className="text-3xl font-extrabold text-gray-900">My Forms</h3>
            <p className="text-gray-500 mt-1">Manage and view responses for your forms.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Input 
                placeholder="E.g. Create a feedback survey for a coffee shop..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="pl-10 h-10 w-full lg:w-[350px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
              />
              <Sparkles className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" />
            </div>
            <Button onClick={handleGenerateAI} disabled={isGenerating || !aiPrompt.trim()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-sm transition-all border-0 w-full sm:w-auto">
              {isGenerating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
            <div className="text-gray-300 font-light hidden lg:block">|</div>
            <Button onClick={() => window.location.href = '/builder'} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white w-full sm:w-auto">
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
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(form)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8 transition-colors" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(form._id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{form.title}</h3>
                <p className="text-sm text-gray-500 mb-6">Created {new Date(form.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <a href={`/builder?id=${form._id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Manage
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">Manage Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>
            
            {profileMsg && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{profileMsg}</div>}
            {profileErr && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{profileErr}</div>}

            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Username (Name)</Label>
                <Input 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-1">
                <Label>New Password (Optional)</Label>
                <Input 
                  type="password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-400">Leave blank if you do not want to change your password.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button variant="ghost" onClick={() => setShowProfileModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
