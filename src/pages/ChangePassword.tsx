import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError } from '@/types/api';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const { changePassword, logout } = useAuthContext();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!currentPassword) {
      setFieldErrors((prev) => ({ ...prev, currentPassword: 'Enter your current password' }));
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setFieldErrors((prev) => ({
        ...prev,
        newPassword: 'New password must be at least 8 characters',
      }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      await logout();
      toast.success('Your password has been updated. Please sign in again.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) {
          setFieldErrors(err.fields);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Failed to change password. Please check current credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] text-[#F1E3B8] flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Change Security Password</h2>
            <p className="text-xs text-slate-500">Update administrative access key</p>
          </div>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (fieldErrors.currentPassword) {
                  setFieldErrors((prev) => ({ ...prev, currentPassword: '' }));
                }
              }}
              placeholder="Enter existing password"
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all ${
                fieldErrors.currentPassword ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {fieldErrors.currentPassword && (
              <p className="mt-1 text-2xs text-red-600 font-medium">
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (minimum 8 characters) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword) {
                  setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                }
              }}
              placeholder="Enter new strong password"
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all ${
                fieldErrors.newPassword ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {fieldErrors.newPassword && (
              <p className="mt-1 text-2xs text-red-600 font-medium">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }
              }}
              placeholder="Re-enter new password"
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all ${
                fieldErrors.confirmPassword ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-2xs text-red-600 font-medium">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#0B3D2E] hover:bg-[#14573F] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#C9A24A]" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
