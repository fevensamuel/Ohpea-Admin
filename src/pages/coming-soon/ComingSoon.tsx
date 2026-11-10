import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface ModuleInfo {
  title: string;
  phase: string;
  quarter: string;
  description: string;
  features: string[];
}

const MODULES_MAP: Record<string, ModuleInfo> = {
  sms: {
    title: 'SMS Broadcast Campaigns & Reminders',
    phase: 'Phase 2 / 3',
    quarter: 'Q1 2027',
    description:
      'Direct SMS broadcasting with template tags ({{fullName}}, {{memberNo}}), automated payment reminders, and regional telecom gateway integration.',
    features: [
      'Personalized SMS merging with Afaan Oromoo & Amharic scripts',
      'Automated dues renewal reminders via Siinqee Bank & Telebirr',
      'Audience segmentation builder by regional cluster & membership status',
      'Carrier delivery tracking & real-time balance replenishment',
    ],
  },
  jobs: {
    title: 'Hospitality & Tourism Talent Bridge',
    phase: 'Phase 4',
    quarter: 'Q2 2027',
    description:
      'Verified job matching platform connecting hotels, safari lodges, and eco-tours with accredited OHPEA professionals.',
    features: [
      'Direct employer recruitment portal for GM, Chef, and Guide roles',
      'Automated credential check with accredited university databases',
      'Internship & seasonal event staffing for conventions and summits',
      'Verified salary benchmarks across Oromia tourism destinations',
    ],
  },
  b2b: {
    title: 'B2B Hospitality Marketplace',
    phase: 'Phase 4',
    quarter: 'Q3 2027',
    description:
      'Verified supplier procurement hub for food & beverage wholesale, resort equipment, linen, and sustainable eco-lodge supplies.',
    features: [
      'Direct bulk purchasing agreements with certified Oromia farmers',
      'Verified equipment suppliers with member discount privileges',
      'Standardized hotel linen, amenities & eco-packaging tenders',
    ],
  },
  investments: {
    title: 'Tourism Investment Bridge',
    phase: 'Phase 4',
    quarter: 'Q3 2027',
    description:
      'Facilitating private capital investments in eco-lodges, crater lake resorts, and heritage sites across Oromia.',
    features: [
      'Bankable project dossiers for Wenchi, Bale, and Bishoftu corridors',
      'One-stop licensing liaison with Oromia Investment Commission',
      'Feasibility studies and community benefit equity frameworks',
    ],
  },
  resources: {
    title: 'Research & Study Repository',
    phase: 'Phase 4',
    quarter: 'Q2 2027',
    description:
      'Academic repository of tourism studies, guest satisfaction surveys, and environmental impact assessments.',
    features: [
      'White papers co-published with Jimma, Wollega, and Hawassa Universities',
      'Tourism statistical yearbooks for regional decision-makers',
      'Ecotourism environmental carrying capacity assessments',
    ],
  },
  international: {
    title: 'International Relations & Global Partnerships',
    phase: 'Phase 4',
    quarter: 'Q4 2027',
    description:
      'Global affiliations with UN Tourism (UNWTO), African Tourism Board, and foreign sister hospitality associations.',
    features: [
      'International accreditation alignment (AHLA, City & Guilds)',
      'Cross-border destination exchange programs',
      'Expatriate guest chef & sommelier masterclass series',
    ],
  },
  translations: {
    title: 'Multilingual Translation CMS (Arabic & French)',
    phase: 'Phase 3',
    quarter: 'Q1 2027',
    description:
      'Expansion of public announcements to Arabic (RTL) and French upon completion of database migrations.',
    features: [
      'RTL bidirectional editor for Arabic Middle East tourism outreach',
      'French language portal for Francophone African delegations',
      'AI-assisted professional hospitality terminology translation memory',
    ],
  },
};

export function ComingSoon() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleKey = searchParams.get('module') || 'sms';
  const info = MODULES_MAP[moduleKey] || {
    title: 'Future Phase Enterprise Module',
    phase: 'Roadmap Milestone',
    quarter: '2027',
    description: 'This feature is currently scheduled in the OHPEA system development roadmap.',
    features: ['High-throughput cloud architecture', 'Role-based access governance', 'Audited compliance'],
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Previous Screen</span>
      </button>

      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center relative overflow-hidden">
        {/* Background glow badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200/80 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F1E3B8] text-[#0B3D2E] border border-[#C9A24A]/40 mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>{info.phase} · Planned {info.quarter}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 max-w-xl mx-auto">
          {info.title}
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {info.description}
        </p>

        {/* Planned Capabilities Box */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
            Planned Capabilities for this Module
          </h2>
          <ul className="space-y-2 text-xs text-slate-700">
            {info.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
