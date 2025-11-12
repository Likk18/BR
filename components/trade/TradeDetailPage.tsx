import React, { useState } from 'react';
import { Trade } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftIcon, TrashIcon, CalendarDaysIcon, ClockIcon, TagIcon, CurrencyDollarIcon, ArrowsRightLeftIcon, ScaleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from '../common/Modal';

interface TradeDetailPageProps {
  trade: Trade;
  onBack: () => void;
  onEdit: () => void;
}

const DetailItem: React.FC<{icon: React.ElementType, label: string, value: string | React.ReactNode, colorClass?: string}> = ({ icon: Icon, label, value, colorClass = 'text-white' }) => (
    <div className="flex flex-col bg-brand-light-blue/50 p-3 rounded-lg">
        <div className="text-xs text-brand-gray flex items-center mb-1">
            <Icon className="h-3 w-3 mr-1.5" />
            {label}
        </div>
        <p className={`text-base font-semibold ${colorClass}`}>{value}</p>
    </div>
);

export const TradeDetailPage: React.FC<TradeDetailPageProps> = ({ trade, onBack, onEdit }) => {
  const { deleteTrade, entryModels } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const tradeEntryModel = entryModels.find(m => m.id === trade.entryModelId);

  const handleConfirmDelete = () => {
    deleteTrade(trade.id);
    onBack(); // Go back after deleting
  };

  const pnlColor = trade.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss';
  const directionColor = trade.direction === 'long' ? 'text-green-400' : 'text-red-400';
  const directionBg = trade.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20';


  return (
    <>
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex-shrink-0 p-2 rounded-full bg-brand-dark-blue hover:bg-brand-light-blue transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-brand-gray" />
          </button>
          <h1 className="text-3xl font-bold font-poppins text-white">
            Trade Details
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
            <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark-blue text-brand-gray font-semibold rounded-lg hover:bg-brand-accent/20 hover:text-brand-accent transition-colors duration-200"
            >
                <PencilSquareIcon className="h-4 w-4" />
                Edit Trade
            </button>
            <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark-blue text-brand-gray font-semibold rounded-lg hover:bg-brand-loss/20 hover:text-brand-loss transition-colors duration-200"
            >
                <TrashIcon className="h-4 w-4" />
                Delete Trade
            </button>
        </div>
      </header>
      
      {/* Top Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <DetailItem icon={TagIcon} label="Symbol" value={trade.symbol} />
        <DetailItem icon={CurrencyDollarIcon} label="P/L" value={trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} colorClass={pnlColor} />
        <DetailItem icon={CalendarDaysIcon} label="Date" value={new Date(trade.date).toLocaleDateString()} />
        {trade.time && <DetailItem icon={ClockIcon} label="Time" value={trade.time} />}
        {trade.direction && (
            <DetailItem icon={ArrowsRightLeftIcon} label="Direction" value={
                <span className={`px-2 py-0.5 text-sm font-bold rounded-full ${directionBg} ${directionColor}`}>
                    {trade.direction.toUpperCase()}
                </span>
            } />
        )}
        {trade.positionSize && trade.positionUnit && (
             <DetailItem icon={ScaleIcon} label="Position Size" value={`${trade.positionSize} ${trade.positionUnit}`} />
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Center/Left: Journal and Model */}
        <div className="lg:col-span-3 bg-brand-dark-blue p-6 rounded-xl">
            {tradeEntryModel && trade.entryModelData && (
                <>
                <h2 className="text-xl font-bold text-white mb-4">Entry Model: {tradeEntryModel.name}</h2>
                <div className="space-y-3">
                    {Object.entries(trade.entryModelData).map(([key, data]) => {
                        // Fix: Cast `data` to its expected shape, as `Object.entries` can result in an `unknown` type for the value.
                        const modelData = data as { value: string; timeframe: string; };
                        const displayValue = modelData.value;
                        const displayTimeframe = modelData.timeframe ? `[${modelData.timeframe}]` : '';

                        return (
                            <div key={key} className="grid grid-cols-3 gap-x-2 p-3 bg-brand-light-blue rounded-md text-sm">
                                <span className="text-brand-gray col-span-1">{key}:</span>
                                <span className="text-white/90 col-span-2 flex items-center">
                                    {displayTimeframe && <span className="font-semibold text-brand-accent mr-2">{displayTimeframe}</span>}
                                    <span>{displayValue || '-'}</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="my-6 border-t border-brand-light-blue/50"></div>
                </>
            )}
            
            <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
            <div className="text-brand-gray leading-relaxed whitespace-pre-wrap">
                <p>{trade.notes || 'No notes were added for this trade.'}</p>
            </div>
        </div>

        {/* Right: Screenshot */}
        <div className="lg:col-span-2">
            {trade.screenshot ? (
                <div className="bg-brand-dark-blue p-2 rounded-xl">
                    <button onClick={() => setIsImageModalOpen(true)} className="w-full rounded-lg overflow-hidden group focus:outline-none focus:ring-4 ring-brand-accent/70">
                        <img src={trade.screenshot} alt={`Screenshot for ${trade.symbol}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </button>
                </div>
            ) : (
                <div className="bg-brand-dark-blue p-6 rounded-xl h-full flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-brand-gray">No screenshot uploaded.</p>
                </div>
            )}
        </div>
      </div>
    </div>
    
    <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="flex flex-col items-center text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-brand-loss mb-4" />
            <p className="mb-6">
            Are you sure you want to delete this trade? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 w-full">
            <button
                onClick={() => setIsDeleteModalOpen(false)}
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
    <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} title="Trade Screenshot" maxWidth="max-w-3xl">
        {trade.screenshot && (
            <img src={trade.screenshot} alt="Full size trade screenshot" className="w-full rounded-lg" />
        )}
    </Modal>
    </>
  );
};
