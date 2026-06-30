'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, auth } from '@/utils/api';

export default function SignUpForm() {
  const router = useRouter();

  // Controlled states matching form fields
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const answerRef = useRef<HTMLInputElement>(null);

  // Status message error handlers
  const [msgText, setMsgText] = useState<string>('');
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMsg(false);

    try {
      // Rebuild matching your native javascript body payload structure filter
      const body: any = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        security_question: securityQuestion,
        security_answer: securityAnswer.trim(),
        password: password,
      };

      const data = await api('/api/auth/signup', {
        method: 'POST',
        body,
        auth: false,
      });

      // Commit exact token properties configuration
      auth.set(data.access_token, {
        user_id: data.user_id,
        public_id: data.public_id,
        username: data.username,
        phone: data.phone,
        is_admin: data.is_admin,
        account_balance: data.account_balance,
      });

      // Route directly to user workspace
      router.push('/login');
    } catch (err: any) {
      setMsgText(err.message || 'An error occurred');
      setShowMsg(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-bg text-textCustom font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] bg-surface border border-borderCustom rounded-2xl p-8"
      >
        <h2 className="font-space text-2xl font-bold text-textCustom m-0 mb-4">
          Create your account
        </h2>

        {/* Message Alert Element Wrapper */}
        {showMsg && (
          <div className="p-4 rounded-xl text-[13.5px] font-medium mb-4 bg-red-500/10 border border-red-500/30 text-[#fca5a5]">
            {msgText}
          </div>
        )}

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Username (3–64 chars, letters/numbers/._-)
        </label>
        <input
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={64}
          pattern="^[A-Za-z0-9_.\-]+$"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="h-2.5"></div>

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Email
        </label>
        <input
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="h-2.5"></div>

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Phone number
          {/* <span className="text-mutedCustom/60 normal-case">(optional)</span> */}
        </label>
        <input
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="phone"
          type="tel"
          required
          placeholder="e.g. 03001234567"
          maxLength={20}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="text-mutedCustom mt-1.5 text-[0.85rem] font-normal leading-normal">
          You will receive a unique member ID (e.g. LOT42) after signup.
        </p>
        <div className="h-2.5"></div>

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Security Question
        </label>
        <select
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)] cursor-pointer appearance-none"
          name="security_question"
          required
          value={securityQuestion}
          onChange={({ target }) => {
            setSecurityQuestion(target.value);

            if (target.value) {
              setTimeout(() => answerRef.current?.focus(), 0);
            }
          }}
        >
          <option value="">Select a question</option>
          <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
          <option value="What was the name of your first pet?">What was the name of your first pet?</option>
          <option value="What city were you born in?">What city were you born in?</option>
          <option value="What is your favorite color?">What is your favorite color?</option>
          <option value="What is the name of your elementary school?">What is the name of your elementary school?</option>
        </select>
        <div className="h-2.5"></div>        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Security Answer
        </label>
        <input
          ref={answerRef}
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="security_answer"
          type="text"
          required
          placeholder="Your answer"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
        />
        <div className="h-2.5"></div>

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Password (min 6)
        </label>
        <input
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="password"
          type="password"
          required
          minLength={6}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="h-3.5"></div>

        <button
          className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold cursor-pointer border-none bg-linear-to-br from-[#a855f7] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)] transition-all duration-180 hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-px"
          type="submit"
        >
          Sign up
        </button>

        <p className="text-mutedCustom font-normal text-sm mt-3 m-0">
          Have an account?{' '}
          <Link href="/login" className="text-primaryCustom no-underline hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}