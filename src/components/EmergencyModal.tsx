'use client';

import React, { useState } from 'react';
import { useSenior } from '@/context/SeniorContext';
import {
  PhoneCall,
  ShieldAlert,
  AlertOctagon,
  HeartPulse,
  UserCheck,
  Edit2,
  X,
  PhoneForwarded,
} from 'lucide-react';
import { CaregiverContact } from '@/lib/types';

interface EmergencyContact {
  id: string;
  name: string;
  hindiName: string;
  number: string;
  desc: string;
  hindiDesc: string;
  icon: React.ReactNode;
  bgClass: string;
}

export const EmergencyModal: React.FC = () => {
  const {
    emergencyModalOpen,
    setEmergencyModalOpen,
    highContrast,
    language,
    caregiver,
    updateCaregiver,
  } = useSenior();

  const isHindi = language === 'hi';

  // Confirmation state before dialing
  const [callTarget, setCallTarget] = useState<{ name: string; number: string } | null>(null);

  // Edit caregiver modal state
  const [isEditingCaregiver, setIsEditingCaregiver] = useState(false);
  const [editForm, setEditForm] = useState<CaregiverContact>(caregiver);

  if (!emergencyModalOpen) return null;

  const contacts: EmergencyContact[] = [
    {
      id: 'nat-112',
      name: 'National Emergency',
      hindiName: 'राष्ट्रीय आपातकालीन सेवा',
      number: '112',
      desc: 'All-in-one Police, Fire & Medical support',
      hindiDesc: 'पुलिस, अग्निशमन और चिकित्सा सहायता',
      icon: <AlertOctagon className="w-8 h-8 text-red-600" />,
      bgClass: 'border-red-300 hover:bg-red-50',
    },
    {
      id: 'elder-14567',
      name: 'Elder Helpline (National)',
      hindiName: 'राष्ट्रीय वरिष्ठ नागरिक हेल्पलाइन',
      number: '14567',
      desc: 'Dedicated free support for senior citizens',
      hindiDesc: 'वरिष्ठ नागरिकों के लिए निःशुल्क सहायता',
      icon: <ShieldAlert className="w-8 h-8 text-amber-600" />,
      bgClass: 'border-amber-300 hover:bg-amber-50',
    },
    {
      id: 'amb-102',
      name: 'Medical Ambulance',
      hindiName: 'एम्बुलेंस सेवा',
      number: '102',
      desc: 'Immediate patient transport and first aid',
      hindiDesc: 'आपातकालीन चिकित्सा वाहन',
      icon: <HeartPulse className="w-8 h-8 text-emerald-600" />,
      bgClass: 'border-emerald-300 hover:bg-emerald-50',
    },
    {
      id: 'cyber-1930',
      name: 'Cyber Crime & Fraud Helpline',
      hindiName: 'साइबर अपराध एवं वित्तीय धोखाधड़ी हेल्पलाइन',
      number: '1930',
      desc: 'Immediate reporting to freeze fraudulent bank transfers',
      hindiDesc: 'बैंक से गलत निकासी पर तुरंत खाता ब्लॉक कराने हेतु',
      icon: <ShieldAlert className="w-8 h-8 text-blue-600" />,
      bgClass: 'border-blue-300 hover:bg-blue-50',
    },
  ];

  const handleInitiateCall = (name: string, number: string) => {
    // Show confirmation modal to prevent accidental dials
    setCallTarget({ name, number });
  };

  const handleConfirmCall = () => {
    if (callTarget) {
      window.location.href = `tel:${callTarget.number.replace(/\s+/g, '')}`;
      setCallTarget(null);
    }
  };

  const handleSaveCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    updateCaregiver(editForm);
    setIsEditingCaregiver(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border my-8 ${
          highContrast
            ? 'bg-black border-4 border-red-500 text-white'
            : 'bg-white border-red-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setCallTarget(null);
            setEmergencyModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-800 focus:ring-4 focus:ring-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={isHindi ? 'बंद करें' : 'Close Emergency Dialog'}
        >
          <X className="w-7 h-7" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div>
            <h2 id="emergency-title" className="text-2xl sm:text-3xl font-extrabold text-red-600">
              {isHindi ? 'आपातकालीन सहायता (SOS)' : 'Emergency Help (SOS)'}
            </h2>
            <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-neutral-300">
              {isHindi ? 'सीधा संपर्क और त्वरित सहायता' : 'One-Tap Verified Helplines & Family Contact'}
            </p>
          </div>
        </div>

        {/* Accidental Dial Prevention Confirmation Modal */}
        {callTarget ? (
          <div
            role="alertdialog"
            aria-labelledby="confirm-dial-title"
            className="my-6 p-6 rounded-2xl bg-red-50 border-4 border-red-600 text-slate-900 shadow-xl"
          >
            <div className="flex items-center gap-3 text-red-700 font-extrabold text-xl mb-2">
              <PhoneForwarded className="w-7 h-7 animate-pulse" />
              <span id="confirm-dial-title">{isHindi ? 'कॉल करने की पुष्टि करें' : 'Confirm Call'}</span>
            </div>
            <p className="text-lg mb-6 leading-relaxed">
              {isHindi ? (
                <>
                  क्या आप <strong>{callTarget.name}</strong> ({callTarget.number}) पर अभी कॉल करना चाहते हैं?
                </>
              ) : (
                <>
                  Are you sure you want to dial <strong>{callTarget.name}</strong> at{' '}
                  <span className="font-mono font-bold text-red-700">{callTarget.number}</span>?
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmCall}
                className="flex-1 min-h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg focus:ring-4 focus:ring-emerald-400"
              >
                <PhoneCall className="w-6 h-6" />
                <span>{isHindi ? 'हाँ, अभी कॉल करें' : 'Yes, Call Now'}</span>
              </button>
              <button
                onClick={() => setCallTarget(null)}
                className="min-h-[52px] px-6 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-lg rounded-xl focus:ring-4 focus:ring-slate-400"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Trusted Caregiver Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 mb-6 transition-all ${
                highContrast
                  ? 'bg-neutral-950 border-amber-400'
                  : 'bg-amber-50/80 border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                  <h3 className="font-extrabold text-lg sm:text-xl">
                    {isHindi ? 'मेरा विश्वसनीय परिवारजन / केयरगिवर' : 'My Trusted Caregiver'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setEditForm(caregiver);
                    setIsEditingCaregiver(!isEditingCaregiver);
                  }}
                  className="flex items-center gap-1 text-sm font-bold text-amber-700 dark:text-amber-300 hover:underline p-1 min-h-[44px]"
                  aria-label="Edit caregiver contact"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isHindi ? 'बदलें' : 'Edit'}</span>
                </button>
              </div>

              {isEditingCaregiver ? (
                <form onSubmit={handleSaveCaregiver} className="space-y-3 mt-3 pt-3 border-t border-amber-200">
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      {isHindi ? 'नाम एवं संबंध' : 'Contact Name & Relation'}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:bg-neutral-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      {isHindi ? 'फोन नंबर' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:bg-neutral-900 font-medium"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700"
                    >
                      {isHindi ? 'सहेजें' : 'Save Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCaregiver(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-neutral-800 rounded-lg font-semibold"
                    >
                      {isHindi ? 'रद्द' : 'Cancel'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-xl">{caregiver.name}</div>
                    <div className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                      {caregiver.relation} • {caregiver.phoneNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleInitiateCall(caregiver.name, caregiver.phoneNumber)}
                    className="min-h-[48px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md focus:ring-4 focus:ring-emerald-300"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>{isHindi ? 'कॉल करें' : 'Call Caregiver'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Official Helplines Grid */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-neutral-200">
                {isHindi ? 'आधिकारिक आपातकालीन हेल्पलाइन' : 'Official Emergency Helplines'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleInitiateCall(isHindi ? c.hindiName : c.name, c.number)}
                    className={`p-4 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all focus:ring-4 focus:ring-blue-500 ${
                      highContrast
                        ? 'bg-neutral-950 border-white hover:bg-neutral-900 text-white'
                        : `bg-slate-50 ${c.bgClass}`
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-extrabold text-lg">{isHindi ? c.hindiName : c.name}</div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 font-medium">
                        {isHindi ? c.hindiDesc : c.desc}
                      </div>
                      <div className="font-mono font-extrabold text-2xl text-red-600 dark:text-red-400 mt-1">
                        {c.number}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 shadow-sm shrink-0">
                      {c.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Disclaimer footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800 text-center text-xs sm:text-sm font-medium text-slate-500 dark:text-neutral-400">
          {isHindi
            ? '⚠️ सूचना: सीनियर साथी एक वेब ऐप है और यह सीधे आपातकालीन सेवाओं से नहीं जोड़ सकता। गंभीर आपातकाल में तुरंत अपने फोन से 112 डायल करें।'
            : '⚠️ Notice: Senior Saathi is a web companion and does not directly connect dispatchers. In severe life-threatening emergencies, dial 112 directly from any phone.'}
        </div>
      </div>
    </div>
  );
};
