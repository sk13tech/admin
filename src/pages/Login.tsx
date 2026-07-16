import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Lock, Shield, Eye, EyeOff, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-ios-bg flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex-1 flex flex-col items-center px-8 pt-[60px]">
        {/* App Icon */}
        <div className="w-[72px] h-[72px] rounded-[18px] bg-gradient-to-br from-ios-blue to-ios-indigo flex items-center justify-center mb-[20px] shadow-lg shadow-ios-blue/25">
          <Shield size={36} className="text-white" strokeWidth={1.8} />
        </div>

        <h1 className="text-[28px] font-[700] text-center text-ios-label tracking-[0.01em]">Admin Panel</h1>
        <p className="text-[15px] text-ios-gray text-center mt-[4px] mb-[32px]">Sign in with your admin credentials</p>

        {/* Login Form */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]">
            <div className="flex items-center px-4 h-[50px] border-b border-ios-separator/25">
              <Mail size={18} className="text-ios-gray" strokeWidth={1.8} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Email"
                autoComplete="email"
                className="flex-1 ml-3 text-[17px] bg-transparent outline-none placeholder:text-ios-gray3 leading-[22px]"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="flex items-center px-4 h-[50px]">
              <Lock size={18} className="text-ios-gray" strokeWidth={1.8} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                autoComplete="current-password"
                className="flex-1 ml-3 text-[17px] bg-transparent outline-none placeholder:text-ios-gray3 leading-[22px]"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={() => setShowPass(!showPass)} className="p-1 active:opacity-50">
                {showPass ? (
                  <EyeOff size={18} className="text-ios-gray" strokeWidth={1.8} />
                ) : (
                  <Eye size={18} className="text-ios-gray" strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-ios-red mt-[8px] text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-[50px] bg-ios-blue text-white rounded-[12px] text-[17px] font-[600] mt-[20px] active:bg-ios-blue/80 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <span className="inline-flex items-center gap-[8px]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </div>

        <p className="text-[12px] text-ios-gray3 mt-[24px] text-center max-w-[280px] leading-[16px]">
          Only authorized admin accounts can sign in. Contact the super admin for access.
        </p>
      </div>

      <div className="flex justify-center pb-[env(safe-area-inset-bottom,8px)] pt-2">
        <div className="w-[134px] h-[5px] bg-ios-label/20 rounded-full" />
      </div>
    </div>
  );
};

export default Login;
