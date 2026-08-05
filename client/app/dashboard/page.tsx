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
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 bg-dotted-grid pb-20">
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2 cursor-pointer border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg shadow-sm hover-neo-lift" onClick={() => router.push('/dashboard')}>
          <img src="/logo.png" alt="Former Logo" className="w-6 h-6 object-contain rounded-md" />
          <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">Former</h1>
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
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-sm border border-transparent shadow-sm hover:translate-y-[-1px] transition-all flex-shrink-0 cursor-pointer"
            title="Manage Profile"
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </button>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 hidden xs:inline">Hello, {user?.name || 'User'}</span>
          <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/login'; }} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold hover:bg-red-50 dark:hover:bg-red-950/20">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 border-b border-gray-200 dark:border-zinc-800 pb-8">
          <div>
            <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              Hi {user?.name || 'User'}, {getGreeting()}!
            </h2>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">My Forms</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1 font-semibold">Manage and view responses for your forms.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 w-full lg:w-[350px] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
              <Input 
                placeholder="E.g. Create a feedback survey..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="pl-10 h-10 w-full border-0 focus-visible:ring-0 text-gray-900 dark:text-gray-100 bg-transparent font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
              />
              <Sparkles className="absolute left-3 top-2.5 h-5 w-5 text-indigo-500" />
            </div>
            <Button 
              onClick={handleGenerateAI} 
              disabled={isGenerating || !aiPrompt.trim()} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold border border-transparent shadow-sm hover:translate-y-[-1px] transition-all w-full sm:w-auto cursor-pointer"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
            <div className="text-gray-300 dark:text-zinc-800 font-bold hidden lg:block">|</div>
            <Button 
              onClick={() => window.location.href = '/builder'} 
              variant="outline" 
              className="border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 bg-white dark:bg-zinc-900 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm hover:translate-y-[-1px] transition-all w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Blank Form
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-mono font-bold">Loading forms...</div>
        ) : forms.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-950 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-zinc-800 shadow-sm">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-2">No forms created yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-semibold">Create your first form to start collecting responses.</p>
            <Button onClick={() => window.location.href = '/builder'} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold border border-transparent shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer">
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <div key={form._id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover-neo-lift flex flex-col justify-between h-[230px] group transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(form)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 h-8 w-8 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded-lg transition-all flex items-center justify-center" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(form._id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded-lg transition-all flex items-center justify-center" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="my-2">
                  <h3 className="text-md font-bold text-gray-900 dark:text-white line-clamp-1">{form.title}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">Created {new Date(form.createdAt).toLocaleDateString()}</p>
                </div>
                
                {/* Telemetry info */}
                <div className="grid grid-cols-3 gap-2 border-t border-dashed border-gray-200 dark:border-zinc-800 py-3 mt-2 font-mono text-[10px] font-bold">
                  <div>
                    <div className="text-gray-400 dark:text-gray-500">VIEWS</div>
                    <div className="text-gray-900 dark:text-white text-xs font-black">{form.views || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 dark:text-gray-500">FIELDS</div>
                    <div className="text-gray-900 dark:text-white text-xs font-black">{form.fields?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 dark:text-gray-500">STATUS</div>
                    <div className={cn("text-[10px] font-bold", form.published ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400")}>
                      {form.published ? "ACTIVE" : "DRAFT"}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                  <a href={`/builder?id=${form._id}`} className="text-xs font-semibold text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline">
                    Manage
                  </a>
                  <a href={`/f/${form._id}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    View Live →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-md">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-xl font-bold cursor-pointer">×</button>
            </div>
            
            {profileMsg && <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-bold rounded-lg">{profileMsg}</div>}
            {profileErr && <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold rounded-lg">{profileErr}</div>}

            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold dark:text-gray-200">Username (Name)</Label>
                <Input 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  placeholder="Your Name"
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold dark:text-gray-200">New Password (Optional)</Label>
                <Input 
                  type="password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 font-medium"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">Leave blank if you do not want to change your password.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setShowProfileModal(false)} className="font-bold dark:text-gray-300">Cancel</Button>
              <Button onClick={handleUpdateProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold border border-transparent shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer">Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

