import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { usePagination } from '@/hooks/usePagination';
import { MembersApi } from '@/api/members';
import { text } from '@/lib/normalize';
import type { MemberSummary, MemberDetail } from '@/types/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { RejectReasonModal } from '@/components/modals/RejectReasonModal';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { useToast } from '@/context/ToastContext';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Eye,
  Calendar,
  Building,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';

export function PendingRegistrations() {
  const { user } = useAuthContext();
  const toast = useToast();

  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(1, 10);
  const [pendingMembers, setPendingMembers] = useState<MemberSummary[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [rejectingTarget, setRejectingTarget] = useState<{ id: string; name: string } | null>(null);
  const [viewDoc, setViewDoc] = useState<{ id: string; name: string } | null>(null);

  const fetchPendingList = async () => {
    try {
      setLoading(true);
      const queryParams: Record<string, unknown> = {
        registrationStatus: 'pending',
        page,
        pageSize,
        regionId: user?.role === 'RegionalAdmin' ? user.regionId : undefined,
      };

      const res = await MembersApi.list(queryParams);
      const members = Array.isArray(res?.data) ? res.data : [];
      setPendingMembers(members);
      updateMeta(res?.meta);

      // Auto-select first member for split-screen inspection if none selected
      if (members.length > 0 && !selectedMember) {
        loadMemberDetails(members[0].id);
      } else if (members.length === 0) {
        setSelectedMember(null);
      }
    } catch {
      toast.error('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      const data = await MembersApi.get(id);
      setSelectedMember(data);
    } catch {
      toast.error('Could not load applicant dossier');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingList();
  }, [page, pageSize]);

  const handleApprove = async (id: string, name: string) => {
    try {
      setActionLoading(true);
      await MembersApi.approve(id);
      toast.success(`Application for ${name} has been approved.`);
      await fetchPendingList();
      await MembersApi.getPendingCount();
    } catch {
      toast.error('Approval failed. Please check credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingTarget) return;
    try {
      setActionLoading(true);
      await MembersApi.reject(rejectingTarget.id, reason);
      toast.success(`Application for ${rejectingTarget.name} has been rejected.`);
      setRejectingTarget(null);
      await fetchPendingList();
      await MembersApi.getPendingCount();
    } catch {
      toast.error('Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8772E]/10 text-[#E8772E] flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Pending Member Registrations
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8772E] text-white tabular-nums">
              {(meta?.total ?? 0)} awaiting review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review professional credentials, transcripts, and ID cards before granting official accreditation.
          </p>
        </div>

        {user?.role === 'RegionalAdmin' && (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
           Scoped to: {text(user.regionName)}
          </span>
        )}
      </div>

      {loading && pendingMembers.length === 0 ? (
        <LoadingSpinner text="Retrieving pending applications..." size="lg" />
      ) : pendingMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <EmptyState
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
            title="All Registrations Cleared!"
            description="There are currently no pending member applications requiring verification in your queue."
          />
        </div>
      ) : (
        /* Split view layout: Left table queue, Right active dossier & document inspection */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Queue Table (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 font-semibold text-xs text-slate-700 flex items-center justify-between">
              <span>Application Queue ({meta?.total ?? 0})</span>
              <span className="text-2xs text-slate-400">Select to inspect</span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px]">
              {pendingMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => loadMemberDetails(member.id)}
                    className={`p-4 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#0B3D2E]/5 border-l-3 border-[#0B3D2E]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {member.fullName}
                        </p>
                        <p className="text-2xs font-mono text-slate-500">{member.memberNo}</p>
                      </div>
                      <StatusBadge type="registration" status="pending" size="sm" />
                    </div>

                    <div className="mt-2 text-2xs text-slate-500 space-y-0.5">
                      <p className="truncate">
                        <strong className="text-slate-700">Region:</strong> {text(member.regionName)}
                      </p>
                      <p className="truncate">
                        <strong className="text-slate-700">Sector:</strong> {text(member.sectorName) || text((member as any).sectorLabel)}
                      </p>
                      <p className="truncate">
                        <strong className="text-slate-700">Field:</strong> {member.fieldName}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-2xs pt-2 border-t border-slate-100/80">
                      <span className="text-slate-400 tabular-nums">
                        {new Date(member.registeredAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleApprove(member.id, member.fullName)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded bg-[#0B3D2E] text-white hover:bg-[#14573F] font-semibold transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectingTarget({ id: member.id, name: member.fullName })
                          }
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination meta={meta} onPageChange={setPage} />
          </div>

          {/* Right: Inspection Dossier (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between">
            {detailLoading ? (
              <LoadingSpinner text="Retrieving applicant documents..." />
            ) : selectedMember ? (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B3D2E] text-[#F1E3B8] font-bold text-sm flex items-center justify-center shrink-0">
                      {selectedMember.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {selectedMember.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {selectedMember.memberNo} · Registered{' '}
                        {new Date(selectedMember.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setRejectingTarget({
                          id: selectedMember.id,
                          name: selectedMember.fullName,
                        })
                      }
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        handleApprove(selectedMember.id, selectedMember.fullName)
                      }
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A24A]" />
                      Approve Member
                    </button>
                  </div>
                </div>

                {/* Duplicate Warning if flagged */}
                {selectedMember.duplicateOf && (
                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold">Duplicate Profile Flag: </span>
                      This record matches phone or national ID of previously registered member{' '}
                      <strong>{selectedMember.duplicateOf}</strong>. Inspect certificate details.
                    </div>
                  </div>
                )}

                {/* Grid attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Identity &amp; Address
                    </span>
                    <p className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Gender:</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedMember.gender}
                      </span>
                    </p>
                    <p className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {selectedMember.phone}
                      </span>
                    </p>
                    <p className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                        {selectedMember.email}
                      </span>
                    </p>
                    <p className="flex justify-between py-0.5">
                      <span className="text-slate-500">National ID:</span>
                      <span className="font-semibold text-slate-800 uppercase">
                        {selectedMember.idType} ({selectedMember.idNumber})
                      </span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Hospitality Career
                    </span>
                    <p className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Region:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedMember.regionName}
                      </span>
                    </p>
                    <p className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Sector:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedMember.sectorName}
                      </span>
                    </p>
                    <p className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Degree/Level:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedMember.graduationLevel}
                      </span>
                    </p>
                    <p className="flex justify-between py-0.5">
                      <span className="text-slate-500">Employer:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedMember.employer || 'Independent Professional'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Uploaded Documents Side-by-Side Inspection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Applicant Uploaded Documents ({selectedMember.documents?.length || 0})
                    </span>
                  </div>

                  {selectedMember.documents && selectedMember.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMember.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-[#14573F] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {doc.name}
                              </p>
                              <p className="text-2xs text-slate-400">
                                {(doc.size / 1024).toFixed(0)} KB · Verified Scan
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewDoc({ id: doc.id, name: doc.name })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shrink-0 shadow-2xs"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-2xs text-amber-800">
                      Applicant did not upload external certificate files. Verify via direct college
                      inquiry.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400 text-xs">
                Select an application from the queue to view documents and decision actions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Document Viewer Modal */}
      {viewDoc && selectedMember && (
        <DocumentViewerModal
          isOpen={true}
          memberId={selectedMember.id}
          docId={viewDoc.id}
          docName={viewDoc.name}
          onClose={() => setViewDoc(null)}
        />
      )}

      {/* Embedded Reject Reason Modal */}
      {rejectingTarget && (
        <RejectReasonModal
          isOpen={true}
          memberId={rejectingTarget.id}
          memberName={rejectingTarget.name}
          isLoading={actionLoading}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingTarget(null)}
        />
      )}
    </div>
  );
}
