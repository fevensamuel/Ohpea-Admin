import { useState, useEffect } from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';
import { MembersApi } from '@/api/members';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DocumentViewerModalProps {
  isOpen: boolean;
  memberId: string;
  docId: string;
  docName: string;
  onClose: () => void;
}

export function DocumentViewerModal({
  isOpen,
  memberId,
  docId,
  docName,
  onClose,
}: DocumentViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !memberId || !docId) {
      setBlobUrl(null);
      return;
    }

    let urlToRevoke: string | null = null;
    let isCurrent = true;

    const loadDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = await MembersApi.getDocumentBlobUrl(memberId, docId);
        if (isCurrent) {
          urlToRevoke = url;
          setBlobUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : 'Failed to load document');
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadDoc();

    return () => {
      isCurrent = false;
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [isOpen, memberId, docId]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const blob = await MembersApi.downloadDocument(memberId, docId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docName || `document-${docId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // quiet fallback
    }
  };

  const isImage = docName.match(/\.(jpg|jpeg|png|webp|svg)$/i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-[#0B3D2E] shrink-0" />
            <h3 className="text-sm font-bold text-slate-800 truncate">{docName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-100 min-h-[420px]">
          {loading && <LoadingSpinner text="Retrieving authenticated document..." />}

          {error && (
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-red-200 text-red-700 max-w-md">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <div className="w-full h-full flex items-center justify-center">
              {isImage ? (
                <img
                  src={blobUrl}
                  alt={docName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={blobUrl}
                  title={docName}
                  className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
