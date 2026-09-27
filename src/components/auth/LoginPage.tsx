import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Cpu,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { loginAs, setActiveTab } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@qisschool.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@qisschool.edu');
    } else if (role === 'teacher') {
      setEmail('priya.sharma@qisschool.edu');
    } else if (role === 'maintenance') {
      setEmail('rajesh.kumar@qisschool.edu');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginAs(selectedRole);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Visual Illustration Column */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo and Branding Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-wider flex items-center gap-2">
                  SMART SCHOOL
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                    SaaS
                  </span>
                </h1>
                <p className="text-xs text-blue-300 font-medium">
                  Infrastructure &amp; Safety Monitoring System
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                Unified Campus Operations &amp; Real-Time Safety Governance
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Empowering administrators, faculty, and field maintenance teams with continuous IoT telemetry, rapid incident reporting, and predictive infrastructure health.
              </p>
            </div>
          </div>

          {/* Mini Interactive Preview Card */}
          <div className="my-8 relative z-10 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Campus Telemetry
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                NORMAL
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Classrooms</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">24</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">IoT Sensors</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">48</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Uptime</div>
                <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">99.8%</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>End-to-End Encrypted • ISO 27001 &amp; SIH Compliance Certified</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Authorized Personnel Sign In</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your role below for instant demo authentication
                </p>
              </div>
              <button
                onClick={() => setActiveTab('landing')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Back
              </button>
            </div>

            {/* Role Selection Tabs (Requirement 2) */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                    selectedRole === 'admin'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Administrator</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('teacher')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                    selectedRole === 'teacher'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Teacher / Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('maintenance')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                    selectedRole === 'maintenance'
                      ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Maintenance</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="name@school.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember Me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-medium">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-700/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Secure Access Footer (Requirement 2) */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-slate-600">
              Secure access for authorized school personnel
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              QIS Educational Institutions • Campus Surveillance &amp; Safety Division
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
