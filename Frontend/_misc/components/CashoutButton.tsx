
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, SystemSettings } from '../types';

interface CashoutButtonProps {
  balance: number;
  userId: string;
  systemSettings: SystemSettings;
  onSuccess: (amount: number, method: 'bkash' | 'nagad' | 'recharge' | 'giftcard', account: string, operator?: string) => void;
}

const OPERATORS = ['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk'];

const CashoutButton: React.FC<CashoutButtonProps> = ({ balance, userId, systemSettings, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'recharge' | 'giftcard'>('bkash');
  const [amount, setAmount] = useState(100);
  const [account, setAccount] = useState('');
  const [operator, setOperator] = useState(OPERATORS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (systemSettings.is_bkash_enabled) setMethod('bkash');
      else if (systemSettings.is_nagad_enabled) setMethod('nagad');
      else if (systemSettings.is_recharge_enabled) setMethod('recharge');
      else if (systemSettings.is_giftcard_enabled) setMethod('giftcard');
    }
  }, [isOpen, systemSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < systemSettings.min_withdrawal) {
      alert(`ন্যূনতম ${systemSettings.min_withdrawal} টাকা ক্যাশআউট করা যাবে।`);
      return;
    }
    if (amount > balance) {
      alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    if (method !== 'giftcard') {
      if (account.length !== 11 || !account.startsWith('01')) {
        alert('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন।');
        return;
      }
    } else {
      if (account.length < 5) {
        alert('দয়া করে সঠিক গিফট কার্ড ডিটেইলস দিন।');
        return;
      }
    }

    setLoading(true);

    try {
      const isAuto = systemSettings.is_auto_payout_enabled;
      await new Promise((resolve) => setTimeout(resolve, isAuto ? 3000 : 1500));
      
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess(amount, method, account, method === 'recharge' ? operator : undefined);
        setSuccess(false);
        setIsOpen(false);
        setAccount('');
      }, 3000);

    } catch (err) {
      alert('সিস্টেমে সমস্যা হয়েছে! দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const isAnyMethodEnabled = systemSettings.is_bkash_enabled || systemSettings.is_nagad_enabled || systemSettings.is_recharge_enabled || systemSettings.is_giftcard_enabled;
  const isAuto = systemSettings.is_auto_payout_enabled;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-10 bg-[#0f172a] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-500/10 hover:bg-black border border-white/5 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-4 group"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">💸</div>
        <div className="flex flex-col items-start text-left">
           <span className="text-white tracking-tighter">ক্যাশআউট রিকোয়েস্ট</span>
           <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">{isAuto ? 'Instant Payout System' : 'Manual Approval Protocol'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] border border-slate-100">
            {!success ? (
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">উইথড্র মেথড</h3>
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1">Select your preferred payout channel</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all font-bold">✕</button>
                </div>

                {!isAnyMethodEnabled ? (
                  <div className="py-20 text-center space-y-4">
                    <span className="text-6xl grayscale">🛠️</span>
                    <p className="text-slate-800 font-black text-lg">পেআউট সাময়িকভাবে বন্ধ!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {systemSettings.is_bkash_enabled && (
                        <MethodTab active={method === 'bkash'} onClick={() => setMethod('bkash')} icon="🅱️" label="bKash" color="pink" />
                      )}
                      {systemSettings.is_nagad_enabled && (
                        <MethodTab active={method === 'nagad'} onClick={() => setMethod('nagad')} icon="🅽" label="Nagad" color="orange" />
                      )}
                      {systemSettings.is_recharge_enabled && (
                        <MethodTab active={method === 'recharge'} onClick={() => setMethod('recharge')} icon="📱" label="Recharge" color="cyan" />
                      )}
                      {systemSettings.is_giftcard_enabled && (
                        <MethodTab active={method === 'giftcard'} onClick={() => setMethod('giftcard')} icon="🎁" label="GiftCard" color="purple" />
                      )}
                    </div>

                    {method === 'recharge' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">অপারেটর সিলেক্ট করুন</label>
                        <select 
                          value={operator}
                          onChange={(e) => setOperator(e.target.value)}
                          className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-500 focus:bg-white outline-none transition-all font-black text-slate-900"
                        >
                          {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {method === 'giftcard' ? 'গিফট কার্ড টাইপ ও ইমেইল (e.g. Amazon / user@mail.com)' : 'অ্যাকাউন্ট নাম্বার (Mobile)'}
                      </label>
                      <input 
                        type="text"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        required
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-black text-xl text-slate-900"
                        placeholder={method === 'giftcard' ? 'Brand / Details' : '01XXXXXXXXX'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">টাকার পরিমাণ (মিনিমাম ৳{systemSettings.min_withdrawal})</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">৳</span>
                        <input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          min={systemSettings.min_withdrawal}
                          className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-black text-3xl text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl transition-all ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                    >
                      {loading ? 'প্রসেসিং হচ্ছে...' : isAuto ? 'অটো ক্যাশআউট করুন' : 'রিকোয়েস্ট পাঠান'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="p-12 text-center animate-in zoom-in duration-500">
                <div className={`w-28 h-28 ${isAuto ? 'bg-emerald-500' : 'bg-amber-500'} text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-6xl shadow-2xl rotate-12`}>{isAuto ? '✓' : '📩'}</div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{isAuto ? 'পেমেন্ট সাকসেস!' : 'রিকোয়েস্ট গৃহীত!'}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-10 px-4">
                  {isAuto 
                    ? `আপনার ${method.toUpperCase()} অ্যাকাউন্টে ৳${amount} সফলভাবে পাঠিয়ে দেওয়া হয়েছে।`
                    : `আপনার ৳${amount} উইথড্র রিকোয়েস্টটি পেন্ডিং আছে। এডমিন যাচাই করে পেমেন্ট সম্পন্ন করবে।`}
                </p>
                <button onClick={() => setIsOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const MethodTab = ({ active, onClick, icon, label, color }: any) => {
  const colors: any = {
    pink: active ? 'border-pink-500 bg-pink-50' : 'border-slate-50 bg-slate-50',
    orange: active ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-slate-50',
    cyan: active ? 'border-cyan-500 bg-cyan-50' : 'border-slate-50 bg-slate-50',
    purple: active ? 'border-purple-500 bg-purple-50' : 'border-slate-50 bg-slate-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${colors[color]} ${active ? 'shadow-lg scale-105' : 'text-slate-400 grayscale'}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
};

export default CashoutButton;
