import React, { useState } from 'react';
import type { Reminder } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface RemindersPanelProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onAdd: (reminder: Omit<Reminder, 'id'>) => void;
}

const RemindersPanel: React.FC<RemindersPanelProps> = ({ reminders, onDelete, onAdd }) => {
  const { t, speechCode } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [task, setTask] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequencyDays, setFrequencyDays] = useState(1);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
      if (!task.trim()) return;
      onAdd({
          task,
          notes,
          startDate,
          frequencyDays: Number(frequencyDays) || 1,
      });
      // reset form and close modal
      setTask('');
      setNotes('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setFrequencyDays(1);
      setIsModalOpen(false);
  }

  const calculateNextDueDate = (startDate: string, frequencyDays: number): string => {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > today) {
        return start.toLocaleDateString(speechCode);
    }
    
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const cyclesPast = Math.floor(diffDays / frequencyDays);
    const nextDueDate = new Date(start);
    nextDueDate.setDate(start.getDate() + (cyclesPast + 1) * frequencyDays);
    
    return nextDueDate.toLocaleDateString(speechCode);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-black/10 dark:bg-white/10 p-2 rounded-md">
          <h2 className="text-2xl font-semibold text-brand-text-primary dark:text-gray-200">{t('reminders.title')}</h2>
          <p className="text-brand-text-secondary dark:text-gray-300">{t('reminders.subtitle')}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span>{t('reminders.add')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-300">
            <div className="p-8 bg-black/5 dark:bg-white/5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <p className="mt-4 font-semibold">{t('reminders.empty.title')}</p>
            <p className="text-sm">{t('reminders.empty.subtitle')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map(reminder => {
              const repeatText = reminder.frequencyDays === 1
                ? t('reminders.repeats.singular')
                : t('reminders.repeats.plural').replace('{days}', reminder.frequencyDays.toString());

              return (
                <div key={reminder.id} className="bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-md flex justify-between items-start border border-white/20">
                  <div>
                    <h3 className="font-bold text-lg text-brand-primary-dark dark:text-brand-primary">{reminder.task}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm whitespace-pre-wrap">{reminder.notes}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <span>{t('reminders.starts')}: {new Date(reminder.startDate).toLocaleDateString(speechCode)}</span>
                      <span className="mx-2">|</span>
                      <span>{repeatText}</span>
                      <span className="mx-2">|</span>
                      <span className="font-bold text-brand-text-primary dark:text-gray-200">{t('reminders.due')}: {calculateNextDueDate(reminder.startDate, reminder.frequencyDays)}</span>
                    </div>
                  </div>
                  <button onClick={() => onDelete(reminder.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-brand-surface/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-lg shadow-xl p-6 w-full max-w-lg border border-white/20">
                  <h3 className="text-lg font-medium mb-4 text-brand-text-primary dark:text-gray-200">{t('reminders.modal.title')}</h3>
                  <form onSubmit={handleAddReminder} className="space-y-4">
                      <div>
                          <label htmlFor="task" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reminders.modal.task')}</label>
                          <input type="text" id="task" value={task} onChange={e => setTask(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder={t('reminders.modal.task.placeholder')} />
                      </div>
                      <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reminders.modal.notes')}</label>
                          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder={t('reminders.modal.notes.placeholder')}></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reminders.modal.startDate')}</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reminders.modal.frequency')}</label>
                            <input type="number" id="frequency" value={frequencyDays} onChange={e => setFrequencyDays(Number(e.target.value))} required min="1" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('reminders.modal.cancel')}</button>
                          <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark shadow">{t('reminders.modal.add')}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RemindersPanel;