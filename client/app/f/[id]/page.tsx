"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepProgress, StepInfo } from '@/components/StepProgress';
import { cn } from '@/lib/utils';

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
  const [currentStep, setCurrentStep] = useState(0);

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
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-955 flex flex-col items-center justify-center p-4 space-y-6 bg-dotted-grid transition-colors duration-200">
        <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-md p-6 sm:p-12 text-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-sm">✓</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Thank You!</h1>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Your response has been recorded successfully.</p>
        </div>
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 font-mono">
          This form is made by <span className="font-bold">Former</span> proudly in India
        </div>
      </div>
    );
  }

  if (!form) {
    return <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 flex items-center justify-center font-mono font-bold text-gray-500 dark:text-gray-400 bg-dotted-grid transition-colors duration-200">Loading...</div>;
  }

  if (form.published === false) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 space-y-6 bg-dotted-grid transition-colors duration-200">
        <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-md p-6 sm:p-12 text-center">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-955 text-amber-700 dark:text-amber-300 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-sm">⚠️</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Form Inactive</h1>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">This form is no longer accepting responses.</p>
        </div>
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 font-mono">
          This form is made by <span className="font-bold">Former</span> proudly in India
        </div>
      </div>
    );
  }

  const theme = THEME_COLORS[form.themeColor || 'indigo'] || THEME_COLORS['indigo'];

  if (form.requireGoogleSignIn && !verifiedEmail) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-955 py-12 px-4 flex flex-col justify-center items-center space-y-6 bg-dotted-grid transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm">🔒</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to continue</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">The creator of this form requires you to verify your identity with Google before submitting.</p>
          <div className="flex justify-center mt-6 border border-gray-200 dark:border-zinc-750 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 shadow-sm">
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
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 font-mono">
          This form is made by <span className="font-bold">Former</span> proudly in India
        </div>
      </div>
    );
  }

  // Group fields into pages separated by pageBreak fields
  const pages: { title: string; fields: any[] }[] = [];
  if (form && form.fields) {
    let currentPageTitle = "Basic Details";
    let currentPageFields: any[] = [];

    form.fields.forEach((f: any) => {
      if (f.type === 'pageBreak') {
        pages.push({ title: currentPageTitle, fields: currentPageFields });
        currentPageTitle = f.label || `Step ${pages.length + 1}`;
        currentPageFields = [];
      } else {
        currentPageFields.push(f);
      }
    });
    pages.push({ title: currentPageTitle, fields: currentPageFields });
  }

  const isMultiStep = pages.length > 1;
  const activePage = isMultiStep ? pages[Math.min(currentStep, pages.length - 1)] : { title: '', fields: form?.fields || [] };

  const validateCurrentStep = () => {
    const fieldsToValidate = activePage.fields;
    for (const field of fieldsToValidate) {
      if (field.required) {
        const answer = answers[field.id];
        if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          alert(`Please complete required field: "${field.label}"`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, pages.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepInfos: StepInfo[] = pages.map((p, idx) => ({ id: `step-${idx}`, title: p.title }));

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-gray-900 dark:text-gray-100 py-6 sm:py-12 px-4 flex flex-col justify-center items-center space-y-6 transition-colors duration-200 bg-dotted-grid pb-20">
      <div className={cn(
        "w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-10 space-y-8 transition-all",
        isMultiStep ? "max-w-5xl" : "max-w-3xl"
      )}>
        <div className="text-center mb-8 border-b border-dashed border-gray-200 dark:border-zinc-800 pb-6 space-y-3">
          <div className="flex items-center justify-center space-x-3">
            {form.logoUrl && (
              <img src={form.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-md" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            )}
            <h1 className="text-3xl font-bold text-gray-950 dark:text-white">{form.title}</h1>
          </div>
          {form.description && (
            <p className="text-sm text-gray-655 dark:text-gray-400 max-w-md mx-auto font-medium">{form.description}</p>
          )}
        </div>

        {isMultiStep && (
          <div className="sm:hidden border-b border-gray-200 dark:border-zinc-850 pb-4">
            <StepProgress steps={stepInfos} currentStep={currentStep} orientation="horizontal" themeColor={form.themeColor} onStepClick={(idx) => idx <= currentStep && setCurrentStep(idx)} />
          </div>
        )}

        <div className={cn("grid gap-8", isMultiStep ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1")}>
          {isMultiStep && (
            <div className="hidden md:block md:col-span-1 border-r border-dashed border-gray-200 dark:border-zinc-800 pr-6">
              <StepProgress steps={stepInfos} currentStep={currentStep} orientation="vertical" themeColor={form.themeColor} onStepClick={(idx) => idx <= currentStep && setCurrentStep(idx)} />
            </div>
          )}

          <div className={cn(isMultiStep ? "md:col-span-3" : "w-full")}>
            {isMultiStep && (
              <div className="mb-6 pb-3 border-b border-gray-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activePage.title}</h2>
                <p className="text-xs text-gray-500 font-mono">Step {currentStep + 1} of {pages.length}</p>
              </div>
            )}

            <form onSubmit={submitResponse} className="space-y-6">
              {activePage.fields.map((field: any) => (
                <div key={field.id} className="space-y-2 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all">
                  <Label className="text-base font-bold text-gray-900 dark:text-gray-200 block mb-1">
                    {field.label} {field.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
                  </Label>
                  
                  {['text', 'email', 'number'].includes(field.type) && (
                    <Input 
                      type={field.type} 
                      required={field.required}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} 
                      value={answers[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      minLength={field.validation?.minLength}
                      maxLength={field.validation?.maxLength}
                      pattern={field.type === 'text' ? field.validation?.pattern : undefined}
                      title={field.validation?.customError || (field.validation?.pattern ? `Please match the required format.` : undefined)}
                      className={`w-full h-11 bg-white dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg focus-visible:ring-0 focus:border-indigo-650 font-medium shadow-inner`} 
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea 
                      required={field.required}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} 
                      value={answers[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      minLength={field.validation?.minLength}
                      maxLength={field.validation?.maxLength}
                      className={`w-full flex min-h-[110px] rounded-lg border border-gray-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus:border-indigo-655 font-medium shadow-inner`} 
                    />
                  )}

                  {['dropdown', 'select'].includes(field.type) && (
                    <select 
                      required={field.required}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`w-full flex h-11 items-center justify-between rounded-lg border border-gray-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-655 font-medium shadow-inner`}
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt: string, i: number) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="space-y-2 pt-1">
                      {field.options?.map((opt: string, i: number) => {
                        const isChecked = (answers[field.id] || []).includes(opt);
                        return (
                          <label 
                            key={i} 
                            htmlFor={`${field.id}-${i}`}
                            className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 transition-all cursor-pointer bg-white dark:bg-zinc-955 shadow-sm hover:translate-y-[-1px]`}
                          >
                            <input 
                              type="checkbox" 
                              id={`${field.id}-${i}`} 
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                              className={`h-4.5 w-4.5 rounded border border-gray-200 dark:border-zinc-700 cursor-pointer text-indigo-650 focus:ring-0`} 
                            />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 select-none">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2 pt-1">
                      {field.options?.map((opt: string, i: number) => {
                        const isSelected = answers[field.id] === opt;
                        return (
                          <label 
                            key={i} 
                            htmlFor={`${field.id}-${i}`}
                            className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 transition-all cursor-pointer bg-white dark:bg-zinc-955 shadow-sm hover:translate-y-[-1px]`}
                          >
                            <input 
                              type="radio" 
                              name={field.id} 
                              id={`${field.id}-${i}`} 
                              required={field.required}
                              checked={isSelected}
                              onChange={() => handleInputChange(field.id, opt)}
                              className={`h-4.5 w-4.5 border border-gray-200 dark:border-zinc-700 cursor-pointer text-indigo-650 focus:ring-0`} 
                            />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 select-none">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'date' && (
                    <Input 
                      type="date" 
                      required={field.required}
                      value={answers[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`w-full h-11 bg-white dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg focus-visible:ring-0 focus:border-indigo-655 font-medium shadow-inner`} 
                    />
                  )}

                  {field.type === 'file' && (
                    <div className="space-y-2">
                      <Input 
                        type="file" 
                        required={field.required && !answers[field.id]}
                        onChange={(e) => handleFileChange(field.id, e)}
                        className={`w-full h-11 bg-white dark:bg-zinc-950 border border-gray-255 dark:border-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg focus-visible:ring-0 focus:border-indigo-655 font-medium shadow-inner`} 
                      />
                      {answers[field.id] && (
                        <div className="mt-2 text-sm border border-gray-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-lg font-mono">
                          <a href={answers[field.id]} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                            File uploaded successfully (Click to View)
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === 'rating' && (
                    <div className="flex items-center space-x-2 pt-1.5 p-2 bg-white dark:bg-zinc-955 rounded-lg border border-gray-200 dark:border-zinc-800 w-fit shadow-sm">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const ratingValue = answers[field.id] || 0;
                        const isFilled = ratingValue >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleInputChange(field.id, star)}
                            className="focus:outline-none transition-transform hover:scale-110 p-1"
                          >
                            <Star className={`w-7 h-7 ${isFilled ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-gray-300 dark:text-zinc-700 fill-transparent'} transition-colors`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 mt-8 flex items-center justify-between gap-4">
                {isMultiStep && currentStep > 0 ? (
                  <Button 
                    type="button" 
                    onClick={handlePrevStep}
                    variant="outline" 
                    className="flex items-center space-x-2 border border-gray-250 dark:border-zinc-700 text-gray-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:text-gray-200 font-bold shadow-sm hover:translate-y-[-1px] transition-all rounded-lg h-11"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Button>
                ) : <div />}

                {isMultiStep && currentStep < pages.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 text-white font-bold border border-transparent bg-indigo-650 hover:bg-indigo-700 shadow-sm hover:translate-y-[-1px] transition-all rounded-lg h-11"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isSubmitting || form.fields.length === 0} 
                    className={`text-white font-bold border border-transparent bg-indigo-655 hover:bg-indigo-750 shadow-sm hover:translate-y-[-1px] transition-all py-6 text-base rounded-xl cursor-pointer ${isMultiStep ? 'px-8' : 'w-full'}`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 font-mono tracking-wide">
        Powered by <span className="font-bold text-gray-500 dark:text-gray-400">Former</span> • Made with ❤️ in India
      </div>
    </div>
  );
}

