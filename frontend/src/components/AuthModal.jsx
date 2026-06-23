import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

import useUiStore from '../store/uiStore';

const AuthModal = ({ onClose }) => {
  const [tab, setTab] = useState('login'); // login | register | otp
  const [method, setMethod] = useState('email'); // email | phone
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(''); // Store userId after registering
  const [timeLeft, setTimeLeft] = useState(30);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { addToast, showAlert } = useUiStore();

  useEffect(() => {
    let interval;
    if (tab === 'otp' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tab, timeLeft]);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1); // or navigate('/')
  };

  // If already logged in, redirect away automatically from /login route
  if (user && !onClose) {
    navigate('/');
    return null;
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const payload = method === 'email' ? { email: identifier } : { phone: identifier };
      const res = await api.post('/auth/request-otp', payload);
      showAlert({ title: 'OTP Sent (Testing)', message: `Your test OTP code is: ${res.data.otp}` });
      setUserId(res.data.userId);
      setTimeLeft(60);
      setTab('otp');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error requesting OTP', 'error');
    }
  };

  const handleResendOtp = async () => {
    try {
      const payload = method === 'email' ? { email: identifier } : { phone: identifier };
      const res = await api.post('/auth/request-otp', payload);
      showAlert({ title: 'New OTP Sent (Testing)', message: `Your new test OTP code is: ${res.data.otp}` });
      setTimeLeft(60);
    } catch (err) {
      addToast('Error resending OTP', 'error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-otp', {
        userId,
        otp
      });
      login(res.data);
      if (onClose) onClose();
      else navigate('/');
    } catch (err) {
      addToast('Invalid OTP code', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative">
         <button onClick={handleClose} className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors z-10">
           <X size={24} />
         </button>
        <div className="bg-primary-600 p-6 text-white text-center relative">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-primary-100 text-sm mt-1">Sign in to continue</p>
        </div>

        <div className="p-6">
          {tab === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-semibold text-slate-600">Enter OTP</label>
                 <button type="button" onClick={() => { setTab('login'); setOtp(''); }} className="text-xs text-primary-600 font-bold hover:underline">
                   Change {method === 'email' ? 'Email' : 'Phone'}
                 </button>
              </div>
              <div>
                <input 
                  type="text" 
                  autoFocus
                  required
                  className="w-full text-center text-2xl tracking-widest border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary-500"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="000000"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Verify OTP</button>

              <div className="text-center mt-4">
                 {timeLeft > 0 ? (
                   <p className="text-sm text-slate-500 font-semibold">Resend OTP in 0:{timeLeft.toString().padStart(2, '0')}</p>
                 ) : (
                   <button type="button" onClick={handleResendOtp} className="text-sm text-primary-600 font-bold hover:underline">
                     Resend OTP Code
                   </button>
                 )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button type="button" onClick={() => setMethod('email')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md ${method === 'email' ? 'bg-white shadow' : 'text-slate-500'}`}>Email</button>
                 <button type="button" onClick={() => setMethod('phone')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md ${method === 'phone' ? 'bg-white shadow' : 'text-slate-500'}`}>Phone</button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-600">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input 
                  type={method === 'email' ? 'email' : 'tel'} 
                  required
                  className="w-full border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary-500"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={method === 'email' ? 'you@example.com' : '+1234567890'}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Get OTP</button>

              <div className="text-center mt-6">
                 <button type="button" onClick={() => navigate('/admin')} className="text-xs font-semibold text-slate-400 hover:text-primary-600 transition-colors">
                   Go to Admin Portal
                 </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
