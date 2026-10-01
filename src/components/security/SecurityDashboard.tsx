import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles,
  Search,
  Filter,
  Trash2,
  PhoneCall,
  RotateCcw,
  ExternalLink,
  Navigation,
  Compass,
  Pencil,
  PlusCircle,
  X,
  Check,
  Siren,
  Flame,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getSosAlerts,
  markSosAlertResolved,
  createSosAlert,
  clearAllSosAlerts,
  triggerVibration,
  playEmergencySiren,
  saveSosAlerts,
} from '../../services/sosService';
import { SosAlert } from '../../types';

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  isCustom?: boolean;
}

const CONTACTS_STORAGE_KEY = 'qis_emergency_contacts';

const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'c-1',
    name: 'Dr. K. V. Rao',
    role: 'Principal',
    phone: '+91 98765 43210',
    email: 'principal@qis.edu.in',
  },
  {
    id: 'c-2',
    name: 'Dr. S. Sharma',
    role: 'Vice Principal',
    phone: '+91 98765 43211',
    email: 'vp@qis.edu.in',
  },
  {
    id: 'c-3',
    name: 'Col. R. Varma',
    role: 'Security Head',
    phone: '+91 98765 43212',
    email: 'security@qis.edu.in',
  },
  {
    id: 'c-4',
    name: 'QIS Fire & Rescue Division',
    role: 'Fire Response',
    phone: '101 / 08647-224411',
    email: 'fire@qis.edu.in',
  },
  {
    id: 'c-5',
    name: 'QIS Campus Health Center & Ambulance',
    role: 'Hospital & Medical',
    phone: '108 / 08647-224422',
    email: 'health@qis.edu.in',
  },
];

const ALERT_TYPES = [
  'Fire Hazard',
  'Smoke Detected',
  'Intrusion / Security Breach',
  'Medical Emergency',
  'Gas Leak',
  'Electrical Short Circuit',
];

const LOCATION_OPTIONS = [
  'Classroom 101 (Block A, Floor 1)',
  'Classroom 102 (Block A, Floor 1)',
  'Classroom 103 (Block A, Floor 1)',
  'Classroom 104 (Block A, Floor 1)',
  'Classroom 105 (Block A, Floor 1)',
  'Chemistry Lab C-101 (Block B, Floor 1)',
  'Physics & Robotics Lab (Block B, Floor 2)',
  'Central Library (Block A, Floor 2)',
  'Dining Pavilion & Canteen (Block C)',
  'Main Campus Gate & Security Checkpoint',
];

