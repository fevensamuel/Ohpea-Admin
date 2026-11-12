import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MembersApi } from '@/api/members';
import { localized } from '@/lib/i18n';
import { RegionsApi } from '@/api/regions';
import { LookupsApi } from '@/api/lookups';
import { useAuthContext } from '@/context/AuthContext';
import type { MemberDetail, RegionItem, LookupItem, MemberIdType, MemberGender } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { ApiError } from '@/types/api';
import { ArrowLeft, Save, Trash2, UserX } from 'lucide-react';

export function MemberEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isSuperAdmin } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Lookups
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [sectors, setSectors] = useState<LookupItem[]>([]);
  const [fields, setFields] = useState<LookupItem[]>([]);
  const [gradLevels, setGradLevels] = useState<LookupItem[]>([]);

  // Form state
  const [member, setMember] = useState<Partial<MemberDetail>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [mem, regList, secList, fldList, grdList] = await Promise.all([
          MembersApi.get(id),
          RegionsApi.list(),
          LookupsApi.get('sectors'),
          LookupsApi.get('fields'),
          LookupsApi.get('graduation-levels'),
        ]);
        setMember(mem);
        setRegions(regList);
        setSectors(secList);
        setFields(fldList);
        setGradLevels(grdList);
      } catch (err) {
        toast.error('Failed to load member profile for editing');
        navigate('/members');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setFieldErrors({});

    try {
      setSaving(true);
      await MembersApi.update(id, member);
      toast.success(`Profile for ${member.fullName} updated.`);
      navigate('/members');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) {
          setFieldErrors(err.fields);
          return;
        }
        toast.error(err.message);
      } else {
        toast.error('Failed to save member updates');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await MembersApi.delete(id);
      toast.success('Member record deleted.');
      navigate('/members');
    } catch {
      toast.error('Failed to delete member record');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving member dossier..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/members')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Member</span>
            </button>
          )}
          <button
            type="submit"
            form="member-edit-form"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0B3D2E] text-white text-xs font-semibold hover:bg-[#14573F] transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-[#C9A24A]" />
            <span>{saving ? 'Saving...' : 'Save Member Details'}</span>
          </button>
        </div>
      </div>

      <form
        id="member-edit-form"
        onSubmit={handleSave}
        className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6 text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Edit Member Dossier: {member.fullName}
            </h2>
            <p className="text-xs text-slate-500 font-mono">Member ID: {member.memberNo}</p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs text-[#14573F]">
            1. Personal Identification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={member.fullName || ''}
                onChange={(e) => setMember({ ...member, fullName: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  fieldErrors.fullName ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-2xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={member.phone || ''}
                onChange={(e) => setMember({ ...member, phone: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  fieldErrors.phone ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-2xs text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={member.email || ''}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  fieldErrors.email ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-2xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={member.gender || 'unspecified'}
                onChange={(e) => setMember({ ...member, gender: e.target.value as MemberGender })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unspecified">Unspecified</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={(member.dateOfBirth || member.birthDate || '').slice(0, 10)}
                onChange={(e) => setMember({ ...member, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
              <input
                type="text"
                value={member.nationality || ''}
                onChange={(e) => setMember({ ...member, nationality: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">National ID Type</label>
              <select
                value={member.idType || 'fayda'}
                onChange={(e) => setMember({ ...member, idType: e.target.value as MemberIdType })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="fayda">Fayda National ID</option>
                <option value="passport">Ethiopian Passport</option>
                <option value="kebele">Resident Kebele ID</option>
                <option value="driver">Driver License</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ID Number</label>
              <input
                type="text"
                value={member.idNumber || ''}
                onChange={(e) => setMember({ ...member, idNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={member.emergencyContactName || ''}
                onChange={(e) => setMember({ ...member, emergencyContactName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={member.emergencyContactPhone || ''}
                onChange={(e) => setMember({ ...member, emergencyContactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Professional & Regional Classifications */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs text-[#14573F]">
            2. Professional &amp; Academic Background
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Membership Category</label>
              <input
                type="text"
                value={member.membershipCategory || ''}
                onChange={(e) => setMember({ ...member, membershipCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Regional Cluster</label>
              <select
                value={member.regionId || ''}
                onChange={(e) => {
                  const reg = regions.find((r) => r.id === e.target.value);
                  setMember({
                    ...member,
                    regionId: e.target.value,
                    regionName: localized(reg?.name),
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {localized(r.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <select
                value={member.sectorId || ''}
                onChange={(e) => {
                  const sec = sectors.find((s) => s.id === e.target.value);
                  setMember({
                    ...member,
                    sectorId: e.target.value,
                    sectorName: localized(sec?.name),
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {localized(s.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Field of Study</label>
              <select
                value={member.fieldId || ''}
                onChange={(e) => {
                  const fld = fields.find((f) => f.id === e.target.value);
                  setMember({
                    ...member,
                    fieldId: e.target.value,
                    fieldName: localized(fld?.name),
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {localized(f.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Graduation Level</label>
              <select
                value={
                  typeof member.graduationLevel === 'string'
                    ? member.graduationLevel
                    : member.graduationLevel?.en ||
                      member.graduationLevel?.om ||
                      member.graduationLevel?.am ||
                      ''
                }
                onChange={(e) => setMember({ ...member, graduationLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                {gradLevels.map((g) => (
                  <option key={g.id} value={localized(g.name)}>
                    {localized(g.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution</label>
              <input
                type="text"
                value={member.institution || ''}
                onChange={(e) => setMember({ ...member, institution: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
              <input
                type="text"
                value={member.occupationType || ''}
                onChange={(e) => setMember({ ...member, occupationType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employer / Company</label>
              <input
                type="text"
                value={member.employer || ''}
                onChange={(e) => setMember({ ...member, employer: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business TIN</label>
              <input
                type="text"
                value={member.businessTin || ''}
                onChange={(e) => setMember({ ...member, businessTin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title / Role</label>
              <input
                type="text"
                value={member.jobTitle || ''}
                onChange={(e) => setMember({ ...member, jobTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={member.yearsOfExperience ?? ''}
                onChange={(e) =>
                  setMember({
                    ...member,
                    yearsOfExperience: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skills</label>
              <textarea
                rows={2}
                value={(member.skills || []).join(', ')}
                onChange={(e) =>
                  setMember({
                    ...member,
                    skills: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                  })
                }
                placeholder="Separate items with commas"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expertise Areas</label>
              <textarea
                rows={2}
                value={(member.expertiseAreas || []).join(', ')}
                onChange={(e) =>
                  setMember({
                    ...member,
                    expertiseAreas: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                  })
                }
                placeholder="Separate items with commas"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interests</label>
              <textarea
                rows={2}
                value={(member.interests || []).join(', ')}
                onChange={(e) =>
                  setMember({
                    ...member,
                    interests: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                  })
                }
                placeholder="Separate items with commas"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Membership Status Overrides */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs text-[#14573F]">
            3. Membership Status &amp; Internal Notes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Membership Status</label>
              <select
                value={member.membershipStatus || 'active'}
                onChange={(e) => setMember({ ...member, membershipStatus: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
              >
                <option value="active">Active (Full Credentials)</option>
                <option value="inactive">Inactive / Suspended</option>
                <option value="pending">Pending Validation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registration Review Status
              </label>
              <select
                value={member.registrationStatus || 'approved'}
                onChange={(e) =>
                  setMember({ ...member, registrationStatus: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Internal Staff Note</label>
            <textarea
              rows={2}
              value={member.notes || ''}
              onChange={(e) => setMember({ ...member, notes: e.target.value })}
              placeholder="Private staff notes regarding credentials verification or payment plans..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmModal
          isOpen={true}
          title={`Delete member ${member.fullName}?`}
          message="Are you sure you want to permanently delete this member record? This will soft delete their membership dossier and archive associated records."
          confirmLabel="Delete Member"
          isDestructive={true}
          isLoading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
