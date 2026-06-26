'use client';

import React, { useState, useEffect } from 'react';
import { api, auth } from '@/utils/api';

export default function ProfileSettingsPage() {
    // Account properties tracking state parameters
    const [memberId, setMemberId] = useState<string>('LOT000000');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Status message error/success feedback hooks
    const [msgText, setMsgText] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [showMsg, setShowMsg] = useState<boolean>(false);

    const displayMessage = (text: string, success: boolean = false) => {
        setMsgText(text);
        setIsSuccess(success);
        setShowMsg(true);
    };

    // 👤 1. Initialize user info parameters from local session cache storage on view mount
    useEffect(() => {
        if (auth.user) {
            setMemberId(auth.user.public_id || '—');
            setUsername(auth.user.username || '');
            setPhone(auth.user.phone || '');

            // Pull latest email profile dataset directly from security records loop
            const loadProfileData = async () => {
                try {
                    const data = await api('/api/user/profile', { auth: true });
                    if (data && data.email) {
                        setEmail(data.email);
                    }
                } catch {
                    // Bypasses smoothly to blank fallbacks if server is down or sleeping
                }
            };

            loadProfileData();
        }
    }, []);

    // 📝 2. Handle Profile Metadata Update Form Submission
    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowMsg(false);
        setSubmitting(true);

        try {
            const body = {
                email: email.trim(),
                phone: phone.trim() || null
            };

            await api('/api/user/update-profile', {
                method: 'PUT',
                body,
                auth: true
            });

            // Commit changes dynamically back into active system session records
            if (auth.user) {
                auth.set(auth.token || '', {
                    ...auth.user,
                    phone: phone.trim()
                });
            }

            displayMessage('Profile information settings updated successfully!', true);
        } catch (err: any) {
            displayMessage(err.message || 'An error occurred while editing profile.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
            <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm max-w-2xl">

                {/* ── CARD HEADER ── */}
                <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
                    Profile Settings
                </h2>
                <p className="text-[#7b7a95] text-sm mb-6 leading-relaxed">
                    Manage your account profile details and verification channels below.
                </p>

                {/* ── ALERTS NOTIFICATION BANNER ── */}
                {showMsg && (
                    <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${isSuccess
                            ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]'
                            : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
                        }`}>
                        {msgText}
                    </div>
                )}

                
            </div>
        </div>
    );
}
