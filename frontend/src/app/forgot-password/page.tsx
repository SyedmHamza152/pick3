'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function ForgotPassword() {
  const router = useRouter();

  // Wizard state control variables
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  
  // Inputs state control variables
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Status message state handlers
  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  const handleValidateStep1 = async () => {
    setShowMsg(false);
    const targetEmail = email.trim();
    const targetUser = username.trim();

    if (!targetEmail || !targetUser) {
      displayMessage('Please fill in all fields');
      return;
    }

    try {
      const data = await api('/api/auth/forgot-password/validate', {
        method: 'POST',
        body: { email: targetEmail, username: targetUser },
        auth: false,
      });
      setEmail(targetEmail);
      setUsername(targetUser);
      setSecurityQuestion(data.security_question);
      setStep(2);
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  const handleVerifyAnswerStep2 = async () => {
    setShowMsg(false);
    const targetAnswer = inputAnswer.trim();

    if (!targetAnswer) {
      displayMessage('Please provide your security answer');
      return;
    }

    try {
      await api('/api/auth/forgot-password/validate', {
        method: 'POST',
        body: { email, username, security_answer: targetAnswer },
        auth: false,
      });
      setSecurityAnswer(targetAnswer); // Store the verified answer state
      setStep(3);
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  const handleResetStep3 = async () => {
    setShowMsg(false);

    if (!newPassword || !confirmPassword) {
      displayMessage('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      displayMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      displayMessage('Password must be at least 6 characters');
      return;
    }

    try {
      await api('/api/auth/forgot-password/reset', {
        method: 'POST',
        body: { email, username, security_answer: securityAnswer, new_password: newPassword },
        auth: false,
      });
      displayMessage('Password reset successfully! Redirecting to login...', true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-bg text-textCustom font-sans">
      <form 
        onSubmit={(e) => e.preventDefault()} 
        className="w-100 max-w-[400px] bg-surface border border-borderCustom rounded-2xl p-8"
      >
        <h2 className="font-space text-2xl font-bold text-textCustom m-0 mb-2">
          Reset Password
        </h2>
        <p className="text-mutedCustom m-0 mb-4 font-normal text-sm">
          Verify your identity to reset your password
        </p>

        {/* Message Alert Notification Element */}
        {showMsg && (
          <div 
            className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border ${
              isSuccess 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-[#6ee7b7]' 
                : 'bg-red-500/10 border-red-500/30 text-[#fca5a5]'
            }`}
          >
            {msgText}
          </div>
        )}

        {/* Wizard step1 Segment Block */}
        {step === 1 && (
          <div>
            <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
              Email
            </label>
            <input 
              className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)] placeholder:text-mutedCustom/40"
              type="email"
              required 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="h-2.5"></div>
            
            <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
              Username
            </label>
            <input 
              className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)] placeholder:text-mutedCustom/40"
              required 
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="h-2.5"></div>
            
            <button 
              className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold cursor-pointer border-none bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)] transition-all duration-180 hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]" 
              type="button" 
              onClick={handleValidateStep1}
            >
              Continue
            </button>
          </div>
        )}

        {/* Wizard step2 Segment Block */}
        {step === 2 && (
          <div>
            <p className="text-mutedCustom text-sm mb-3 font-normal">
              Security Question: <strong className="text-textCustom font-semibold">{securityQuestion}</strong>
            </p>
            <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
              Security Answer
            </label>
            <input 
              className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)] placeholder:text-mutedCustom/40"
              required 
              placeholder="Your answer"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
            />
            <div className="h-2.5"></div>
            
            <button 
              className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold cursor-pointer border-none bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)] transition-all duration-180 hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]" 
              type="button" 
              onClick={handleVerifyAnswerStep2}
            >
              Verify Answer
            </button>
          </div>
        )}

        {/* Wizard step3 Segment Block */}
        {step === 3 && (
          <div>
            <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
              New Password (min 6)
            </label>
            <input 
              className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
              type="password" 
              required 
              minLength={6} 
              maxLength={128}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="h-2.5"></div>
            
            <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
              Confirm New Password
            </label>
            <input 
              className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
              type="password" 
              required 
              minLength={6} 
              maxLength={128}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="h-3.5"></div>
            
            <button 
              className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold cursor-pointer border-none bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)] transition-all duration-180 hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]" 
              type="button" 
              onClick={handleResetStep3}
            >
              Reset Password
            </button>
          </div>
        )}

        {/* Form redirection routing navigation links */}
        <p className="text-mutedCustom font-normal text-sm mt-3">
          <Link href="/login" className="text-primaryCustom no-underline hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}
