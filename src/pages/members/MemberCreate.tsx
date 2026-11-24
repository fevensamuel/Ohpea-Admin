import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { RegionsApi } from '@/api/regions';
import { LookupsApi } from '@/api/lookups';
import { MembersApi } from '@/api/members';
import { localized } from '@/lib/i18n';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { LookupItem, RegionItem } from '@/types/api';

type Row = Record<string, string>;
const blankEducation = (): Row => ({ qualification: '', field: '', institution: '', country: '', graduation: '' });
const blankCertification = (): Row => ({ name: '', issuer: '', issueDate: '', expiryDate: '' });
const blankExperience = (): Row => ({ organization: '', jobTitle: '', responsibilities: '', startDate: '', endDate: '', currentlyWorking: 'false' });
const expertiseOptions = ['Hotel & Resort Operations', 'Food & Beverage / Culinary Arts', 'Eco-Tourism & Cultural Tourism', 'Hospitality Entrepreneurship & Planning', 'Marketing, Branding & Digital Presence', 'Human Resources & Staff Training', 'Quality Assurance & Customer Experience', 'Financial & Revenue Management', 'Event & Conference Management'];
const interestOptions = ['Networking & Business Partnerships', 'Professional Development & Workshops', 'Mentorship', 'Policy Advocacy & Industry Representation', 'Access to Finance & Investment', 'Research & Oromia Tourism Promotion', 'Volunteering on Association Committees', 'Job Placement & Career Support'];
const languageOptions = ['Afaan Oromoo', 'Amharic', 'English', 'Arabic', 'French', 'Other'];

