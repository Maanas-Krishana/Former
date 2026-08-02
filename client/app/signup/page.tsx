"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/components/AuthProvider';
import { Turnstile } from '@marsidev/react-turnstile';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turnstileToken })
      });

      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential, turnstileToken })
      });

      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Google authentication failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-[390px] flex flex-col items-center">
        <img src="/logo.png" alt="Former Logo" className="w-14 h-14 object-contain rounded-xl shadow-sm mb-2" />
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create an account</h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[390px]">
        <div className="bg-white dark:bg-zinc-900 py-6 px-6 sm:px-8 shadow-md rounded-2xl border border-gray-200/80 dark:border-zinc-800">
          <form className="space-y-4" onSubmit={handleSignup}>
            {error && <div className="text-red-500 dark:text-red-400 text-xs font-medium text-center bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900">{error}</div>}
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
              <Input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="h-10 text-sm bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Email address</Label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="h-10 text-sm bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Password</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-10 text-sm bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>

            <div className="flex justify-center my-3 overflow-hidden rounded-md">
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''} 
                onSuccess={setTurnstileToken} 
              />
            </div>

            <div>
              <Button 
                type="submit" 
                disabled={!turnstileToken} 
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all rounded-lg"
              >
                Sign up
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-col items-center space-y-4 border-t dark:border-zinc-800 pt-5">
            <div className="relative w-full flex items-center justify-center">
              <div className="border-t w-full absolute border-gray-200 dark:border-zinc-800"></div>
              <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-gray-500 dark:text-gray-400 relative z-10 font-medium">Or continue with</span>
            </div>

            {!turnstileToken ? (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">Please verify you are human to enable Google sign-up.</p>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'placeholder-id'}>
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      if (credentialResponse.credential) {
                        handleGoogleAuth(credentialResponse.credential);
                      }
                    }}
                    onError={() => {
                      setError("Google Authentication Failed");
                    }}
                    width="300"
                  />
                </GoogleOAuthProvider>
              </div>
            )}
          </div>

          <div className="mt-5 text-center border-t dark:border-zinc-800 pt-4">
            <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-xs font-semibold">
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
