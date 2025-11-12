import React from 'react';
import { Trade } from '../../types';
import { ArrowLeftIcon, PlusIcon, ChevronRightIcon, DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/solid';

interface DayJournalPageProps {
  date: Date;
  tradesForDay: Trade[];
  onBack: () => void;
  onAddTrade: () => void;
  onTradeSelect: (tradeId: string) => void;
}

export const DayJournalPage: React.FC<DayJournalPageProps> = ({ date, tradesForDay, onBack, onAddTrade, onTradeSelect }) => {
  const dailyTotalPnl = tradesForDay.reduce((acc, trade) => acc + trade.pnl, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <button onClick={onBack} className="flex items-center text-sm text-brand-gray hover:text-white transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold font-poppins text-white mt-2">
            Trades for {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h1>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-sm text-brand-gray">Daily P/L</span>
          <p className={`text-2xl font-bold ${dailyTotalPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
            {dailyTotalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
      </header>

      <div className="bg-brand-dark-blue p-4 sm:p-6 rounded-xl shadow-2xl">
        <div className="flex justify-end mb-4">
          <button onClick={onAddTrade} className="flex items-center px-4 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-brand-accent/20 transform hover:-translate-y-0.5">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Trade
          </button>
        </div>

        <div className="space-y-3">
          {tradesForDay.length > 0 ? (
            tradesForDay
              .sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00")) // Sort by time
              .map(trade => (
                <button
                  key={trade.id}
                  onClick={() => onTradeSelect(trade.id)}
                  className="w-full bg-brand-light-blue p-4 rounded-lg flex justify-between items-center gap-4 hover:bg-brand-light-blue/50 ring-brand-accent/0 hover:ring-brand-accent/50 ring-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  aria-label={`View details for ${trade.symbol} trade at ${trade.time}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`flex-shrink-0 w-2 h-10 rounded-full ${trade.pnl >= 0 ? 'bg-brand-profit' : 'bg-brand-loss'}`}></div>
                    <div>
                      <p className="font-bold text-lg text-white">{trade.symbol}</p>
                      <div className="flex items-center gap-3 text-xs text-brand-gray">
                        {trade.time && <span>{trade.time}</span>}
                        {trade.direction && (
                          <span className={`font-semibold ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>{trade.direction.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-brand-gray">
                        {trade.notes && <DocumentTextIcon className="h-5 w-5" title="Has notes"/>}
                        {trade.screenshot && <PhotoIcon className="h-5 w-5" title="Has screenshot"/>}
                    </div>
                    <p className={`font-bold text-lg sm:text-xl flex-shrink-0 w-28 text-right ${trade.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                      {trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <ChevronRightIcon className="h-6 w-6 text-brand-gray" />
                  </div>
                </button>
              ))
          ) : (
            <p className="text-center text-brand-gray py-8">No trades were logged for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};
