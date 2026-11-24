import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { MembersApi } from '@/api/members';
import { useToast } from '@/context/ToastContext';

type ImportResult = { imported: number; total: number; results: Array<{ row: number; name?: string; status: string; message: string }> };

export function MemberImport() {
  const navigate = useNavigate();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const downloadTemplate = async () => {
    try {
      const blob = await MembersApi.downloadImportTemplate();
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'OPHEA-Member-Import-Template.xlsx'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { toast.error('Could not download the import template'); }
  };
  const submit = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    try { const response = await MembersApi.importFile(file); setResult(response); toast.success(`${response.imported} member records imported as pending review`); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Import failed'); }
    finally { setLoading(false); }
  };
  return <div className="mx-auto max-w-5xl space-y-5">
    <button onClick={() => navigate('/members')} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4"/>Back to members</button>
    <div><h1 className="text-xl font-bold text-slate-900">Bulk member import</h1><p className="mt-1 text-sm text-slate-500">Upload an Excel or CSV file using the provided column headings. Imported members remain pending until reviewed.</p></div>
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-emerald-800"/><h2 className="font-semibold text-slate-900">1. Download the template</h2></div><button onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><Download className="h-4 w-4"/>Download Excel template</button></div>
      <p className="text-xs leading-5 text-slate-500">Required columns: fullName, phone, email, gender, graduationLevelId, occupationType, sectorId, fieldOfStudyId, regionId, idType and idNumber. Use the exact IDs from the lookup tables and Regions page.</p>
      <div className="border-t border-slate-100 pt-4"><h2 className="font-semibold text-slate-900">2. Choose your file</h2><label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-emerald-700"><UploadCloud className="h-7 w-7 text-emerald-800"/><span className="mt-2 text-sm font-semibold text-slate-800">{file?.name || 'Select .xlsx or .csv file'}</span><span className="mt-1 text-xs text-slate-500">Maximum file size: 5 MB</span><input type="file" accept=".xlsx,.csv" className="sr-only" onChange={e=>{setFile(e.target.files?.[0] || null);setResult(null);}}/></label></div>
      <div className="flex justify-end"><button onClick={submit} disabled={!file || loading} className="rounded-lg bg-[#103f34] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{loading ? 'Importing…' : 'Import members'}</button></div>
    </section>
    {result && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold text-slate-900">Import results</h2><p className="mt-1 text-sm text-slate-600">{result.imported} imported · {result.total - result.imported} need attention · {result.total} rows processed</p></div><div className="max-h-[480px] overflow-auto"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Row</th><th className="px-4 py-3">Member</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Details</th></tr></thead><tbody>{result.results.map(r=><tr key={r.row} className="border-t border-slate-100"><td className="px-4 py-3">{r.row}</td><td className="px-4 py-3 font-medium">{r.name || '—'}</td><td className="px-4 py-3">{r.status}</td><td className="px-4 py-3 text-slate-600">{r.message}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
