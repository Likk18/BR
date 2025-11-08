
import React, { useState } from 'react';
import { Trade } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface DayJournalPageProps {
  date: Date;
  tradesForDay: Trade[];
  onBack: () => void;
  onAddTrade: () => void;
}

export const DayJournalPage: React.FC<DayJournalPageProps> = ({ date, tradesForDay, onBack, onAddTrade }) => {
  const { deleteTrade } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeIdToDelete, setTradeIdToDelete] = useState<string | null>(null);

  const dailyTotalPnl = tradesForDay.reduce((acc, trade) => acc + trade.pnl, 0);

  const openConfirmationModal = (tradeId: string) => {
    setTradeIdToDelete(tradeId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tradeIdToDelete) {
      deleteTrade(tradeIdToDelete);
    }
    setIsModalOpen(false);
    setTradeIdToDelete(null);
  };

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
            Log Another Trade
          </button>
        </div>

        <div className="space-y-4">
          {tradesForDay.length > 0 ? (
            tradesForDay.sort((a,b) => b.pnl - a.pnl).map(trade => (
              <div key={trade.id} className="bg-brand-light-blue p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="font-bold text-lg text-white">{trade.symbol}</p>
                  <p className="text-sm text-brand-gray mt-1">{trade.notes || 'No notes for this trade.'}</p>
                </div>
                <div className="flex items-center">
                    <p className={`font-bold text-xl ml-0 sm:ml-4 flex-shrink-0 ${trade.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                    {trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <button onClick={() => openConfirmationModal(trade.id)} className="ml-4 p-2 rounded-full text-brand-gray hover:bg-brand-loss/20 hover:text-brand-loss transition-colors" aria-label="Delete trade">
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-brand-gray py-8">No trades were logged for this day.</p>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="flex flex-col items-center text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-brand-loss mb-4" />
            <p className="mb-6">
            Are you sure you want to delete this trade? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 w-full">
            <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-brand-light-blue text-white font-semibold rounded-lg hover:bg-brand-gray/50 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleConfirmDelete}
                className="w-full px-4 py-2 bg-brand-loss text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
                Delete
            </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
