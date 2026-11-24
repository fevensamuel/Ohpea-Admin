import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useAuthContext } from '@/context/AuthContext';
import { MembersApi } from '@/api/members';
import { localized } from '@/lib/i18n';
import { text } from '@/lib/normalize';
import { RegionsApi } from '@/api/regions';
import { LookupsApi } from '@/api/lookups';
import type { MemberSummary, RegionItem, LookupItem } from '@/types/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { ExportButton } from '@/components/common/ExportButton';
import { MemberDetailModal } from '@/components/modals/MemberDetailModal';
import { RejectReasonModal } from '@/components/modals/RejectReasonModal';
import { useToast } from '@/context/ToastContext';
import {
  Search,
  MessageSquare,
  Filter,
  X,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  CreditCard,
  UserPlus,
} from 'lucide-react';

export function MemberList() {
  const { params, setParam, setMultipleParams, clearParams } = useQueryParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuthContext();
  const toast = useToast();

  const [searchInput, setSearchInput] = useState<string>(params.q || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(
    Number(params.page) || 1,
    Number(params.pageSize) || 10
  );

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [sectors, setSectors] = useState<LookupItem[]>([]);
  const [fields, setFields] = useState<LookupItem[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [rejectingMember, setRejectingMember] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (debouncedSearch !== (params.q || '')) {
      setParam('q', debouncedSearch || null);
      setPage(1);
    }
  }, [debouncedSearch, params.q, setParam, setPage]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [regList, secList, fldList] = await Promise.all([
          RegionsApi.list(),
          LookupsApi.get('sectors'),
          LookupsApi.get('fields'),
        ]);
        setRegions(regList);
        setSectors(secList);
        setFields(fldList);
      } catch {
        // quiet fallback
      }
    };
    loadLookups();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const queryPayload: Record<string, unknown> = {
        page,
        pageSize,
        q: params.q || undefined,
        registrationStatus: params.registrationStatus || undefined,
        membershipStatus: params.membershipStatus || undefined,
        gender: params.gender || undefined,
        regionId: user?.role === 'RegionalAdmin' ? user.regionId : params.regionId || undefined,
        sectorId: params.sectorId || undefined,
        fieldId: params.fieldId || undefined,
        paid: params.paid !== undefined ? params.paid : undefined,
      };

      const res = await MembersApi.list(queryPayload);
      setMembers(Array.isArray(res.data) ? res.data : []);
      updateMeta(res.meta);
    } catch {
      setLoadError(true);
      toast.error('Failed to load member records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [
    page,
    pageSize,
    params.q,
    params.registrationStatus,
    params.membershipStatus,
    params.gender,
    params.regionId,
    params.sectorId,
    params.fieldId,
    params.paid,
  ]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(members.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await MembersApi.approve(id);
      toast.success(`Approved application for ${name}`);
      fetchMembers();
    } catch {
      toast.error('Failed to approve member');
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingMember) return;
    try {
      await MembersApi.reject(rejectingMember.id, reason);
      toast.success(`Application for ${rejectingMember.name} rejected`);
      setRejectingMember(null);
      fetchMembers();
    } catch {
      toast.error('Failed to reject application');
    }
  };

  const activeChips: { key: string; label: string }[] = [];
  if (params.q) activeChips.push({ key: 'q', label: `Search: "${params.q}"` });
  if (params.registrationStatus) {
    activeChips.push({ key: 'registrationStatus', label: `Reg: ${params.registrationStatus}` });
  }
  if (params.membershipStatus) {
    activeChips.push({ key: 'membershipStatus', label: `Status: ${params.membershipStatus}` });
  }
  if (params.gender) activeChips.push({ key: 'gender', label: `Gender: ${params.gender}` });
  if (params.regionId) {
    const regName = regions.find((r) => r.id === params.regionId)?.name;
    activeChips.push({ key: 'regionId', label: `Region: ${text(regName) || params.regionId}` });
  }
  if (params.sectorId) {
    const secName = sectors.find((s) => s.id === params.sectorId)?.name;
    activeChips.push({ key: 'sectorId', label: `Sector: ${text(secName) || params.sectorId}` });
  }
  if (params.paid) {
    activeChips.push({
      key: 'paid',
      label: params.paid === 'true' ? 'Contributions: Paid' : 'Contributions: Unpaid',
    });
  }

  const removeChip = (key: string) => {
    if (key === 'q') setSearchInput('');
    setParam(key, null);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Members
          </h2>
          <p className="text-sm text-[#718078] mt-1">
            Manage the professionals shaping Oromia’s visitor economy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('members.edit') && <button type="button" onClick={() => navigate('/members/new')} className="rounded-lg bg-[#103f34] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#246b55]">Add Member</button>}
          {hasPermission('members.edit') && <button type="button" onClick={() => navigate('/members/import')} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Bulk Import</button>}
          <ExportButton
            onExport={() => MembersApi.export({ ...params, format: 'xlsx' })}
            filename={`OPHEA-Members-${new Date().toISOString().slice(0, 10)}.xlsx`}
            label="Export Excel"
          />
          <ExportButton
            onExport={() => MembersApi.export({ ...params, format: 'pdf' })}
            filename={`OPHEA-Members-${new Date().toISOString().slice(0, 10)}.pdf`}
            label="Export PDF"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, member ID (OPHEA-...), phone, or email..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#103f34]/20 focus:border-[#103f34] transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={params.registrationStatus || ''}
              onChange={(e) => {
                setParam('registrationStatus', e.target.value || null);
                setPage(1);
              }}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="">All Registration</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={params.membershipStatus || ''}
              onChange={(e) => {
                setParam('membershipStatus', e.target.value || null);
                setPage(1);
              }}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {user?.role !== 'RegionalAdmin' && (
              <select
                value={params.regionId || ''}
                onChange={(e) => {
                  setParam('regionId', e.target.value || null);
                  setPage(1);
                }}
                className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="">All Regions</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {localized(r.name)}
                  </option>
                ))}
              </select>
            )}

            <select
              value={params.sectorId || ''}
              onChange={(e) => {
                setParam('sectorId', e.target.value || null);
                setPage(1);
              }}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {localized(s.name)}
                </option>
              ))}
            </select>

            <select
              value={params.paid || ''}
              onChange={(e) => {
                setParam('paid', e.target.value || null);
                setPage(1);
              }}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="">Contributions</option>
              <option value="true">Paid (Current)</option>
              <option value="false">Unpaid</option>
            </select>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Active Filters:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#246b55]/10 text-[#103f34] border border-[#246b55]/20"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="hover:text-red-700 p-0.5"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                clearParams();
                setPage(1);
              }}
              className="text-2xs font-semibold text-slate-500 hover:text-slate-800 underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#103f34] text-white rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-semibold tabular-nums">
            {selectedIds.length} members selected for bulk batch action
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const exportSelected = async () => {
                  try {
                    const blob = await MembersApi.export({ ids: selectedIds.join(','), format: 'xlsx' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `OPHEA-Selected-Members-${new Date().toISOString().slice(0, 10)}.xlsx`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    toast.success('Selected member export downloaded');
                  } catch { toast.error('Could not export selected members'); }
                };
                void exportSelected();
              }}
              className="px-3 py-1 bg-[#246b55] hover:bg-[#3b8069] rounded-lg font-medium transition-colors"
            >
              Export Selected
            </button>
            {hasPermission('sms') && <button
              onClick={() => navigate('/communication/sms')}
              className="px-3 py-1 bg-[#b49a5a]/20 text-[#eee5ce] border border-[#b49a5a]/30 rounded-lg font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" /> SMS Center
            </button>}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-emerald-300 hover:underline px-2"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-5 sm:p-6 space-y-5" aria-label="Loading member directory" aria-live="polite">
            <div>
              <h3 className="text-base font-semibold text-[#203a32]">Loading members...</h3>
              <p className="mt-1 text-sm text-[#718078]">Please wait while the directory is prepared.</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#e1e6df]">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[32px_1fr_1.2fr_1.3fr_1.2fr_1fr_1fr_1fr_1fr_72px] gap-3 bg-[#f8f9f6] px-4 py-3">
                  {Array.from({ length: 10 }, (_, n) => <div key={n} className="h-2.5 rounded bg-[#e8ece6] animate-pulse" />)}
                </div>
                {Array.from({ length: 7 }, (_, n) => (
                  <div key={n} className="grid grid-cols-[32px_1fr_1.2fr_1.3fr_1.2fr_1fr_1fr_1fr_1fr_72px] items-center gap-3 border-t border-[#e1e6df] px-4 py-4">
                    {Array.from({ length: 10 }, (_, cell) => <div key={cell} className={`h-3 rounded bg-[#edf0eb] animate-pulse ${cell === 9 ? 'w-12' : 'w-full'}`} />)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : loadError ? (
          <div className="m-5 sm:m-6 rounded-lg border border-[#e1e6df] bg-white p-8 sm:p-10 text-center">
            <span className="inline-flex items-center rounded-full bg-[#fbefe4] px-3 py-1 text-[10px] font-semibold tracking-wide text-[#a95427]">CONNECTION UNAVAILABLE</span>
            <h3 className="mt-4 text-lg font-semibold text-[#203a32]">Directory couldn’t be loaded</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#718078]">We couldn’t retrieve member records. Check your connection and try again.</p>
            <button type="button" onClick={fetchMembers} className="mt-6 inline-flex items-center rounded-md bg-[#103f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#246b55]">Try again</button>
          </div>
        ) : members.length === 0 ? (
          <div className="m-5 sm:m-6 rounded-lg border border-[#e1e6df] bg-white p-7 sm:p-8 md:p-9 text-left min-h-[280px]">
            <h3 className="text-xl font-semibold tracking-tight text-[#203a32]">No members match your filters</h3>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#718078]">Try a different name or member ID, or clear your filters.<br className="hidden sm:block" /> Your member records haven’t changed.</p>
            {activeChips.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-3">
                {activeChips.map((chip) => (
                  <span key={chip.key} className="inline-flex rounded-md bg-[#f5f5f0] px-3 py-1.5 text-xs font-medium text-[#68786f]">{chip.label}</span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => { setSearchInput(''); clearParams(); }}
              className="mt-7 rounded-md bg-[#103f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#246b55]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === members.length && members.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#103f34] focus:ring-[#103f34]"
                      aria-label="Select all rows on current page"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">Member No</th>
                  <th className="py-3 px-3 font-semibold">Full Name</th>
                  <th className="py-3 px-3 font-semibold">Contact</th>
                  <th className="py-3 px-3 font-semibold">Sector &amp; Field</th>
                  <th className="py-3 px-3 font-semibold">Region</th>
                  <th className="py-3 px-3 font-semibold">Registration</th>
                  <th className="py-3 px-3 font-semibold">Membership</th>
                  <th className="py-3 px-3 font-semibold">Contribution</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => {
                  const fullName = text(member.fullName);
                  const gradLabel =
                    text(member.gradLabel) ||
                    text(member.graduationLevel) ||
                    '—';
                  const sectorLabel =
                    text(member.sectorLabel) ||
                    text(member.sectorName) ||
                    '—';
                  const fieldLabel =
                    text(member.fieldLabel) ||
                    text(member.fieldName) ||
                    '—';
                  const regionLabel = text(member.regionName) || '—';
                  const initial = fullName.charAt(0).toUpperCase() || '?';

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setDetailModalId(member.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(member.id)}
                          onChange={() => handleToggleSelect(member.id)}
                          className="rounded border-slate-300 text-[#103f34] focus:ring-[#103f34]"
                          aria-label={`Select member ${fullName}`}
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {text(member.memberNo)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#103f34]/10 text-[#103f34] font-bold text-2xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-900 truncate">
                              {fullName}
                            </p>
                            <p className="text-2xs text-slate-400 capitalize">
                              {text(member.gender)} · {gradLabel.split(' ')[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <p className="tabular-nums font-medium text-slate-700">
                          {text(member.phone)}
                        </p>
                        <p className="text-2xs text-slate-400 truncate max-w-[130px]">
                          {text(member.email)}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <p className="font-medium text-slate-800 truncate max-w-[150px]">
                          {sectorLabel}
                        </p>
                        <p className="text-2xs text-slate-400 truncate max-w-[150px]">
                          {fieldLabel}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-slate-700 truncate max-w-[130px]">
                        {regionLabel}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge type="registration" status={member.registrationStatus} />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge type="membership" status={member.membershipStatus} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              member.hasPaidRecentPeriod ? 'bg-emerald-600' : 'bg-red-500'
                            }`}
                          />
                          <span className="font-medium text-slate-700">
                            {member.hasPaidRecentPeriod ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        {member.lastPaymentDate && (
                          <span className="text-2xs text-slate-400 block tabular-nums">
                            {text(member.lastPaymentDate)}
                          </span>
                        )}
                      </td>
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailModalId(member.id)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="View member dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {member.registrationStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(member.id, fullName)}
                                className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Approve applicant"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setRejectingMember({ id: member.id, name: fullName })
                                }
                                className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                title="Reject applicant"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          meta={meta}
          onPageChange={(p) => {
            setPage(p);
            setParam('page', p);
          }}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setParam('pageSize', s);
          }}
        />
      </div>

      {detailModalId && (
        <MemberDetailModal
          isOpen={true}
          memberId={detailModalId}
          onClose={() => setDetailModalId(null)}
          onStatusUpdated={fetchMembers}
        />
      )}

      {rejectingMember && (
        <RejectReasonModal
          isOpen={true}
          memberId={rejectingMember.id}
          memberName={rejectingMember.name}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingMember(null)}
        />
      )}
    </div>
  );
}