export const SecurityDashboard: React.FC = () => {
  const { currentUser } = useApp();

  // SOS Alerts state
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCallModal, setActiveCallModal] = useState<SosAlert | null>(null);

  // Manual SOS Alert Modal state
  const [isManualAlertModalOpen, setIsManualAlertModalOpen] = useState(false);
  const [manualAlertType, setManualAlertType] = useState('Fire Hazard');
  const [manualLocation, setManualLocation] = useState(LOCATION_OPTIONS[0]);
  const [manualSeverity, setManualSeverity] = useState<'Critical' | 'Warning' | 'Info'>('Critical');
  const [manualMessage, setManualMessage] = useState(
    'Immediate campus security dispatch requested. Evacuate surrounding corridors.'
  );

  // Emergency Contacts state with localStorage persistence
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load emergency contacts from localStorage', e);
    }
    return INITIAL_CONTACTS;
  });

  // Editing contact state
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactData, setEditContactData] = useState<{ name: string; role: string; phone: string }>({
    name: '',
    role: '',
    phone: '',
  });

  // Add new contact inline state
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactData, setNewContactData] = useState<{ name: string; role: string; phone: string }>({
    name: '',
    role: '',
    phone: '',
  });

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Sync SOS alerts from localStorage
  const refreshAlerts = () => {
    setAlerts(getSosAlerts());
  };

  useEffect(() => {
    refreshAlerts();

    const handleUpdate = () => {
      refreshAlerts();
    };

    window.addEventListener('sosAlertsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sosAlertsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Save contacts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save emergency contacts to localStorage', e);
    }
  }, [contacts]);

  // Mark SOS alert resolved
  const handleResolve = (alertId: string) => {
    triggerVibration(100);
    markSosAlertResolved(alertId);
    refreshAlerts();
    showToast('Alert marked as resolved', 'success');
  };

  // Trigger Demo SOS alert
  const handleCreateDemoAlert = () => {
    triggerVibration([150, 100, 150]);
    createSosAlert('Kavya Sharma (Student B.Tech CSE)', '+91 98765 43210');
    refreshAlerts();
    showToast('Demo SOS Alert Triggered', 'danger');
  };

  // Clear all alerts
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all SOS alert history?')) {
      clearAllSosAlerts();
      refreshAlerts();
      showToast('All alerts cleared', 'success');
    }
  };

  // Send Manual Alert
  const handleSendManualAlert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualMessage.trim()) {
      alert('Please provide an alert message.');
      return;
    }

    // Play Siren & Vibrate
    playEmergencySiren();
    triggerVibration([300, 150, 300, 150, 400]);

    // Create new SOS alert object
    const newAlert: SosAlert = {
      id: `manual-sos-${Date.now()}`,
      studentName: `Security Dispatch (${currentUser?.name || 'Authorized Staff'})`,
      studentPhone: currentUser?.phone || '+91 98765 43212',
      location: manualLocation,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: Date.now(),
      status: 'Active',
      gps: '15.5057° N, 80.0499° E',
    };

    const currentList = getSosAlerts();
    saveSosAlerts([newAlert, ...currentList]);
    refreshAlerts();

    setIsManualAlertModalOpen(false);
    showToast('🚨 Alert Sent to All Authorities', 'danger');
  };

  // Start Editing Contact
  const handleStartEditContact = (c: EmergencyContact) => {
    setEditingContactId(c.id);
    setEditContactData({ name: c.name, role: c.role, phone: c.phone });
  };

  // Save Edited Contact
  const handleSaveContact = (id: string) => {
    if (!editContactData.name.trim() || !editContactData.phone.trim()) {
      alert('Name and Phone Number are required.');
      return;
    }

    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: editContactData.name.trim(),
              role: editContactData.role.trim() || c.role,
              phone: editContactData.phone.trim(),
            }
          : c
      )
    );

    setEditingContactId(null);
    showToast('Contact Updated Successfully', 'success');
  };

  // Delete Contact
  const handleDeleteContact = (id: string, name: string) => {
    if (window.confirm(`Delete ${name} from emergency contacts?`)) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      showToast('Contact Removed Successfully', 'success');
    }
  };

  // Add New Contact
  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactData.name.trim() || !newContactData.phone.trim()) {
      alert('Name and Phone Number are required.');
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newContactData.name.trim(),
      role: newContactData.role.trim() || 'Emergency Contact',
      phone: newContactData.phone.trim(),
      isCustom: true,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewContactData({ name: '', role: '', phone: '' });
    setIsAddingContact(false);
    showToast('Emergency Contact Added Successfully', 'success');
  };

  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'Resolved').length;

  const filteredAlerts = alerts
    .filter((a) => {
      if (filter === 'active') return a.status === 'Active';
      if (filter === 'resolved') return a.status === 'Resolved';
      return true;
    })
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.studentName.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.time.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white font-bold text-sm shadow-2xl border slide-in-from-top ${
            toast.type === 'danger'
              ? 'bg-red-600 border-red-400 shadow-red-950/30'
              : 'bg-emerald-600 border-emerald-400 shadow-emerald-950/30'
          }`}
        >
          {toast.type === 'danger' ? (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-bounce" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Security Command &amp; SOS Center
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Real-time QIS Campus Emergency Dispatch, Location Tracking &amp; Student Safety Coordination
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons: SEND MANUAL ALERT & Presentation Demo */}
          <div className="flex flex-wrap items-center gap-3">
            {/* BIG RED SEND MANUAL ALERT BUTTON (Requirement 3: animate-pulseGlow + animate-float) */}
            <button
              type="button"
              id="send-manual-alert-btn"
              onClick={() => setIsManualAlertModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#DC2626] hover:bg-red-700 text-white font-black text-sm tracking-wide shadow-xl shadow-red-600/40 border-2 border-red-400 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 animate-pulseGlow animate-float"
            >
              <Siren className="w-5 h-5 animate-bounce" />
              <span>SEND MANUAL ALERT / Trigger SOS</span>
            </button>

            <button
              type="button"
              id="security-demo-alert-btn"
              onClick={handleCreateDemoAlert}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Demo Alert</span>
            </button>

            {alerts.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear all alerts"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">Active SOS Alerts</span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-400 mt-1">
              {activeCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved Today</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {resolvedCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Emergency Contacts</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">
              {contacts.length}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Campus Patrol Status</span>
            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              On Duty (Block A-D)
            </p>
          </div>
        </div>
      </div>

      {/* EMERGENCY CONTACTS SECTION WITH INLINE EDITABLE PHONE NUMBERS (Requirement 2) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Emergency Authority Contacts Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              High-priority hotline numbers. Click the pencil icon to edit phone numbers in real-time.
            </p>
          </div>

          <button
            type="button"
            id="add-new-emergency-contact-btn"
            onClick={() => setIsAddingContact(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Emergency Contact</span>
          </button>
        </div>

        {/* Add Contact Form Inline */}
        {isAddingContact && (
          <form
            onSubmit={handleAddContactSubmit}
            className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                New Authority Contact
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Authority Name (e.g. Dean of Academics)"
                value={newContactData.name}
                onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                required
                placeholder="Role (e.g. Dean / Campus Security)"
                value={newContactData.role}
                onChange={(e) => setNewContactData({ ...newContactData, role: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number (e.g. +91 98765 43210)"
                value={newContactData.phone}
                onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {contacts.map((contact) => {
            const isEditing = editingContactId === contact.id;

            return (
              <div
                key={contact.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col justify-between space-y-3 relative group"
              >
                {isEditing ? (
                  /* Inline Edit Form */
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Name</label>
                      <input
                        type="text"
                        value={editContactData.name}
                        onChange={(e) => setEditContactData({ ...editContactData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Role</label>
                      <input
                        type="text"
                        value={editContactData.role}
                        onChange={(e) => setEditContactData({ ...editContactData, role: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Phone Number</label>
                      <input
                        type="tel"
                        value={editContactData.phone}
                        onChange={(e) => setEditContactData({ ...editContactData, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveContact(contact.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingContactId(null)}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal View with Edit Icon */
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {contact.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
                            {contact.role}
                          </span>
                        </div>
                      </div>

                      {/* Edit Pencil Icon & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit Phone & Contact"
                          onClick={() => handleStartEditContact(contact)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition border border-slate-200 dark:border-slate-600 shadow-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {contact.isCustom && (
                          <button
                            type="button"
                            title="Delete Contact"
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition border border-slate-200 dark:border-slate-600 shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {contact.phone}
                      </span>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Dial</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar for Real-time SOS Alerts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>All SOS Alerts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {alerts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              filter === 'active'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>Active</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              filter === 'resolved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Resolved</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {resolvedCount}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, caller, or location..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* SOS Alerts Real-Time List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              No Emergency Alerts Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {filter === 'active'
                ? 'All campus sectors report nominal status. No active SOS triggers at this moment.'
                : 'No alerts match your filter criteria. You can trigger a manual or demo SOS alert for testing.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert) => {
              const isActive = alert.status === 'Active';
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-3xl border-2 transition-all overflow-hidden ${
                    isActive
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-xl shadow-red-600/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm opacity-90'
                  }`}
                >
                  {isActive && (
                    <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse" />
                  )}

                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6 items-stretch justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-red-600 text-white shadow-sm shadow-red-600/40 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                🚨 ACTIVE EMERGENCY
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                RESOLVED
                              </>
                            )}
                          </span>

                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            ID: {alert.id.slice(0, 16)}
                          </span>
                        </div>

                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {alert.time}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Origin / Caller
                          </span>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                {alert.studentName}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {alert.studentPhone || '+91 98765 43210'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Incident Location
                          </span>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {alert.location}
                              </p>
                              <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5 flex items-center gap-1">
                                <Compass className="w-3 h-3" />
                                GPS: {alert.gps || '15.5057° N, 80.0499° E'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {alert.resolvedAt && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marked resolved at {alert.resolvedAt} by Security Officer
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => handleResolve(alert.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark as Resolved</span>
                          </button>
                        ) : (
                          <span className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Incident Closed
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveCallModal(alert)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/25 active:scale-95"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Student</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Map Placeholder Image Showing Location */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white aspect-[16/10] sm:aspect-[16/9] shadow-inner flex flex-col justify-between p-3 select-none">
                        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 240 140" fill="none">
                          <rect x="10" y="10" width="220" height="120" rx="8" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M 10 70 L 230 70" stroke="#334155" strokeWidth="6" />
                          <path d="M 120 10 L 120 130" stroke="#334155" strokeWidth="6" />
                          
                          <rect x="25" y="25" width="45" height="35" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                          <text x="47" y="45" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK A</text>

                          <rect x="140" y="25" width="55" height="35" rx="4" fill="#3f1d24" stroke="#ef4444" strokeWidth="1.5" />
                          <text x="167" y="45" fill="#fca5a5" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK B</text>

                          <rect x="25" y="85" width="45" height="35" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                          <text x="47" y="105" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK C</text>

                          <rect x="140" y="85" width="55" height="35" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                          <text x="167" y="105" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK D</text>

                          <circle cx="167" cy="42" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                          <circle cx="167" cy="42" r="6" fill="#dc2626" />
                        </svg>

                        <div className="relative flex items-center justify-between text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-red-400" />
                            CAMPUS GPS RADAR
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white font-mono">
                            ZONE: B-2
                          </span>
                        </div>

                        <div className="relative bg-slate-950/80 backdrop-blur-md rounded-xl p-2 border border-slate-800 text-[11px]">
                          <p className="font-bold text-red-300 flex items-center gap-1 truncate">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                            Target: {alert.location.split('(')[0].trim()}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                            GPS: {alert.gps || '15.5057° N, 80.0499° E'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* SEND MANUAL ALERT MODAL (Requirement 3) */}
      {isManualAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden animate-in fade-in zoom-in duration-300 my-8 font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Siren className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    SEND MANUAL ALERT / Trigger SOS
                  </h3>
                  <p className="text-[11px] text-red-100">Broadcasts instant priority alert across QIS campus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualAlertModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendManualAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Hazard Type *
                </label>
                <select
                  value={manualAlertType}
                  onChange={(e) => setManualAlertType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {ALERT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Location (Classroom / Facility) *
                </label>
                <select
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Severity Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Critical', 'Warning', 'Info'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setManualSeverity(sev)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        manualSeverity === sev
                          ? sev === 'Critical'
                            ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30'
                            : sev === 'Warning'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
                            : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Broadcast Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder="Describe the hazard and instructions for response..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualAlertModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-manual-alert-btn"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-600/40 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Alert to All Authorities</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Student Confirmation Modal */}
      <AnimatePresence>
        {activeCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCallModal(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <PhoneCall className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Emergency Call Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">Contacting student via campus telecom</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeCallModal.studentName}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
                  {activeCallModal.studentPhone || '+91 98765 43210'}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Location: {activeCallModal.location}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${activeCallModal.studentPhone || '9876543210'}`}
                  onClick={() => setActiveCallModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial Now</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveCallModal(null)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityDashboard;
