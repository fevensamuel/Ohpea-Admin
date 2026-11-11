import { useState, useEffect } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useAuthContext } from '@/context/AuthContext';
import { MembersApi } from '@/api/members';
import { localized } from '@/lib/i18n';
import { RegionsApi } from '@/api/regions';
import { LookupsApi } from '@/api/lookups';
import type { MemberSummary, RegionItem, LookupItem } from '@/types/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ExportButton } from '@/components/common/ExportButton';
import { MemberDetailModal } from '@/components/modals/MemberDetailModal';
import { RejectReasonModal } from '@/components/modals/RejectReasonModal';
import { useToast } from '@/context/ToastContext';
import {
  Search,
  Filter,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Lock,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  CreditCard,
  UserPlus,
} from 'lucide-react';

export function MemberList() {
  const { params, setParam, setMultipleParams, clearParams } = useQueryParams();
  const { user } = useAuthContext();
  const toast = useToast();

  // Search input state with debouncing
  const [searchInput, setSearchInput] = useState<string>(params.q || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Pagination hook
  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(
    Number(params.page) || 1,
    Number(params.pageSize) || 10
  );

  // Data states
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [sectors, setSectors] = useState<LookupItem[]>([]);
  const [fields, setFields] = useState<LookupItem[]>([]);

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Modals
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [rejectingMember, setRejectingMember] = useState<{ id: string; name: string } | null>(null);

  // Sync debounced search to URL query params
  useEffect(() => {
    if (debouncedSearch !== (params.q || '')) {
      setParam('q', debouncedSearch || null);
      setPage(1);
    }
  }, [debouncedSearch, params.q, setParam, setPage]);

  // Load lookup metadata
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

  // Fetch members consuming `meta`
  const fetchMembers = async () => {
    try {
      setLoading(true);
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
      setMembers(res.data);
      updateMeta(res.meta);
    } catch {
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

  // Active filter chips list
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
    activeChips.push({ key: 'regionId', label: `Region: ${regName || params.regionId}` });
  }
  if (params.sectorId) {
    const secName = sectors.find((s) => s.id === params.sectorId)?.name;
    activeChips.push({ key: 'sectorId', label: `Sector: ${secName || params.sectorId}` });
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
            Professional Member Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified hospitality experts, tour operators, educators &amp; hoteliers across Oromia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Protected binary download */}
          <ExportButton
            onExport={() => MembersApi.export(params)}
            filename={`OHPEA-Members-${new Date().toISOString().slice(0, 10)}.csv`}
            label="Export Filtered"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, member ID (OHPEA-...), phone, or email..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all"
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

          {/* Quick Filter Selects */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Registration Status */}
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

            {/* Membership Status */}
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

            {/* Region Select (Hidden for Regional Admin) */}
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

            {/* Sector Select */}
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

            {/* Payment Filter */}
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

        {/* Removable Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Active Filters:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#14573F]/10 text-[#0B3D2E] border border-[#14573F]/20"
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

      {/* Bulk actions banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#0B3D2E] text-white rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-semibold tabular-nums">
            {selectedIds.length} members selected for bulk batch action
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.info('Exporting selected members bundle...');
                MembersApi.export({ ids: selectedIds });
              }}
              className="px-3 py-1 bg-[#14573F] hover:bg-[#1F7A57] rounded-lg font-medium transition-colors"
            >
              Export Selected
            </button>
            <button
              onClick={() => toast.info('SMS Campaigns module will launch in Phase 3.')}
              className="px-3 py-1 bg-[#C9A24A]/20 text-[#F1E3B8] border border-[#C9A24A]/30 rounded-lg font-medium flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Send SMS (Soon)
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-emerald-300 hover:underline px-2"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Table / Data View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving member records..." />
        ) : members.length === 0 ? (
          <EmptyState
            title="No member records match your query"
            description="Try modifying search keywords or clearing active filters."
            action={
              <button
                onClick={() => {
                  setSearchInput('');
                  clearParams();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3D2E] rounded-lg hover:bg-[#14573F]"
              >
                Reset All Filters
              </button>
            }
          />
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
                      className="rounded border-slate-300 text-[#0B3D2E] focus:ring-[#0B3D2E]"
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
                {members.map((member) => (
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
                        className="rounded border-slate-300 text-[#0B3D2E] focus:ring-[#0B3D2E]"
                        aria-label={`Select member ${member.fullName}`}
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {member.memberNo}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0B3D2E]/10 text-[#0B3D2E] font-bold text-2xs flex items-center justify-center shrink-0">
                          {member.fullName[0]}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">
                            {member.fullName}
                          </p>
                          <p className="text-2xs text-slate-400 capitalize">
                            {member.gender} · {member.graduationLevel.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <p className="tabular-nums font-medium text-slate-700">{member.phone}</p>
                      <p className="text-2xs text-slate-400 truncate max-w-[130px]">
                        {member.email}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <p className="font-medium text-slate-800 truncate max-w-[150px]">
                        {member.sectorName}
                      </p>
                      <p className="text-2xs text-slate-400 truncate max-w-[150px]">
                        {member.fieldName}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-700 truncate max-w-[130px]">
                      {member.regionName}
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
                          {member.lastPaymentDate}
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
                              onClick={() => handleApprove(member.id, member.fullName)}
                              className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Approve applicant"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRejectingMember({ id: member.id, name: member.fullName })
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Consumes meta and only renders when meta.totalPages > 1 */}
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

      {/* Member Detail Modal */}
      {detailModalId && (
        <MemberDetailModal
          isOpen={true}
          memberId={detailModalId}
          onClose={() => setDetailModalId(null)}
          onStatusUpdated={fetchMembers}
        />
      )}

      {/* Reject Reason Modal */}
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
