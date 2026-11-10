import { useState, useEffect } from 'react';
import { UsersApi } from '@/api/users';
import { RegionsApi } from '@/api/regions';
import { PERMISSION_GROUPS } from '@/config/permissions';
import { ApiError, type AdminUser, type RoleType, type RegionItem } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import {
  UserCog,
  Plus,
  KeyRound,
  Shield,
  Edit2,
  CheckCircle,
  XCircle,
  X,
  Lock,
} from 'lucide-react';

export function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit user modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<RoleType>('RegionalAdmin');
  const [regionId, setRegionId] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset password modal
  const [resettingUser, setResettingUser] = useState<AdminUser | null>(null);
  const [tempPassResult, setTempPassResult] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [uRes, regList] = await Promise.all([UsersApi.list(), RegionsApi.list()]);
      setUsers(uRes.data);
      setRegions(regList);
    } catch {
      toast.error('Failed to load administrator accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setUsername('');
    setRole('RegionalAdmin');
    setRegionId(regions[0]?.id || '');
    setPermissions(['dashboard', 'members', 'members.approve']);
    setModalOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setUsername(u.username);
    setRole(u.role);
    setRegionId(u.regionId || '');
    setPermissions(u.permissions);
    setModalOpen(true);
  };

  const handleTogglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!fullName.trim() || !email.trim() || !username.trim()) {
      toast.error('Name, email, and username are required');
      return;
    }
    if (role === 'RegionalAdmin' && !regionId) {
      toast.error('Regional cluster assignment is mandatory for RegionalAdmin accounts');
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        await UsersApi.update(editingUser.id, {
          fullName: fullName.trim(),
          email: email.trim(),
          username: username.trim(),
          role,
          regionId: role === 'RegionalAdmin' ? regionId : undefined,
          permissions,
        });
        toast.success(`Updated account for ${fullName}`);
      } else {
        await UsersApi.create({
          fullName: fullName.trim(),
          email: email.trim(),
          username: username.trim(),
          role,
          regionId: role === 'RegionalAdmin' ? regionId : undefined,
          permissions,
        });
        toast.success(`Admin account created for ${fullName}`);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save administrator account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: AdminUser) => {
    try {
      await UsersApi.setActive(u.id, !u.active);
      toast.success(`Account for ${u.fullName} is now ${!u.active ? 'Active' : 'Deactivated'}.`);
      fetchUsers();
    } catch {
      toast.error('Failed to change account status');
    }
  };

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    try {
      const res = await UsersApi.resetPassword(resettingUser.id);
      setTempPassResult(res.tempPassword || 'OhpeaTemp2026!');
      toast.success('Temporary password issued.');
    } catch {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Staff Administrators &amp; Access Roles
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SuperAdmin, RegionalAdmin, Finance &amp; Editor privilege matrix.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>New Admin User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving administrator directory..." />
        ) : users.length === 0 ? (
          <EmptyState title="No administrators registered" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Regional Scope</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Password Gate</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{u.fullName}</p>
                      <p className="text-2xs text-slate-400 font-mono">
                        {u.email} · @{u.username}
                      </p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-2xs font-bold bg-[#14573F]/10 text-[#0B3D2E] border border-[#14573F]/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {u.role === 'RegionalAdmin'
                        ? regions.find((r) => r.id === u.regionId)?.name || 'Scoped Region'
                        : 'Global (All Oromia)'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {u.mustChangePassword ? (
                        <span className="text-2xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                          Reset Required
                        </span>
                      ) : (
                        <span className="text-2xs text-emerald-700">Set</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setResettingUser(u);
                            setTempPassResult(null);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="Edit permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                            u.active
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? `Edit Account: ${editingUser.fullName}` : 'Create Staff Administrator'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Caalaa Raggaasaa"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@ohpea.org"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                  {fieldErrors.email && <p className="text-2xs text-red-600 mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="caalaa.r"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                  {fieldErrors.username && <p className="text-2xs text-red-600 mt-1">{fieldErrors.username}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="RegionalAdmin">RegionalAdmin (Scoped to one cluster)</option>
                    <option value="SuperAdmin">SuperAdmin (Full Association access)</option>
                    <option value="Finance">Finance (Contributions &amp; receipts)</option>
                    <option value="Editor">Editor (Announcements &amp; Content)</option>
                  </select>
                  {fieldErrors.role && <p className="text-2xs text-red-600 mt-1">{fieldErrors.role}</p>}
                </div>

                {role === 'RegionalAdmin' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Regional Cluster Scope <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
                      required
                    >
                      <option value="">-- Select Region --</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.regionId && <p className="text-2xs text-red-600 mt-1">{fieldErrors.regionId}</p>}
                  </div>
                )}
              </div>

              {/* Grouped Permissions Matrix from config/permissions.ts */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold uppercase tracking-wider text-2xs text-slate-500 mb-2">
                  Granular Permission Rights Matrix
                </label>
                {fieldErrors.permissions && <p className="text-2xs text-red-600 mb-2">{fieldErrors.permissions}</p>}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {PERMISSION_GROUPS.map((grp: (typeof PERMISSION_GROUPS)[number]) => (
                    <div key={grp.group} className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-2xs uppercase tracking-wider text-emerald-950">
                        {grp.group}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                        {grp.permissions.map((p: { readonly key: string; readonly label: string }) => {
                          const isChecked = permissions.includes(p.key) || permissions.includes('*');
                          return (
                            <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(p.key)}
                                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                              />
                              <span className="text-slate-700 font-medium">{p.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#0B3D2E] text-white font-semibold hover:bg-[#14573F] transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resettingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Reset Password for {resettingUser.fullName}?
            </h3>
            <p className="text-slate-500 mb-4">
              This will generate a temporary password and set the <code>mustChangePassword</code> flag
              forcing the administrator to create a new password on their next sign in.
            </p>

            {tempPassResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 mb-4">
                <p className="font-bold">Temporary Password Generated:</p>
                <code className="text-sm font-mono block bg-white p-2 rounded border border-emerald-300 text-emerald-900 font-bold select-all">
                  {tempPassResult}
                </code>
                <p className="text-2xs text-emerald-800">
                  Provide this password to the administrator securely.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
              >
                Close
              </button>
              {!tempPassResult && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="px-4 py-1.5 rounded-lg bg-[#0B3D2E] text-white font-semibold hover:bg-[#14573F]"
                >
                  Generate Temporary Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
