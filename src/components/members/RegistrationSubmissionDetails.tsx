import React from 'react';

type RecordValue = Record<string, unknown>;

interface RegistrationSubmissionDetailsProps {
  details?: unknown;
  title?: string;
}

const isRecord = (value: unknown): value is RecordValue =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const humanize = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const sectionFor = (key: string): string => {
  const k = key.toLowerCase();
  if (/education|qualification|graduation|academic|institution|fieldofstudy/.test(k)) return 'Education & Qualifications';
  if (/certification|license|licence|credential/.test(k)) return 'Professional Certifications & Licenses';
  if (/experience|workhistory|employment|workplace|organization|jobtitle|employer|business|tin|established|employee/.test(k)) return 'Employment & Business';
  if (/language|afaan|amharic|english|arabic|french/.test(k)) return 'Languages & Skills';
  if (/expertise|interest|mentor|specialized|technical|skill|software/.test(k)) return 'Expertise & Association Interests';
  if (/payment|bank|platform|transaction|receipt|amountpaid|paidat/.test(k)) return 'Payment Confirmation';
  if (/declaration|signature|consent|applicantfullname/.test(k)) return 'Declaration & Agreement';
  if (/emergency|secondaryphone|alternate|relationship|phone|email|gender|birth|nationality|name|region|zone|woreda|town|city|address|idnumber|membershipcategory/.test(k)) return 'Personal & Contact Information';
  return 'Other Submitted Information';
};

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
};

function ValueView({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-slate-400">Not provided</span>;
    const objectItems = value.some(isRecord);
    if (!objectItems) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <span key={index} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-800">
              {formatPrimitive(item) || '—'}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Entry {index + 1}</p>
            {isRecord(item) ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(item).map(([key, nested]) => (
                  <div key={key} className="min-w-0">
                    <p className="text-[10px] text-slate-400">{humanize(key)}</p>
                    <div className="break-words text-xs font-medium text-slate-800"><ValueView value={nested} /></div>
                  </div>
                ))}
              </div>
            ) : <ValueView value={item} />}
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (!entries.length) return <span className="text-slate-400">Not provided</span>;
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entries.map(([key, nested]) => (
          <div key={key} className="min-w-0">
            <p className="text-[10px] text-slate-400">{humanize(key)}</p>
            <div className="break-words text-xs font-medium text-slate-800"><ValueView value={nested} /></div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="break-words">{formatPrimitive(value) || '—'}</span>;
}

export function RegistrationSubmissionDetails({
  details,
  title = 'Complete Public Registration Submission',
}: RegistrationSubmissionDetailsProps) {
  if (!isRecord(details)) return null;

  const submittedFields = isRecord(details.submittedFields) ? details.submittedFields : {};
  // The backend stores the original request under submittedFields and merges
  // officialFormData into the root. Prefer root values where both exist.
  const values: RecordValue = { ...submittedFields, ...details };
  delete values.submittedFields;
  delete values.officialFormData;

  const groups = new Map<string, [string, unknown][]>();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === '') continue;
    const group = sectionFor(key);
    const entries = groups.get(group) || [];
    entries.push([key, value]);
    groups.set(group, entries);
  }

  if (!groups.size) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">{title}</h4>
        <p className="mt-2 text-xs text-slate-400">No additional registration details were submitted.</p>
      </section>
    );
  }

  const order = [
    'Personal & Contact Information',
    'Employment & Business',
    'Education & Qualifications',
    'Professional Certifications & Licenses',
    'Languages & Skills',
    'Expertise & Association Interests',
    'Payment Confirmation',
    'Declaration & Agreement',
    'Other Submitted Information',
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="mt-0.5 text-[11px] text-slate-500">All additional fields captured by the public website registration form.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
          {Object.keys(values).length} submitted fields
        </span>
      </div>
      {order.filter((group) => groups.has(group)).map((group) => (
        <div key={group} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h5 className="mb-3 border-b border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#103f34]">{group}</h5>
          <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
            {groups.get(group)!.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <p className="mb-1 text-[10px] font-medium text-slate-500">{humanize(key)}</p>
                <div className="text-xs font-semibold text-slate-800"><ValueView value={value} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
