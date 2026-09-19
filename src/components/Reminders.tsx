'use client';

import React, { useState } from 'react';
import { useSenior } from '@/context/SeniorContext';
import {
  Bell,
  Pill,
  Calendar,
  CreditCard,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Clock,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ReminderCategory, ReminderPeriod } from '@/lib/types';
import confetti from 'canvas-confetti';

export const Reminders: React.FC = () => {
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    highContrast,
    language,
    readAloud,
  } = useSenior();

  const isHindi = language === 'hi';

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'completed'>('today');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Reminder Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('medicine');
  const [period, setPeriod] = useState<ReminderPeriod>('morning');
  const [time, setTime] = useState('08:30');
  const [notes, setNotes] = useState('');

  const handlePeriodSelect = (p: ReminderPeriod) => {
    setPeriod(p);
    switch (p) {
      case 'morning':
        setTime('08:30');
        break;
      case 'afternoon':
        setTime('13:30');
        break;
      case 'evening':
        setTime('18:00');
        break;
      case 'night':
        setTime('21:00');
        break;
      default:
        break;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder({
      title: title.trim(),
      category,
      period,
      time,
      notes: notes.trim() || undefined,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    });

    // Reset Form
    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleToggle = (id: string, currentCompleted: boolean, taskTitle: string) => {
    toggleReminder(id);

    // If completing the task, cheer the senior citizen up!
    if (!currentCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // Fallback if canvas-confetti is not rendered
      }

      const praise = isHindi
        ? `बहुत बढ़िया! आपने "${taskTitle}" पूरा कर लिया है।`
        : `Great job! You completed "${taskTitle}". Stay healthy and safe!`;
      readAloud(praise);
    }
  };

  // Filter logic
  const todayDateStr = new Date().toISOString().split('T')[0];
  const filteredReminders = reminders.filter((r) => {
    if (activeFilter === 'today') {
      return r.dueDate === todayDateStr || !r.dueDate;
    }
    if (activeFilter === 'completed') {
      return r.completed;
    }
    return true;
  });

  const getCategoryIcon = (cat: ReminderCategory) => {
    switch (cat) {
      case 'medicine':
        return <Pill className="w-6 h-6 text-red-500" />;
      case 'appointment':
        return <Calendar className="w-6 h-6 text-blue-500" />;
      case 'bill':
        return <CreditCard className="w-6 h-6 text-amber-500" />;
      case 'custom':
      default:
        return <FileText className="w-6 h-6 text-emerald-500" />;
    }
  };

  const getCategoryLabel = (cat: ReminderCategory) => {
    switch (cat) {
      case 'medicine':
        return isHindi ? 'दवा (Medicine)' : 'Medicine';
      case 'appointment':
        return isHindi ? 'अपॉइंटमेंट (Appointment)' : 'Appointment';
      case 'bill':
        return isHindi ? 'बिल भुगतान (Bill)' : 'Bill Payment';
      case 'custom':
      default:
        return isHindi ? 'अन्य कार्य (Other)' : 'Personal Task';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 font-extrabold text-2xl sm:text-3xl">
            <Bell className="w-8 h-8" />
            <h2>{isHindi ? 'मेरी दैनिक याददाश्त (Reminders)' : 'Daily Reminders'}</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-neutral-300 mt-1">
            {isHindi
              ? 'समय पर दवाइयाँ, डॉक्टर अपॉइंटमेंट और बिल भुगतान की चिंता छोड़ें।'
              : 'Keep track of daily medicines, doctor appointments, and utility bills without worry.'}
          </p>
        </div>

        {/* Add Reminder Button */}
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`min-h-[50px] px-6 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
            highContrast
              ? 'bg-amber-400 text-black hover:bg-amber-300 border-2 border-white'
              : 'bg-amber-700 hover:bg-amber-800 text-white'
          }`}
        >
          <Plus className="w-6 h-6" />
          <span>{isHindi ? 'नया रिमाइंडर जोड़ें' : 'Add Reminder'}</span>
        </button>
      </div>

      {/* Add Reminder Expandable Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-6 transition-all animate-in fade-in ${
            highContrast ? 'bg-neutral-950 border-amber-400 text-white' : 'bg-white border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
            <h3 className="font-extrabold text-xl">
              {isHindi ? 'नया रिमाइंडर विवरण' : 'New Reminder Details'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="font-bold text-sm text-slate-500 hover:underline p-1"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block font-extrabold text-base sm:text-lg mb-2">
              {isHindi ? 'रिमाइंडर का नाम (जैसे: बीपी की दवा, गैस बिल):' : 'Reminder Title (e.g. Blood Pressure Pill):'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isHindi ? 'दवा या काम का नाम...' : 'Enter reminder title...'}
              className={`w-full p-3.5 rounded-xl border-2 text-base sm:text-lg font-medium ${
                highContrast
                  ? 'bg-black border-amber-400 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block font-extrabold text-base sm:text-lg mb-2">
              {isHindi ? 'श्रेणी चुनें:' : 'Select Category:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['medicine', 'appointment', 'bill', 'custom'] as ReminderCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[48px] p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                    category === cat
                      ? highContrast
                        ? 'bg-amber-400 text-black border-white'
                        : 'bg-amber-700 text-white border-amber-700'
                      : highContrast
                      ? 'border-neutral-700 hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span className="text-sm font-bold capitalize">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Preset Buttons */}
          <div>
            <label className="block font-extrabold text-base sm:text-lg mb-2">
              {isHindi ? 'समय अवधि चुनें:' : 'Select Time Period:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handlePeriodSelect('morning')}
                className={`min-h-[48px] p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${
                  period === 'morning'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>{isHindi ? 'सुबह (08:30)' : 'Morning'}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodSelect('afternoon')}
                className={`min-h-[48px] p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${
                  period === 'afternoon'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Sun className="w-5 h-5 text-orange-500" />
                <span>{isHindi ? 'दोपहर (01:30)' : 'Afternoon'}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodSelect('evening')}
                className={`min-h-[48px] p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${
                  period === 'evening'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Sunset className="w-5 h-5 text-purple-500" />
                <span>{isHindi ? 'शाम (06:00)' : 'Evening'}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodSelect('night')}
                className={`min-h-[48px] p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${
                  period === 'night'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-500" />
                <span>{isHindi ? 'रात (09:00)' : 'Night'}</span>
              </button>
            </div>
          </div>

          {/* Time Picker & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-sm mb-1">
                {isHindi ? 'निश्चित समय:' : 'Specific Time:'}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full p-3 rounded-xl border-2 text-base font-semibold ${
                  highContrast
                    ? 'bg-black border-amber-400 text-white'
                    : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block font-bold text-sm mb-1">
                {isHindi ? 'विशेष निर्देश (वैकल्पिक):' : 'Helpful Note (Optional):'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isHindi ? 'जैसे: खाना खाने के बाद...' : 'e.g. Take after meal with warm water'}
                className={`w-full p-3 rounded-xl border-2 text-base font-semibold ${
                  highContrast
                    ? 'bg-black border-amber-400 text-white'
                    : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 rounded-xl border border-slate-300 font-bold"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-lg shadow-md"
            >
              {isHindi ? 'सहेजें' : 'Save Reminder'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveFilter('today')}
          className={`min-h-[44px] px-5 rounded-xl font-extrabold text-base transition-all ${
            activeFilter === 'today'
              ? highContrast
                ? 'bg-amber-400 text-black'
                : 'bg-amber-700 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          {isHindi ? 'आज के कार्य' : "Today's Reminders"} (
          {reminders.filter((r) => r.dueDate === todayDateStr || !r.dueDate).length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`min-h-[44px] px-5 rounded-xl font-extrabold text-base transition-all ${
            activeFilter === 'all'
              ? highContrast
                ? 'bg-amber-400 text-black'
                : 'bg-amber-700 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          {isHindi ? 'सभी' : 'All'} ({reminders.length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`min-h-[44px] px-5 rounded-xl font-extrabold text-base transition-all ${
            activeFilter === 'completed'
              ? highContrast
                ? 'bg-amber-400 text-black'
                : 'bg-amber-700 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          {isHindi ? 'पूर्ण किए गए' : 'Completed'} (
          {reminders.filter((r) => r.completed).length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3.5">
        {filteredReminders.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 space-y-2">
            <Sparkles className="w-10 h-10 mx-auto text-amber-500" />
            <p className="text-lg font-bold">
              {isHindi ? 'इस सूची में कोई रिमाइंडर नहीं है।' : 'No reminders found in this view.'}
            </p>
            <p className="text-sm">
              {isHindi ? 'ऊपर "नया रिमाइंडर जोड़ें" पर टैप करें।' : 'Tap "Add Reminder" above to set a new task.'}
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                reminder.completed
                  ? 'opacity-65 bg-slate-50 border-slate-200 dark:bg-neutral-900/40 dark:border-neutral-800'
                  : highContrast
                  ? 'bg-neutral-950 border-amber-400 text-white'
                  : 'bg-white border-amber-200 shadow-sm'
              }`}
            >
              {/* Checkbox and Details */}
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggle(reminder.id, reminder.completed, reminder.title)}
                  className="mt-1 p-1 rounded-lg focus:ring-4 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  aria-label={
                    reminder.completed
                      ? isHindi
                        ? 'अपूर्ण चिह्नित करें'
                        : 'Mark as incomplete'
                      : isHindi
                      ? 'पूर्ण चिह्नित करें'
                      : 'Mark as completed'
                  }
                >
                  {reminder.completed ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-8 h-8 text-slate-400 hover:text-emerald-500" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 dark:bg-neutral-800 dark:text-amber-300">
                      {getCategoryIcon(reminder.category)}
                      {getCategoryLabel(reminder.category)}
                    </span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-500 dark:text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      {reminder.time} ({reminder.period})
                    </span>
                  </div>

                  <h4
                    className={`text-lg sm:text-xl font-extrabold ${
                      reminder.completed ? 'line-through text-slate-400 dark:text-neutral-500' : ''
                    }`}
                  >
                    {reminder.title}
                  </h4>

                  {reminder.notes && (
                    <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">
                      💡 {reminder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Delete */}
              <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 focus:ring-4 focus:ring-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={isHindi ? 'रिमाइंडर हटाएं' : 'Delete reminder'}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