export function MemberCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthContext();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [sectors, setSectors] = useState<LookupItem[]>([]);
  const [fields, setFields] = useState<LookupItem[]>([]);
  const [qualifications, setQualifications] = useState<LookupItem[]>([]);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [values, setValues] = useState<Record<string, any>>({
    membershipCategory: 'Professional', nationality: 'Ethiopian', gender: 'female', idType: 'fayda',
    preferredLanguage: 'en', occupationType: 'private', education: [blankEducation()],
    certifications: [blankCertification()], experience: [blankExperience()], language: {},
    languagesKnown: [], areasOfExpertise: [], areasOfInterest: [],
  });
  const steps = ['Membership & Personal', 'Employment & Business', 'Education', 'Certifications', 'Experience', 'Skills & Languages', 'Expertise & Interests', 'Fees & Payment', 'Documents & Declaration'];
  const isRegional = user?.role === 'RegionalAdmin';

  useEffect(() => {
    if (user?.role === 'RegionalAdmin' && user.regionId) setValues((prev) => ({ ...prev, regionId: user.regionId }));
    Promise.all([RegionsApi.list(), LookupsApi.get('sectors'), LookupsApi.get('fields'), LookupsApi.get('graduation-levels')])
      .then(([r, s, f, q]) => { setRegions(r); setSectors(s); setFields(f); setQualifications(q); })
      .catch(() => toast.error('Could not load registration lookup options'));
  }, []);

  const set = (key: string, value: any) => setValues((prev) => ({ ...prev, [key]: value }));
  const setRow = (key: 'education' | 'certifications' | 'experience', index: number, field: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: prev[key].map((row: Row, i: number) => i === index ? { ...row, [field]: value } : row) }));
  };
  const addRow = (key: 'education' | 'certifications' | 'experience') => {
    const make = key === 'education' ? blankEducation : key === 'certifications' ? blankCertification : blankExperience;
    setValues((prev) => ({ ...prev, [key]: [...prev[key], make()] }));
  };
  const removeRow = (key: 'education' | 'certifications' | 'experience', index: number) => {
    setValues((prev) => ({ ...prev, [key]: prev[key].filter((_: Row, i: number) => i !== index) }));
  };
  const toggleArray = (key: string, item: string) => {
    const current: string[] = values[key] || [];
    set(key, current.includes(item) ? current.filter((x) => x !== item) : [...current, item]);
  };
  const field = (key: string, label: string, type = 'text', required = false, placeholder = '') => (
    <label className="block text-xs font-semibold text-slate-700" key={key}>{label}{required && <span className="text-rose-600"> *</span>}
      <input type={type} required={required} value={values[key] ?? ''} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10" />
    </label>
  );
  const select = (key: string, label: string, options: Array<[string, string]>, required = false) => (
    <label className="block text-xs font-semibold text-slate-700" key={key}>{label}{required && <span className="text-rose-600"> *</span>}
      <select required={required} value={values[key] ?? ''} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-800">{!required && <option value="">Select…</option>}{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>
  );
  const textarea = (key: string, label: string) => <label className="block text-xs font-semibold text-slate-700" key={key}>{label}<textarea rows={3} value={values[key] ?? ''} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label>;
  const upload = (key: string, label: string, required = false, multiple = false) => <label key={key} className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs font-semibold text-slate-700"><span>{label}{required && <span className="text-rose-600"> *</span>}</span><span className="mt-2 flex items-center gap-2 text-slate-500"><UploadCloud className="h-4 w-4"/>{files[key]?.length ? files[key].map(f => f.name).join(', ') : 'Choose file(s)'}</span><input className="mt-2 block w-full text-xs font-normal" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple={multiple} required={required && !(files[key]?.length)} onChange={(e) => setFiles((prev) => ({ ...prev, [key]: Array.from(e.target.files || []) }))}/></label>;
  const rowInputs = (key: 'education' | 'certifications' | 'experience', rows: Row[], labels: string[]) => <div className="space-y-3">{rows.map((row, index) => <div key={`${key}-${index}`} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold text-slate-700">{key === 'education' ? 'Education' : key === 'certifications' ? 'Certification' : 'Employment'} #{index + 1}</p><button type="button" onClick={() => removeRow(key, index)} className="text-xs font-semibold text-rose-600"><Trash2 className="inline h-3.5 w-3.5"/> Remove</button></div><div className="grid gap-3 sm:grid-cols-2">{Object.keys(row).map((k, i) => <label key={k} className="block text-xs font-semibold text-slate-700">{labels[i]}<input type={k.toLowerCase().includes('date') || k === 'graduation' ? (k === 'graduation' ? 'number' : 'date') : 'text'} value={row[k]} onChange={(e) => setRow(key, index, k, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"/></label>)}</div></div>)}<button type="button" onClick={() => addRow(key)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-900 px-3 py-2 text-xs font-semibold text-emerald-900"><Plus className="h-3.5 w-3.5"/>Add {key === 'education' ? 'education' : key === 'certifications' ? 'certification' : 'experience'}</button></div>;

  const stepValid = () => {
    if (step === 0) {
      const required = ['fullName', 'phone', 'email', 'gender', 'regionId', 'idNumber'];
      const missing = required.filter((k) => !String(values[k] || '').trim());
      if (missing.length) { toast.error(`Complete required personal details: ${missing.join(', ')}`); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { toast.error('Enter a valid email address'); return false; }
      return true;
    }
    if (step === 8 && (!files.idDocument?.length || !files.cvCompanyProfile?.length || !values.applicantFullName || !values.applicantSignature || !values.declarationDate || !values.declaration)) {
      toast.error('ID document, CV/company profile and signed declaration are required'); return false;
    }
    return true;
  };

  const submit = async () => {
    if (!stepValid()) return;
    const education = (values.education || []).map((row: Row, i: number) => ({ qualification: values[`education_qualification_${i}`] || row.qualification, field: values[`education_field_${i}`] || row.field, institution: values[`education_institution_${i}`] || row.institution, country: values[`education_country_${i}`] || row.country, graduation: values[`education_graduation_${i}`] || row.graduation }));
    const firstEducation = education[0] || {};
    const body = { ...values, education, graduationLevelId: firstEducation.qualification || '', fieldOfStudyId: firstEducation.field || '', institutionName: firstEducation.institution || '', language: { ...(values.language || {}), afaan: values.language_AfaanOromoo || '', amharic: values.language_Amharic || '', english: values.language_English || '', arabic: values.language_Arabic || '', french: values.language_French || '', otherLanguage: values.otherLanguage || '' }, consent: 'true' };
    if (isRegional && user?.regionId) body.regionId = user.regionId;
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => form.append(key, typeof value === 'string' ? value : (JSON.stringify(value) ?? '')));
    form.set('officialFormData', JSON.stringify(body));
    for (const [key, selected] of Object.entries(files)) for (const file of selected) form.append(key, file);
    setSaving(true);
    try {
      await MembersApi.createRegistration(form);
      toast.success('Member record created successfully');
      navigate('/members');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not create member record'); }
    finally { setSaving(false); }
  };

  const currentStep = useMemo(() => {
    switch (step) {
      case 0: return <div className="grid gap-4 sm:grid-cols-2">{select('membershipCategory', 'Membership category', [['Professional','Hospitality Professional'],['Entrepreneur','Hospitality Entrepreneur / Business Owner'],['Corporate','Corporate / Institutional Member'],['Associate','Associate Member']], true)}{field('fullName','Full name', 'text', true)}{select('gender','Gender',[['male','Male'],['female','Female'],['unspecified','Prefer not to say']],true)}{field('dateOfBirth','Date of birth','date')}{field('nationality','Nationality','text',true)}{select('idType','ID type',[['fayda','Fayda'],['passport','Passport'],['kebele','Kebele ID'],['driver','Driver licence']],true)}{field('idNumber','National ID / Fayda / Passport number','text',true)}{field('phone','Primary phone (include country code)','tel',true)}{field('secondaryPhone','Secondary / WhatsApp phone','tel')}{field('email','Email address','email',true)}{select('regionId','Region / City Administration',regions.filter(r=>!isRegional || r.id===user?.regionId).map(r=>[r.id,localized(r.name)] as [string,string]),true)}{field('zoneSubCity','Zone / Sub-city')}{field('woreda','Woreda / Kebele / House number')}{field('town','City / Town')}{field('emergencyContactName','Emergency contact full name')}{field('emergencyRelationship','Relationship to applicant')}{field('emergencyContactPhone','Emergency contact phone','tel')}{field('alternateEmergencyPhone','Alternate emergency phone','tel')}</div>;
      case 1: return <div className="grid gap-4 sm:grid-cols-2">{select('employmentStatus','Employment status',[['employed','Employed'],['self-employed','Self-employed / Entrepreneur'],['freelancer','Freelancer / Consultant'],['job-seeker','Job seeker'],['other','Other']])}{select('occupationType','Occupation type',[['private','Private'],['government','Government'],['other','Other']],true)}{field('organizationName','Organization / business name')}{field('jobTitle','Job title / position')}{field('workplaceLocation','Workplace location')}{field('yearsInCurrentRole','Years in current role','number')}{field('businessTin','Business TIN / registration number')}{field('yearEstablishedEmployees','Year established & number of employees')}{select('sectorId','Industry sector',sectors.map(x=>[x.id,localized(x.name)] as [string,string]),true)}{field('industrySubSectors','Business / industry sub-sector (comma separated)')}{field('professionalCategory','Professional category')}</div>;
      case 2: return <div className="space-y-3">{values.education.map((row: Row, index: number)=><div key={`education-${index}`} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Education #{index+1}</p><button type="button" onClick={()=>removeRow('education',index)} className="text-xs font-semibold text-rose-600"><Trash2 className="inline h-3.5 w-3.5"/> Remove</button></div><div className="grid gap-3 sm:grid-cols-2">{select(`education_qualification_${index}`, 'Qualification level', qualifications.map(q=>[q.id,localized(q.name)] as [string,string]))}{select(`education_field_${index}`, 'Field of study', fields.map(f=>[f.id,localized(f.name)] as [string,string]))}{field(`education_institution_${index}`, 'Institution / university')}{field(`education_country_${index}`, 'Country')}{field(`education_graduation_${index}`, 'Graduation year', 'number')}</div></div>)}<button type="button" onClick={()=>addRow('education')} className="inline-flex items-center gap-1 rounded-lg border border-emerald-900 px-3 py-2 text-xs font-semibold text-emerald-900"><Plus className="h-3.5 w-3.5"/>Add education</button></div>;
      case 3: return rowInputs('certifications', values.certifications, ['Certification / licence name','Issuing body','Issue date','Expiry date']);
      case 4: return <div className="space-y-4">{rowInputs('experience', values.experience, ['Organization / business','Job title','Responsibilities & achievements','Start date','End date','Currently working'])}{field('totalExperienceYears','Total years of hospitality / tourism experience','number')}</div>;
      case 5: return <div className="space-y-4"><div><p className="mb-2 text-xs font-semibold text-slate-700">Languages known</p><div className="flex flex-wrap gap-3">{languageOptions.map(l=><label key={l} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(values.languagesKnown || []).includes(l)} onChange={()=>toggleArray('languagesKnown',l)}/>{l}</label>)}</div></div><div className="grid gap-3 sm:grid-cols-2">{languageOptions.slice(0,5).map(l=>select(`language_${l.replace(/[^a-z]/gi,'')}` ,`${l} proficiency`,[['Basic','Basic'],['Conversational','Conversational'],['Fluent','Fluent'],['Native','Native']]))}</div>{field('otherLanguage','Other language(s)')}{textarea('technicalSkills','Technical & hospitality software skills')}{textarea('coreSkills','Core industry & specialized skills')}</div>;
      case 6: return <div className="space-y-5">{[['areasOfExpertise','Areas of expertise',expertiseOptions],['areasOfInterest','Areas of interest in OHPEA',interestOptions]].map(([key,label,opts])=><div key={key as string}><p className="mb-2 text-xs font-semibold text-slate-700">{label as string}</p><div className="grid gap-2 sm:grid-cols-2">{(opts as string[]).map(item=><label key={item} className="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={(values[key as string] || []).includes(item)} onChange={()=>toggleArray(key as string,item)} className="mt-1"/>{item}</label>)}</div></div>)}</div>;
      case 7: return <div className="space-y-3"><p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Confirm the current approved membership tariff and bank / mobile money account details with the OHPEA Secretariat before collecting payment. Do not rely on unverified fee or account values.</p><div className="grid gap-4 sm:grid-cols-2">{select('paymentMethod','Payment method',[['bank_transfer','Bank deposit / transfer'],['cash','Cash at office'],['mobile_money','Mobile money'],['other','Other']])}{select('bankPlatformUsed','Bank / payment platform',[['CBO','Cooperative Bank of Oromia'],['CBE','Commercial Bank of Ethiopia'],['Awash','Awash Bank'],['Telebirr','Telebirr'],['Other','Other']])}{field('transactionReference','Transaction / receipt reference')}{field('amountPaid','Amount paid (ETB)','number')}{field('paymentDate','Payment date','date')}{textarea('paymentNotes','Payment notes')}</div></div>;
      default: return <div className="space-y-4"><p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">I hereby apply for membership in OHPEA. I certify that the information provided is true and complete, and agree to abide by the Association bylaws, code of ethics and regulations.</p><div className="grid gap-3 sm:grid-cols-2">{upload('passportPhoto','Passport-size photograph')}{upload('idDocument','Copy of National ID / Fayda ID / Passport',true)}{upload('cvCompanyProfile','Updated CV or company profile',true)}{upload('academicCertificates','Academic degrees / TVET certificates',false,true)}{upload('professionalLicensesBusinessRegistration','Professional licences / business registration',false,true)}{upload('paymentProof','Proof of membership fee payment')}</div><div className="grid gap-4 sm:grid-cols-3">{field('applicantFullName','Applicant full name','text',true)}{field('applicantSignature','Applicant signature (type full name)','text',true)}{field('declarationDate','Declaration date','date',true)}</div><label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm"><input type="checkbox" checked={Boolean(values.declaration)} onChange={e=>set('declaration',e.target.checked)} className="mt-1"/><span>I confirm that all information is true and agree to OHPEA membership terms.</span></label></div>;
    }
  }, [step, values, regions, sectors, qualifications, files, isRegional, user]);

  return <div className="mx-auto max-w-5xl space-y-5 pb-10">
    <button type="button" onClick={()=>navigate('/members')} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4"/>Back to members</button>
    <div><h1 className="text-xl font-bold text-slate-900">Add member</h1><p className="mt-1 text-sm text-slate-500">Complete the official OHPEA registration details and attach the supporting documents.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="grid grid-cols-3 gap-2 sm:grid-cols-9">{steps.map((label,i)=><button type="button" key={label} onClick={()=>{if(i<=step)setStep(i);}} className={`rounded-lg px-2 py-2 text-[10px] font-semibold ${i===step?'bg-[#103f34] text-white':i<step?'bg-emerald-50 text-emerald-900':'bg-slate-50 text-slate-500'}`}>{i+1}. {label.split(' ')[0]}</button>)}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500 transition-all" style={{width:`${((step+1)/steps.length)*100}%`}}/></div><div className="mt-4 flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">{steps[step]}</h2><span className="text-xs text-slate-500">Step {step+1} of {steps.length}</span></div><div className="mt-5">{currentStep}</div><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><button type="button" disabled={step===0 || saving} onClick={()=>setStep(x=>Math.max(0,x-1))} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Previous</button>{step<steps.length-1?<button type="button" onClick={()=>{if(stepValid())setStep(x=>Math.min(steps.length-1,x+1));}} className="inline-flex items-center gap-2 rounded-lg bg-[#103f34] px-5 py-2.5 text-xs font-semibold text-white">Next<ArrowRight className="h-3.5 w-3.5"/></button>:<button type="button" disabled={saving} onClick={()=>void submit()} className="inline-flex items-center gap-2 rounded-lg bg-[#103f34] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving?'Saving…':'Create member'}<CheckCircle2 className="h-4 w-4"/></button>}</div></div>
  </div>;
}
