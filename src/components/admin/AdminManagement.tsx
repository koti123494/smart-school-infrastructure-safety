import React, { useState } from 'react';
import {
  Users2,
  Building,
  Cpu,
  Wrench,
  Tags,
  PlusCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';

export const AdminManagement: React.FC = () => {
  const {
    teams,
    buildings,
    sensors,
    classrooms,
    addUser,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'buildings' | 'teams' | 'categories'>('users');

  // User state
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('teacher');
  const [newUserDept, setNewUserDept] = useState('Academic Faculty');

  // Categories state
  const [categoriesList, setCategoriesList] = useState([
    'Broken Fan',
    'Broken Light',
    'Damaged Desk',
    'Damaged Chair',
    'Projector Problem',
    'Smart Board Problem',
    'Electrical Problem',
    'Ceiling Damage',
    'Wall Damage',
    'Door/Window Damage',
    'Water Leakage',
    'AC Problem',
    'Internet/Wi-Fi Problem',
    'Playground Equipment',
    'Sanitation & Plumbing',
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      phone: '+91 98480 00112',
    };
    setUsersList((prev) => [...prev, newUser]);
    addUser(newUser);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoriesList((prev) => [...prev, newCategoryName.trim()]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (catName: string) => {
    setCategoriesList((prev) => prev.filter((c) => c !== catName));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Admin Governance &amp; Campus Configuration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              System Administration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized staff accounts, campus blocks, maintenance teams, and defect classification taxonomy.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'users', label: 'Authorized Users', icon: Users2, count: usersList.length },
          { id: 'buildings', label: 'Buildings & Blocks', icon: Building, count: buildings.length },
          { id: 'teams', label: 'Maintenance Teams', icon: Wrench, count: teams.length },
          { id: 'categories', label: 'Problem Categories', icon: Tags, count: categoriesList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as typeof activeAdminTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Users Management (Requirement 20) */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered School Personnel</h3>
              <p className="text-xs text-slate-500">Teachers, Staff, Maintenance Workers &amp; Supervisors</p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {usersList.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{user.name}</h4>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold uppercase bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {user.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {user.phone || '+91 98480 12345'}
                    </p>
                    <p className="text-[11px] text-slate-500">{user.department}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                  <span>ID: {user.id.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Buildings & Blocks (Requirement 20) */}
      {activeAdminTab === 'buildings' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Infrastructure Blocks</h3>
              <p className="text-xs text-slate-500">Academic wings, laboratories, utilities and outdoor zones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{b.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{b.floors} Floors</span>
                  <span>{b.totalRooms} Mapped Units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Maintenance Teams (Requirement 20) */}
      {activeAdminTab === 'teams' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Maintenance Teams &amp; Personnel</h3>
              <p className="text-xs text-slate-500">
                Specialized domain squads responsible for SLA work order execution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{team.name}</h4>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {team.specialty}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p>
                    Lead: <strong className="text-slate-800">{team.leadName}</strong>
                  </p>
                  <p>
                    Contact: <strong className="text-slate-800">{team.contactNumber}</strong>
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Crew Members ({team.members.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {team.members.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-amber-600 font-semibold">{team.activeTasks} Active Tasks</span>
                  <span className="text-emerald-700 font-semibold">{team.completedTasks} Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Problem Categories (Requirement 20) */}
      {activeAdminTab === 'categories' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Problem Taxonomy &amp; Categories</h3>
              <p className="text-xs text-slate-500">Configure allowable defect classification tags</p>
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <input
              type="text"
              required
              placeholder="Enter new problem category..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
            >
              Add Category
            </button>
          </form>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categoriesList.map((cat) => (
              <div
                key={cat}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-sm"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-400 hover:text-rose-600"
                  title="Remove category"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-fadeIn text-xs">
            <h3 className="text-base font-bold text-slate-900">Register New School Staff Account</h3>
            <p className="text-slate-500">Assign role credentials and department allocation</p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Verma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.verma@qisschool.edu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="teacher">Teacher / Staff</option>
                    <option value="maintenance">Maintenance Worker</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
