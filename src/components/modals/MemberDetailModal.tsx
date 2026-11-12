import { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  GraduationCap,
  Briefcase,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { MembersApi } from '@/api/members';
import type { MemberDetail, PaymentRecord } from '@/types/api';
import { localized } from '@/lib/i18n';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DocumentViewerModal } from './DocumentViewerModal';
import { RejectReasonModal } from './RejectReasonModal';
import { useToast } from '@/context/ToastContext';

interface MemberDetailModalProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function MemberDetailModal({
  memberId,
  isOpen,
  onClose,
  onStatusUpdated,
}: MemberDetailModalProps) {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Document viewer modal state
  const [viewDoc, setViewDoc] = useState<{ id: string; name: string } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (!isOpen || !memberId) {
      setMember(null);
      setPayments([]);
      return;
    }

    let isMounted = true;
    const fetchMember = async () => {
      setLoading(true);
      try {
        const data = await MembersApi.get(memberId);
        const payList = await MembersApi.getPayments(memberId);
        if (isMounted) {
          setMember(data);
          setPayments(payList);
        }
      } catch (err) {
        toast.error('Failed to load member profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMember();
    return () => {
      isMounted = false;
    };
  }, [isOpen, memberId, toast]);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!member) return;
    try {
      setActionLoading(true);
      await MembersApi.approve(member.id);
      toast.success(`Application for ${member.fullName} has been approved.`);
      const updated = await MembersApi.get(member.id);
      setMember(updated);
      onStatusUpdated?.();
    } catch (err) {
      toast.error('Failed to approve member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!member) return;
    try {
      setActionLoading(true);
      await MembersApi.reject(member.id, reason);
      toast.success(`Application for ${member.fullName} has been rejected.`);
      setRejectModalOpen(false);
      const updated = await MembersApi.get(member.id);
      setMember(updated);
      onStatusUpdated?.();
    } catch (err) {
      toast.error('Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!member) return;
    const nextStatus = member.membershipStatus === 'active' ? 'inactive' : 'active';
    try {
      setActionLoading(true);
      await MembersApi.updateStatus(member.id, nextStatus);
      toast.success(`Membership status updated to ${nextStatus}.`);
      const updated = await MembersApi.get(member.id);
      setMember(updated);
      onStatusUpdated?.();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] text-[#F1E3B8] font-bold flex items-center justify-center shrink-0">
                {member?.fullName
                  ? member.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'MB'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {member?.fullName || 'Member Profile'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {member?.memberNo || 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {member && (
                <div className="flex items-center gap-2 mr-2">
                  <StatusBadge type="registration" status={member.registrationStatus} />
                  <StatusBadge type="membership" status={member.membershipStatus} />
                </div>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading && <LoadingSpinner text="Loading member details..." />}

            {!loading && member && (
              <>
                {/* Duplicate Warning Banner */}
                {member.duplicateOf && (
                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2.5">
                    <span className="font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-2xs">
                      Duplicate Alert
                    </span>
                    <span>
                      This profile shares identifier records with existing member{' '}
                      <strong>{member.duplicateOf}</strong>. Verify identity before approving.
                    </span>
                  </div>
                )}

                {/* Grid 1: Personal & Professional Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#14573F]" />
                      Personal Information
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Gender</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {member.gender}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Phone</span>
                        <span className="font-semibold text-slate-800 tabular-nums flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {member.phone}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Email</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {member.email}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">National ID Type</span>
                        <span className="font-semibold text-slate-800 uppercase">
                          {member.idType} ({member.idNumber})
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Registered Date</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {member.registeredAt
                            ? new Date(member.registeredAt).toLocaleDateString('en-GB')
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#14573F]" />
                      Professional &amp; Regional
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Regional Cluster</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {localized(member.regionName)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Industry Sector</span>
                        <span className="font-semibold text-slate-800">
                          {localized(member.sectorName)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Field of Study</span>
                        <span className="font-semibold text-slate-800">
                          {localized(member.fieldName)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Graduation Level</span>
                        <span className="font-semibold text-slate-800">
                          {localized(member.graduationLevel)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Employer / Org</span>
                        <span className="font-semibold text-slate-800">
                          {member.employer || 'Independent Specialist'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#14573F]" />
                      Authenticated Uploaded Documents ({member.documents?.length || 0})
                    </span>
                  </h4>

                  {member.documents && member.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {member.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {doc.name}
                              </p>
                              <p className="text-2xs text-slate-400">
                                {(doc.size / 1024).toFixed(0)} KB · Uploaded {doc.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewDoc({ id: doc.id, name: doc.name })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-semibold bg-white border border-slate-200 text-[#0B3D2E] hover:bg-[#0B3D2E] hover:text-white transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No documents attached to this record.
                    </p>
                  )}
                </div>

                {/* Contribution History */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#14573F]" />
                    Contribution History ({payments.length})
                  </h4>

                  {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Receipt No</th>
                            <th className="py-2 px-3 font-semibold">Period</th>
                            <th className="py-2 px-3 font-semibold">Method</th>
                            <th className="py-2 px-3 font-semibold text-right">Amount (ETB)</th>
                            <th className="py-2 px-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((p) => (
                            <tr key={p.id}>
                              <td className="py-2 px-3 font-mono text-slate-700">{p.receiptNo}</td>
                              <td className="py-2 px-3 capitalize">{p.period}</td>
                              <td className="py-2 px-3 capitalize">{p.method.replace('_', ' ')}</td>
                              <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">
                                {p.amountEtb.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3">
                                <StatusBadge type="payment" status={p.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No payment transactions recorded.</p>
                  )}
                </div>

                {member.rejectionReason && (
                  <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs">
                    <span className="font-bold">Rejection Note: </span>
                    {member.rejectionReason}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <div>
              {member?.registrationStatus === 'approved' && (
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {member.membershipStatus === 'active' ? 'Deactivate Member' : 'Activate Member'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {member?.registrationStatus === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-red-300 text-red-700 hover:bg-red-50 transition-colors shadow-2xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A24A]" />
                    Approve Registration
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Document Viewer Modal */}
      {viewDoc && member && (
        <DocumentViewerModal
          isOpen={true}
          memberId={member.id}
          docId={viewDoc.id}
          docName={viewDoc.name}
          onClose={() => setViewDoc(null)}
        />
      )}

      {/* Embedded Reject Reason Modal */}
      {rejectModalOpen && member && (
        <RejectReasonModal
          isOpen={true}
          memberId={member.id}
          memberName={member.fullName}
          isLoading={actionLoading}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectModalOpen(false)}
        />
      )}
    </>
  );
}
