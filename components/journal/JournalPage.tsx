import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trade } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PhotoIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { ManageEntryModelsModal } from './ManageEntryModelsModal';

interface JournalPageProps {
  onSaveCallback: () => void;
  selectedDate?: Date | null;
  tradeToEdit?: Trade;
}

const formatDateForInput = (date: Date) => {
    // Use local date parts to avoid timezone shifts caused by toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

const timeframeOptions = [
  '1m', '3m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'
];

export const JournalPage: React.FC<JournalPageProps> = ({ onSaveCallback, selectedDate, tradeToEdit }) => {
  const { addTrade, updateTrade, trades, entryModels } = useAuth();
  const isEditing = !!tradeToEdit;

  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [time, setTime] = useState(formatTimeForInput(new Date()));
  const [symbol, setSymbol] = useState('');
  const [pnl, setPnl] = useState('');
  const [tradeType, setTradeType] = useState<'profit' | 'loss'>('profit');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [positionSize, setPositionSize] = useState('');
  const [positionUnit, setPositionUnit] = useState<'lots' | 'contracts'>('contracts');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
  
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [entryModelData, setEntryModelData] = useState<Record<string, { value: string; timeframe: string; }>>({});
  
  // States for searchable model dropdown
  const [modelSearch, setModelSearch] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentSymbols = useMemo(() => {
    const defaultSymbols = ["NQ", "ES"];
    const customSymbols = trades.map(t => t.symbol.toUpperCase());
    const allSymbols = [...new Set([...defaultSymbols, ...customSymbols])];
    return allSymbols.sort();
  }, [trades]);
  
  const selectedModel = useMemo(() => {
    if (!selectedModelId) return null;
    return entryModels.find(m => m.id === selectedModelId);
  }, [selectedModelId, entryModels]);
  
  const filteredModels = useMemo(() => {
    return entryModels.filter(model =>
        model.name.toLowerCase().includes(modelSearch.toLowerCase())
    );
  }, [entryModels, modelSearch]);

  useEffect(() => {
    if (tradeToEdit) {
      // Edit mode: populate form from tradeToEdit
      setDate(formatDateForInput(tradeToEdit.date));
      setTime(tradeToEdit.time || '');
      setSymbol(tradeToEdit.symbol);
      const pnlValue = Math.abs(tradeToEdit.pnl);
      setPnl(pnlValue > 0 ? String(pnlValue) : '');
      setTradeType(tradeToEdit.pnl >= 0 ? 'profit' : 'loss');
      setDirection(tradeToEdit.direction || 'long');
      setPositionSize(tradeToEdit.positionSize ? String(tradeToEdit.positionSize) : '');
      setPositionUnit(tradeToEdit.positionUnit || 'contracts');
      setNotes(tradeToEdit.notes);
      setScreenshot(tradeToEdit.screenshot || null);
      setSelectedModelId(tradeToEdit.entryModelId || '');
      setEntryModelData(tradeToEdit.entryModelData || {});
    } else {
      // Create mode: set defaults
      const initialDate = selectedDate || new Date();
      setDate(formatDateForInput(initialDate));
      const isToday = new Date(initialDate).toDateString() === new Date().toDateString();
      setTime(isToday ? formatTimeForInput(new Date()) : '');

      // Reset fields for a clean form
      setSymbol('');
      setPnl('');
      setTradeType('profit');
      setDirection('long');
      setPositionSize('');
      setNotes('');
      setScreenshot(null);
      setSelectedModelId('');
      setEntryModelData({});
    }
  }, [tradeToEdit, selectedDate]);
  
  // Effect to handle clicks outside the model dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
            setIsModelDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setScreenshot(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setScreenshot(null);
        alert('Please select a valid image file.');
    }
  };
  
  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleModelDataChange = (field: string, part: 'value' | 'timeframe', newValue: string) => {
    setEntryModelData(prev => {
        // Create a new object for the updated field data.
        // Start with the existing data for that field, or a default empty structure.
        const updatedField = {
            ...(prev[field] || { value: '', timeframe: '' }),
            [part]: newValue
        };

        // Return the new state by spreading the previous state
        // and adding/overwriting the data for the specific field.
        return {
            ...prev,
            [field]: updatedField
        };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !pnl || !time) {
      alert('Please fill out the Symbol, Time, and Amount fields.');
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

    const size = positionSize ? parseFloat(positionSize) : undefined;

    const finalModelData: Record<string, { value: string; timeframe: string; }> = {};
    Object.entries(entryModelData).forEach(([key, data]) => {
        // Fix: Explicitly cast `data` to its expected type, as Object.entries can infer the value as `unknown`.
        const modelData = data as { value: string; timeframe: string; };
        if (modelData && modelData.value && modelData.value.trim() !== '') {
            finalModelData[key] = {
                value: modelData.value.trim(),
                timeframe: modelData.timeframe?.trim() || ''
            };
        }
    });

    const tradePayload: Omit<Trade, 'id' | 'userId'> = {
      date: tradeDate,
      time,
      symbol: symbol.toUpperCase(),
      pnl: finalPnl,
      notes,
      direction,
      positionSize: size,
      positionUnit: size ? positionUnit : undefined,
      screenshot: screenshot || undefined,
      entryModelId: selectedModelId || undefined,
      entryModelData: Object.keys(finalModelData).length > 0 ? finalModelData : undefined,
    };

    if (isEditing) {
      updateTrade({ ...tradeToEdit, ...tradePayload });
    } else {
      addTrade(tradePayload);
    }
    onSaveCallback();
  };
  
  const inputClass = "w-full bg-brand-light-blue border border-brand-light-blue/50 rounded-md p-3 text-white placeholder-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all";
  const labelClass = "block mb-2 text-sm font-medium text-brand-gray";

  return (
    <>
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-poppins text-white mb-8">{isEditing ? 'Edit Trade' : 'New Trade'}</h1>
      <form onSubmit={handleSubmit} className="bg-brand-dark-blue p-8 rounded-xl shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="date" className={labelClass}>Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
           <div className="md:col-span-1">
            <label htmlFor="time" className={labelClass}>Time</label>
            <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="symbol" className={labelClass}>Symbol / Asset</label>
            <input 
              type="text" 
              id="symbol" 
              list="symbol-options"
              value={symbol} 
              onChange={e => setSymbol(e.target.value)} 
              placeholder=" " 
              className={inputClass} 
            />
            <datalist id="symbol-options">
              {recentSymbols.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
                <label className={labelClass}>Direction</label>
                <div className="flex rounded-md" role="group">
                    <button
                        type="button"
                        onClick={() => setDirection('long')}
                        className={`px-4 py-3 text-sm font-medium flex-1 rounded-l-lg transition-colors duration-200 border-y-2 border-l-2 ${
                            direction === 'long' 
                            ? 'bg-green-600 text-white border-green-600' 
                            : 'bg-brand-light-blue text-brand-gray hover:bg-green-500/20 border-brand-light-blue/50'
                        }`}
                    >
                        Long
                    </button>
                    <button
                        type="button"
                        onClick={() => setDirection('short')}
                        className={`px-4 py-3 text-sm font-medium flex-1 rounded-r-lg transition-colors duration-200 border-y-2 border-r-2 ${
                            direction === 'short' 
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'bg-brand-light-blue text-brand-gray hover:bg-red-500/20 border-brand-light-blue/50'
                        }`}
                    >
                        Short
                    </button>
                </div>
            </div>
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
                    placeholder="0" 
                    className={inputClass} 
                    step="1"
                    min="0"
                />
            </div>
            <div>
                <label htmlFor="position-size" className={labelClass}>Position Size</label>
                <div className="flex">
                    <input
                        type="number"
                        id="position-size"
                        value={positionSize}
                        onChange={e => setPositionSize(e.target.value)}
                        placeholder="0"
                        className="w-full bg-brand-light-blue border-t border-l border-b border-brand-light-blue/50 rounded-l-md p-3 text-white placeholder-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all appearance-none m-0"
                        step={positionUnit === 'contracts' ? '1' : '0.01'}
                        style={{MozAppearance: 'textfield'}}
                    />
                    <select
                        value={positionUnit}
                        onChange={e => setPositionUnit(e.target.value as 'lots' | 'contracts')}
                        className="bg-brand-dark-blue border-t border-r border-b border-brand-light-blue/50 rounded-r-md px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                        aria-label="Position unit"
                    >
                        <option value="contracts">contracts</option>
                        <option value="lots">lots</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col">
                <div className="mb-4">
                    <label htmlFor="entry-model-search" className={labelClass}>Entry Model</label>
                    <div className="flex gap-2">
                        <div className="relative flex-grow" ref={modelDropdownRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="entry-model-search"
                                    className={`${inputClass} pr-10`}
                                    placeholder=" "
                                    value={isModelDropdownOpen ? modelSearch : (selectedModel?.name || '')}
                                    onFocus={() => {
                                        setIsModelDropdownOpen(true);
                                        setModelSearch('');
                                    }}
                                    onChange={(e) => {
                                        setModelSearch(e.target.value);
                                        // Deselect model when user starts typing
                                        if (selectedModelId) {
                                            setSelectedModelId('');
                                            setEntryModelData({});
                                        }
                                    }}
                                    autoComplete="off"
                                />
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray pointer-events-none" />
                            </div>
                            {isModelDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-brand-light-blue border border-brand-gray/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    <ul>
                                        {filteredModels.length > 0 ? (
                                            filteredModels.map(model => (
                                                <li
                                                    key={model.id}
                                                    className="px-4 py-2 text-white hover:bg-brand-accent cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedModelId(model.id);
                                                        setModelSearch('');
                                                        setIsModelDropdownOpen(false);
                                                        setEntryModelData({}); // Reset data when model changes
                                                    }}
                                                >
                                                    {model.name}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-2 text-brand-gray">No models found.</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModelsModalOpen(true)}
                            className="px-4 py-3 bg-brand-light-blue text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors shrink-0"
                        >
                            Manage
                        </button>
                    </div>
                </div>
                {selectedModel && (
                    <div className="bg-brand-dark-blue h-full p-4 rounded-lg space-y-4 border border-brand-light-blue/50 flex-grow">
                        <h3 className="font-semibold text-white -mt-1">{selectedModel.name}</h3>
                        {selectedModel.fields.map((field) => (
                        <div key={field}>
                            <label htmlFor={`model-field-value-${field}`} className="block mb-1 text-sm text-brand-gray">{field}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    id={`model-field-value-${field}`}
                                    placeholder="Confluence..."
                                    value={entryModelData[field]?.value || ''}
                                    onChange={(e) => handleModelDataChange(field, 'value', e.target.value)}
                                    className="w-full bg-brand-light-blue border border-transparent rounded-md p-2 text-white placeholder-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                                />
                                <div className="relative">
                                    <select
                                        id={`model-field-timeframe-${field}`}
                                        value={entryModelData[field]?.timeframe || ''}
                                        onChange={(e) => handleModelDataChange(field, 'timeframe', e.target.value)}
                                        className="w-24 bg-brand-light-blue border border-transparent rounded-md p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all appearance-none"
                                        aria-label={`Timeframe for ${field}`}
                                    >
                                        <option value="" disabled></option>
                                        {timeframeOptions.map(tf => (
                                            <option key={tf} value={tf}>{tf}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col h-full">
                <label className={labelClass}>Trade Screenshot</label>
                {screenshot ? (
                    <div className="relative h-full w-full rounded-lg overflow-hidden group border border-brand-light-blue/50">
                        <img src={screenshot} alt="Screenshot preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                type="button"
                                onClick={handleRemoveScreenshot}
                                className="bg-brand-loss text-white p-3 rounded-full hover:bg-red-700 transition-colors"
                                aria-label="Remove screenshot"
                            >
                                <TrashIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center text-center h-full rounded-lg border border-dashed border-brand-light-blue/50 px-6 py-10 flex-grow">
                        <PhotoIcon className="mx-auto h-12 w-12 text-brand-gray" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
                            <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-brand-dark-blue font-semibold text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-accent focus-within:ring-offset-2 focus-within:ring-offset-brand-dark-blue hover:text-blue-400"
                            >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}
            </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>Notes (Psychology, Reasoning)</label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Why did I take this trade? How did I feel?" className={inputClass}></textarea>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40 transform hover:-translate-y-0.5">
            {isEditing ? 'Update Trade' : 'Save Trade'}
          </button>
        </div>
      </form>
    </div>
    <ManageEntryModelsModal
        isOpen={isModelsModalOpen}
        onClose={() => setIsModelsModalOpen(false)}
    />
    </>
  );
};