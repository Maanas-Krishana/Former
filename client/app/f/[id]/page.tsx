"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const THEME_COLORS: Record<string, any> = {
  'indigo': { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-600', ring: 'focus:border-indigo-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:ring-indigo-500' },
  'teal': { bg: 'bg-teal-600', hover: 'hover:bg-teal-700', text: 'text-teal-600', ring: 'focus:border-teal-500 focus-visible:ring-teal-500 focus-visible:border-teal-500 focus:ring-teal-500' },
  'rose': { bg: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-600', ring: 'focus:border-rose-500 focus-visible:ring-rose-500 focus-visible:border-rose-500 focus:ring-rose-500' },
  'amber': { bg: 'bg-amber-600', hover: 'hover:bg-amber-700', text: 'text-amber-600', ring: 'focus:border-amber-500 focus-visible:ring-amber-500 focus-visible:border-amber-500 focus:ring-amber-500' },
  'emerald': { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', ring: 'focus:border-emerald-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 focus:ring-emerald-500' },
  'blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', ring: 'focus:border-blue-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus:ring-blue-500' },
  'violet': { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-600', ring: 'focus:border-violet-500 focus-visible:ring-violet-500 focus-visible:border-violet-500 focus:ring-violet-500' },
  'slate': { bg: 'bg-slate-600', hover: 'hover:bg-slate-700', text: 'text-slate-600', ring: 'focus:border-slate-500 focus-visible:ring-slate-500 focus-visible:border-slate-500 focus:ring-slate-500' },
};

export default function PublicForm({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.message) {
          setForm(data);
          // Increment view count quietly in the background
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${params.id}/view`, { method: 'POST' }).catch(console.error);
        }
      })
      .catch(console.error);
  }, [params.id]);

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, opt: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, opt] };
      } else {
        return { ...prev, [fieldId]: current.filter((v: string) => v !== opt) };
      }
    });
  };

  const handleFileChange = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        handleInputChange(fieldId, data.url);
      } else {
        alert("File upload failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Network error during file upload");
    }
  };

  const submitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          alert(`Please fill out the required field: ${field.label}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        answers,
        respondentEmail: verifiedEmail || undefined 
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/forms/${params.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit response.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-gray-500">Your response has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">Loading...</div>;
  }

  const theme = THEME_COLORS[form.themeColor || 'indigo'] || THEME_COLORS['indigo'];

  if (form.requireGoogleSignIn && !verifiedEmail) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] py-12 px-4 flex justify-center items-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">Sign in to continue</h1>
          <p className="text-gray-500 text-sm">The creator of this form requires you to verify your identity with Google before submitting.</p>
          <div className="flex justify-center mt-6">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'placeholder-id'}>
              <GoogleLogin
                onSuccess={credentialResponse => {
                  if (credentialResponse.credential) {
                    const decoded = jwtDecode<{email: string}>(credentialResponse.credential);
                    setVerifiedEmail(decoded.email);
                  }
                }}
                onError={() => {
                  alert("Google Sign-In Failed");
                }}
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EE] py-12 px-4 flex justify-center items-start">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-sm border p-8 space-y-8">
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800">{form.title}</h1>
        </div>

        <form onSubmit={submitResponse} className="space-y-6">
          {form.fields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-base font-medium text-gray-800">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {['text', 'email', 'number'].includes(field.type) && (
                <Input 
                  type={field.type} 
                  required={field.required}
                  placeholder={field.placeholder} 
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                  pattern={field.type === 'text' ? field.validation?.pattern : undefined}
                  title={field.validation?.customError || (field.validation?.pattern ? `Please match the required format.` : undefined)}
                  className={`w-full bg-gray-50 border-gray-200 ${theme.ring}`} 
                />
              )}

              {field.type === 'textarea' && (
                <textarea 
                  required={field.required}
                  placeholder={field.placeholder} 
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                  className={`w-full flex min-h-[100px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none ${theme.ring}`} 
                />
              )}

              {field.type === 'dropdown' && (
                <select 
                  required={field.required}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full flex h-10 items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none ${theme.ring}`}
                >
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
                      <input 
                        type="checkbox" 
                        id={`${field.id}-${i}`} 
                        checked={(answers[field.id] || []).includes(opt)}
                        onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                        className={`h-4 w-4 rounded border-gray-300 ${theme.text} ${theme.ring}`} 
                      />
                      <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none">{opt}</label>
                    </div>
                  ))}
                </div>
              )}

              {field.type === 'radio' && (
                <div className="space-y-2 pt-1">
                  {field.options?.map((opt: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name={field.id} 
                        id={`${field.id}-${i}`} 
                        required={field.required}
                        checked={answers[field.id] === opt}
                        onChange={() => handleInputChange(field.id, opt)}
                        className={`h-4 w-4 border-gray-300 ${theme.text} ${theme.ring}`} 
                      />
                      <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none">{opt}</label>
                    </div>
                  ))}
                </div>
              )}

              {field.type === 'date' && (
                <Input 
                  type="date" 
                  required={field.required}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full bg-gray-50 border-gray-200 ${theme.ring}`} 
                />
              )}

              {field.type === 'file' && (
                <div className="space-y-2">
                  <Input 
                    type="file" 
                    required={field.required && !answers[field.id]}
                    onChange={(e) => handleFileChange(field.id, e)}
                    className={`w-full bg-gray-50 border-gray-200 ${theme.ring}`} 
                  />
                  {answers[field.id] && (
                    <div className="mt-2 text-sm">
                      <a href={answers[field.id]} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                        File successfully uploaded (View)
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="pt-6 border-t mt-8">
            <Button 
              type="submit"
              disabled={isSubmitting || form.fields.length === 0} 
              className={`w-full text-white py-6 text-lg ${theme.bg} ${theme.hover}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
