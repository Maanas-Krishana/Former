"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/components/AuthProvider';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken })
      });

      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="/logo.png" alt="Former Logo" className="w-16 h-16 object-contain rounded-xl shadow-sm mb-2" />
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Sign in to Former</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div>
              <Label>Email address</Label>
              <div className="mt-1">
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="mt-1">
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-center my-4">
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''} 
                onSuccess={setTurnstileToken} 
              />
            </div>

            <div>
              <Button type="submit" disabled={!turnstileToken} className="w-full bg-indigo-600 hover:bg-indigo-700">Sign in</Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a href="/signup" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Don&apos;t have an account? Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
