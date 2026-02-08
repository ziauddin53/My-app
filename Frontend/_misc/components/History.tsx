
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mb-12">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">📋 লেনদেনের ইতিহাস</h3>
      
      {transactions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-400 font-medium">কোনো লেনদেন পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 group hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  tx.type === TransactionType.CONVERSION ? 'bg-indigo-100 text-indigo-600' : 
                  tx.type === TransactionType.CASHOUT ? 'bg-pink-100 text-pink-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {tx.type === TransactionType.CONVERSION ? '🔄' : tx.type === TransactionType.CASHOUT ? (tx.payment_method === 'recharge' ? '📱' : tx.payment_method === 'giftcard' ? '🎁' : '💸') : '🎁'}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm capitalize">
                    {tx.type === TransactionType.CONVERSION ? 'পয়েন্ট কনভার্ট' : tx.type === TransactionType.CASHOUT ? `${tx.payment_method} ${tx.operator ? `(${tx.operator})` : ''}` : 'ডেইলি বোনাস'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold tracking-wider">
                    {tx.account_number ? `${tx.account_number} • ` : ''}{new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${tx.type === TransactionType.CASHOUT ? 'text-red-500' : 'text-emerald-600'}`}>
                  {tx.type === TransactionType.CASHOUT ? '-' : '+'}৳{tx.amount.toFixed(2)}
                </p>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  tx.status === 'completed' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                  tx.status === 'pending' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
                  'text-red-500 border-red-500/20 bg-red-500/5'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
