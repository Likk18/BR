import React, { useState, useEffect } from 'react';
import { Trade } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface JournalPageProps {
  addTradeCallback: () => void;
  selectedDate: Date | null;
}

const formatDateForInput = (date: Date) => {
    // Use local date parts to avoid timezone shifts caused by toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const JournalPage: React.FC<JournalPageProps> = ({ addTradeCallback, selectedDate }) => {
  const { addTrade } = useAuth();
  const [date, setDate] = useState(formatDateForInput(selectedDate || new Date()));
  const [symbol, setSymbol] = useState('');
  const [pnl, setPnl] = useState('');
  const [notes, setNotes] = useState('');
  const [tradeType, setTradeType] = useState<'profit' | 'loss'>('profit');

  useEffect(() => {
    if (selectedDate) {
      setDate(formatDateForInput(selectedDate));
    }
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !pnl) {
      alert('Please fill out the Symbol and Amount fields.');
      return;
    }

    const pnlAmount = Math.abs(parseFloat(pnl));
    if (isNaN(pnlAmount)) {
        alert('Please enter a valid numeric amount for P/L.');
        return;
    }
    
    const finalPnl = tradeType === 'profit' ? pnlAmount : -pnlAmount;

    const dateParts = date.split('-').map(part => parseInt(part, 10));
    const year = dateParts[0];
    const month = dateParts[1] - 1; // Month is 0-indexed in JavaScript Date
    const day = dateParts[2];
    const tradeDate = new Date(year, month, day);

    const newTrade: Omit<Trade, 'id' | 'userId'> = {
      date: tradeDate,
      symbol: symbol.toUpperCase(),
      pnl: finalPnl,
      notes,
    };

    addTrade(newTrade);
    addTradeCallback();
  };
  
  const inputClass = "w-full bg-brand-light-blue border border-brand-light-blue/50 rounded-md p-3 text-white placeholder-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all";
  const labelClass = "block mb-2 text-sm font-medium text-brand-gray";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-poppins text-white mb-8">Log a New Trade</h1>
      <form onSubmit={handleSubmit} className="bg-brand-dark-blue p-8 rounded-xl shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className={labelClass}>Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="symbol" className={labelClass}>Symbol / Asset</label>
            <input type="text" id="symbol" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g., AAPL, BTCUSD" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelClass}>Outcome</label>
                <div className="flex rounded-md" role="group">
                    <button
                        type="button"
                        onClick={() => setTradeType('profit')}
                        className={`px-4 py-3 text-sm font-medium flex-1 rounded-l-lg transition-colors duration-200 border-y-2 border-l-2 ${
                            tradeType === 'profit' 
                            ? 'bg-brand-profit text-white border-brand-profit' 
                            : 'bg-brand-light-blue text-brand-gray hover:bg-green-500/20 border-brand-light-blue/50'
                        }`}
                    >
                        Profit
                    </button>
                    <button
                        type="button"
                        onClick={() => setTradeType('loss')}
                        className={`px-4 py-3 text-sm font-medium flex-1 rounded-r-lg transition-colors duration-200 border-y-2 border-r-2 ${
                            tradeType === 'loss' 
                            ? 'bg-brand-loss text-white border-brand-loss' 
                            : 'bg-brand-light-blue text-brand-gray hover:bg-red-500/20 border-brand-light-blue/50'
                        }`}
                    >
                        Loss
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="pnl" className={labelClass}>Amount ($)</label>
                <input 
                    type="number" 
                    id="pnl" 
                    value={pnl} 
                    onChange={e => setPnl(e.target.value)} 
                    placeholder="e.g., 250.75" 
                    className={inputClass} 
                    step="0.01"
                    min="0"
                />
            </div>
        </div>
        
        <div>
          <label htmlFor="notes" className={labelClass}>Notes (Psychology, Reasoning)</label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={5} placeholder="Why did I take this trade? How did I feel?" className={inputClass}></textarea>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40 transform hover:-translate-y-0.5">
            Save Trade
          </button>
        </div>
      </form>
    </div>
  );
};