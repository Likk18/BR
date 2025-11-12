import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EntryModel } from '../../types';
import { Modal } from '../common/Modal';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';

export const ManageEntryModelsModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, entryModels, addEntryModel, updateEntryModel, deleteEntryModel } = useAuth();
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [modelName, setModelName] = useState('');
    const [modelFields, setModelFields] = useState<string[]>(['']);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal is closed to ensure it's fresh next time
            setSelectedModelId(null);
        }
    }, [isOpen]);

    // This is the main state synchronization effect.
    // It's responsible for keeping the form in sync with the selected model.
    useEffect(() => {
        if (selectedModelId) {
            const model = entryModels.find(m => m.id === selectedModelId);
            if (model) {
                // A valid model is selected, so populate the form
                setModelName(model.name);
                setModelFields(model.fields.length > 0 ? model.fields : ['']);
            } else {
                // This is the key fix: The selectedModelId is no longer in the entryModels list
                // (which means it was just deleted).
                // We reset the selection, which will trigger this useEffect again to clear the form.
                setSelectedModelId(null);
            }
        } else {
            // No model is selected, so ensure we are in the 'Create New Model' form state.
            setModelName('');
            setModelFields(['']);
        }
    }, [selectedModelId, entryModels]); // This effect correctly depends on all its data sources

    const handleFieldChange = (index: number, value: string) => {
        const newFields = [...modelFields];
        newFields[index] = value;
        setModelFields(newFields);
    };

    const handleAddField = () => {
        setModelFields([...modelFields, '']);
    };

    const handleRemoveField = (index: number) => {
        if (modelFields.length > 1) {
            const newFields = modelFields.filter((_, i) => i !== index);
            setModelFields(newFields);
        }
    };
    
    const handleSave = () => {
        if (!user || !modelName.trim()) {
            alert('Model name cannot be empty.');
            return;
        }
        
        const finalFields = modelFields.map(f => f.trim()).filter(f => f !== '');
        if (finalFields.length === 0) {
            alert('Model must have at least one field.');
            return;
        }

        const fieldSet = new Set(finalFields);
        if (fieldSet.size !== finalFields.length) {
            alert('Model field names must be unique.');
            return;
        }

        if (selectedModelId) {
            // Update existing model
            const modelToUpdate: EntryModel = {
                id: selectedModelId,
                userId: user.id,
                name: modelName,
                fields: finalFields,
            };
            updateEntryModel(modelToUpdate);
        } else {
            // Create new model
            addEntryModel({ name: modelName, fields: finalFields });
            // After adding, reset to a clean "new model" form
            setSelectedModelId(null);
        }
    };

    // The handler now ONLY dispatches the delete action.
    // The useEffect above will handle the UI update declaratively.
    const handleDelete = () => {
        if (selectedModelId && window.confirm('Are you sure you want to delete this model?')) {
            deleteEntryModel(selectedModelId);
        }
    }
    
    const inputClass = "w-full bg-brand-light-blue border border-brand-light-blue/50 rounded-md p-2 text-white placeholder-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all";
    const labelClass = "block mb-2 text-sm font-medium text-brand-gray";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Entry Models" maxWidth="max-w-3xl">
            <div className="flex flex-col md:flex-row gap-6" style={{ maxHeight: '70vh' }}>
                {/* Left Pane: Model List */}
                <div className="md:w-1/3 border-r border-brand-light-blue/50 pr-4 overflow-y-auto">
                    <h4 className="font-bold mb-2">My Models</h4>
                    <button 
                        onClick={() => setSelectedModelId(null)}
                        className={`w-full text-left p-2 rounded-md mb-2 transition-colors ${!selectedModelId ? 'bg-brand-accent text-white' : 'hover:bg-brand-light-blue'}`}
                    >
                       <PlusIcon className="h-5 w-5 inline mr-2" /> New Model
                    </button>
                    <div className="space-y-1">
                        {entryModels.map(model => (
                            <button 
                                key={model.id}
                                onClick={() => setSelectedModelId(model.id)}
                                className={`w-full text-left p-2 rounded-md transition-colors ${selectedModelId === model.id ? 'bg-brand-accent text-white' : 'hover:bg-brand-light-blue'}`}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Pane: Form */}
                <div className="md:w-2/3 flex flex-col">
                    <h4 className="font-bold mb-4">{selectedModelId ? 'Edit Model' : 'Create New Model'}</h4>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        <div>
                            <label htmlFor="model-name" className={labelClass}>Model Name</label>
                            <input 
                                type="text" 
                                id="model-name" 
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                className={inputClass}
                                placeholder="e.g., ORB Strategy"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Fields</label>
                            <div className="space-y-2">
                                {modelFields.map((field, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={field}
                                            onChange={(e) => handleFieldChange(index, e.target.value)}
                                            className={inputClass}
                                            placeholder={`Field ${index + 1}`}
                                        />
                                        <button 
                                            onClick={() => handleRemoveField(index)}
                                            disabled={modelFields.length <= 1}
                                            className="p-2 rounded-full text-brand-gray hover:bg-brand-loss/20 hover:text-brand-loss transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XMarkIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddField}
                                    className="text-sm font-semibold text-brand-accent hover:text-blue-400"
                                >
                                    + Add Field
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-brand-light-blue/50">
                        <div>
                        {selectedModelId && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1 text-sm text-brand-loss hover:underline"
                            >
                                <TrashIcon className="h-4 w-4" /> Delete Model
                            </button>
                        )}
                        </div>
                         <div className="flex gap-2">
                             <button
                                onClick={onClose}
                                className="px-4 py-2 bg-brand-light-blue text-white font-semibold rounded-lg hover:bg-brand-gray/50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};