import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { ApiError } from '@/types/api';
import { Eye, EyeOff, Lock, User, ShieldCheck, ArrowRight, Landmark } from 'lucide-react';

export function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});
    if (!identifier.trim()) {
      setFieldErrors((prev) => ({ ...prev, identifier: 'Please enter your username or email.' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Please enter your password.' }));
      return;
    }
    try {
      setLoading(true);
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(err.fields);
        else setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to connect to the login server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f7f5ee] px-4 py-8 sm:px-8 lg:px-12 flex items-center justify-center">
      <div className="w-full max-w-6xl min-h-[min(760px,calc(100vh-4rem))] grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] overflow-hidden rounded-[28px] border border-[#e2e4d9] bg-white shadow-[0_24px_80px_rgba(15,55,39,.12)]">
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#063d2d] p-12 xl:p-16 text-white">
          <div className="absolute inset-0 opacity-[.12]" aria-hidden="true">
            <div className="absolute -right-28 -top-24 h-[520px] w-[520px] rounded-full border border-[#d8ae36]" />
            <div className="absolute -right-8 top-0 h-[380px] w-[380px] rounded-full border border-[#d8ae36]" />
            <div className="absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full border border-white" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_48%,rgba(216,174,54,.13)_48.2%,transparent_48.5%)]" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ead9a8] bg-[#d8ae36] text-lg font-extrabold tracking-tight text-[#063d2d]">OH</div>
            <div><p className="text-lg font-bold tracking-[.16em] text-white">OHPEA</p><p className="mt-0.5 text-[10px] font-medium tracking-wide text-[#e7d39b]">Oromia Hospitality &amp; Tourism Professionals</p></div>
          </div>
          <div className="relative z-10 max-w-xl py-12">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8ae36]/40 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-[#f0d98f]"><ShieldCheck className="h-3.5 w-3.5" /> Official administration portal</span>
            <h1 className="font-serif text-4xl font-medium leading-[1.12] tracking-tight xl:text-5xl">A stronger professional community, built together.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/75">Manage membership applications, professional records, contributions and association activities from one secure workspace.</p>
            <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#e7c86c]"><Landmark className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-white">Oromia, Ethiopia</p><p className="mt-1 text-[10px] text-white/55">Professional excellence in hospitality and tourism</p></div></div>
          </div>
          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-[10px] text-white/50"><span>OHPEA Administration</span><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#d8ae36]" /> Secure access</span></div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063d2d] text-sm font-extrabold text-[#e7c86c]">OH</div><div><p className="text-sm font-bold tracking-[.12em] text-[#063d2d]">OHPEA</p><p className="text-[10px] text-[#68746b]">Administration portal</p></div></div>
            <div className="mb-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#987a2b]">Welcome back</p><h2 className="font-serif text-3xl font-medium tracking-tight text-[#18251f] sm:text-4xl">Sign in to your workspace</h2><p className="mt-3 text-sm leading-6 text-[#68746b]">Enter your administrator credentials to continue.</p></div>
            {errorMessage && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{errorMessage}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label htmlFor="admin-identifier" className="mb-2 block text-xs font-semibold text-[#35463f]">Username or email address</label><div className="relative"><User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829087]" /><input id="admin-identifier" type="text" value={identifier} onChange={(e) => { setIdentifier(e.target.value); if (fieldErrors.identifier || fieldErrors.usernameOrEmail) setFieldErrors((prev) => ({ ...prev, identifier: '', usernameOrEmail: '' })); }} placeholder="Enter your username or email" autoComplete="username" aria-invalid={Boolean(fieldErrors.identifier || fieldErrors.usernameOrEmail)} className="h-12 w-full rounded-xl border border-[#dfe4dc] bg-[#fbfcf9] pl-11 pr-4 text-sm text-[#203a32] placeholder:text-[#a1aaa3] transition focus:border-[#246b55] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#246b55]/10" /></div>{(fieldErrors.identifier || fieldErrors.usernameOrEmail) && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.identifier || fieldErrors.usernameOrEmail}</p>}</div>
              <div><div className="mb-2 flex items-center justify-between"><label htmlFor="admin-password" className="text-xs font-semibold text-[#35463f]">Password</label><button type="button" onClick={() => setShowPassword((show) => !show)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#68746b] transition hover:text-[#063d2d]">{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{showPassword ? 'Hide' : 'Show'}</button></div><div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829087]" /><input id="admin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' })); }} placeholder="Enter your password" autoComplete="current-password" aria-invalid={Boolean(fieldErrors.password)} className="h-12 w-full rounded-xl border border-[#dfe4dc] bg-[#fbfcf9] pl-11 pr-12 text-sm text-[#203a32] placeholder:text-[#a1aaa3] transition focus:border-[#246b55] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#246b55]/10" /></div>{fieldErrors.password && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>}</div>
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#68746b]"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-[#cbd4ca] accent-[#063d2d] focus:ring-[#246b55]" />Remember this station</label>
              <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#063d2d] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(6,61,45,.16)] transition hover:-translate-y-0.5 hover:bg-[#14573f] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>Sign in securely <ArrowRight className="h-4 w-4 text-[#e7c86c]" /></>}</button>
            </form>
            <div className="mt-8 border-t border-[#e9ece5] pt-5 text-center"><p className="text-[11px] leading-5 text-[#8a958d]">Need access or a password reset? Contact your system administrator.</p><p className="mt-4 text-[10px] font-medium tracking-wide text-[#a2aaa3]">© OHPEA · Oromia, Ethiopia</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
