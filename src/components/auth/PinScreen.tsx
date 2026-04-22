'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, AlertCircle } from 'lucide-react';

export function PinScreen() {
  const { login } = useAuth();
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all filled
    if (value && index === 5) {
      const fullPin = newPin.join('');
      if (fullPin.length === 6) {
        const success = login(fullPin);
        if (!success) {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
          }, 500);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newPin = pastedData.split('');
      setPin(newPin);
      const success = login(pastedData);
      if (!success) {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-linear-to-br from-zinc-900 via-black to-zinc-900" />

      {/* Subtle glow effect */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-teal-500/5 rounded-full blur-3xl" />

      <div className={`relative z-10 flex flex-col items-center ${shake ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
            <Image
              src="/logo.jpeg"
              alt="TechTable Logo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
          Welkom TechTable venoot
        </h1>
        <p className="text-zinc-400 mb-8 text-center">
          Vul de 6-cijferige code in
        </p>

        {/* PIN inputs */}
        <div className="flex gap-2 sm:gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              aria-label={`PIN cijfer ${index + 1} van 6`}
              title={`PIN cijfer ${index + 1} van 6`}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                error
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : digit
                    ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                    : 'border-zinc-700 bg-zinc-900 text-white focus:border-teal-500'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Onjuiste code, probeer opnieuw</span>
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Lock className="w-4 h-4" />
          <span>Beveiligde toegang</span>
        </div>
      </div>

      {/* Add shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
