import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Vehicle = 'truck' | 'van' | 'car' | 'scooter';

function useCount(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

const Logo = () => <span className="argo-mark" aria-hidden="true" />;

function RoadScene() {
  const traffic: { type: Vehicle; lane: number; duration: number; begin: string }[] = [
    { type: 'truck', lane: 120, duration: 8, begin: '0s' }, { type: 'van', lane: 120, duration: 5.4, begin: '-2.8s' },
    { type: 'car', lane: 120, duration: 6.5, begin: '-4.1s' }, { type: 'scooter', lane: 120, duration: 4.8, begin: '-1.4s' },
    { type: 'van', lane: 180, duration: 7, begin: '-4s' }, { type: 'car', lane: 180, duration: 5.1, begin: '-.6s' },
    { type: 'truck', lane: 180, duration: 8.7, begin: '-6s' }, { type: 'scooter', lane: 180, duration: 4.7, begin: '-3.4s' },
  ];
  return <div className="road-scene" aria-label="Live fleet traffic visualization">
    <svg viewBox="0 0 640 300" preserveAspectRatio="none" role="img">
      <defs>
        <filter id="softShadow"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dy="2"/><feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <g id="truck" filter="url(#softShadow)"><ellipse cx="32" cy="17" rx="29" ry="3" fill="#050609" opacity=".45"/><rect x="0" y="-12" width="41" height="20" rx="2" fill="#e9e9df"/><path d="M42-7h12l6 7v8H42z" fill="#59616a"/><path d="M47-6h6l3 5h-9z" fill="#27404c"/><path d="M8-8l4-6 4 6z" fill="#3fde79"/><text x="17" y="1" fill="#314238" fontSize="5" fontWeight="700">ARGO</text><circle cx="13" cy="10" r="5" fill="#20262d"/><circle cx="13" cy="10" r="2" fill="#b7bec1"/><circle cx="49" cy="10" r="5" fill="#20262d"/><circle cx="49" cy="10" r="2" fill="#b7bec1"/><circle cx="32" cy="10" r="5" fill="#20262d"/><circle cx="32" cy="10" r="2" fill="#b7bec1"/></g>
        <g id="van" filter="url(#softShadow)"><ellipse cx="22" cy="15" rx="21" ry="3" fill="#050609" opacity=".45"/><path d="M1-9h31l8 8v9H1z" fill="#dce1d6"/><path d="M28-7h5l5 6h-10z" fill="#315061"/><path d="M8-6l3-5 3 5z" fill="#3fde79"/><text x="15" y="0" fill="#334438" fontSize="4.5" fontWeight="700">ARGO</text><circle cx="10" cy="10" r="5" fill="#20262d"/><circle cx="10" cy="10" r="2" fill="#bec4c3"/><circle cx="31" cy="10" r="5" fill="#20262d"/><circle cx="31" cy="10" r="2" fill="#bec4c3"/></g>
        <g id="car" filter="url(#softShadow)"><ellipse cx="20" cy="13" rx="19" ry="3" fill="#050609" opacity=".4"/><path d="M1 3l4-9h23l8 9v5H1z" fill="#8d969e"/><path d="M9-5h15l5 6H5z" fill="#354956"/><circle cx="9" cy="9" r="4" fill="#1c2025"/><circle cx="29" cy="9" r="4" fill="#1c2025"/><path d="M34 2h2v3h-2z" fill="#f2b441"/></g>
        <g id="scooter" filter="url(#softShadow)"><ellipse cx="16" cy="12" rx="15" ry="2.5" fill="#050609" opacity=".4"/><circle cx="7" cy="8" r="4" fill="#1d2229"/><circle cx="26" cy="8" r="4" fill="#1d2229"/><path d="M7 5h15l3-10h2l-2 11H14l-4-5z" fill="#9fa7a6"/><circle cx="17" cy="-6" r="5" fill="#b8a28e"/><path d="M14-2h8l4 6H13z" fill="#4d8b62"/><circle cx="23" cy="0" r="2" fill="#3fde79"/></g>
      </defs>
      <rect x="0" y="87" width="640" height="126" fill="#2a2e34"/><rect x="0" y="92" width="640" height="8" fill="#545a60"/><rect x="0" y="200" width="640" height="8" fill="#545a60"/><path d="M0 105H640M0 195H640" stroke="#e4e4d8" strokeWidth="1.5" opacity=".8"/><path d="M0 150H640" stroke="#d9dcd8" strokeWidth="2" strokeDasharray="18 16" opacity=".9"/>
      {[['165','HUB 01','#3fde79','0s'], ['360','HUB 02','#4fc3e8','-.8s'], ['530','HUB 03','#f2b441','-1.6s']].map(([x, label, color, begin]) => <g key={x}><path d={`M${x} 74v145`} stroke={color} strokeWidth="1" strokeDasharray="3 6" opacity=".5"/><text x={x} y="66" textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace">{label}</text><circle cx={x} cy="150" r="4" fill="none" stroke={color}><animate attributeName="r" values="3;11;3" dur="2.4s" begin={begin} repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="2.4s" begin={begin} repeatCount="indefinite"/></circle></g>)}
      {traffic.map((vehicle, index) => <use key={index} href={`#${vehicle.type}`} transform={`translate(-70 ${vehicle.lane})`}><animateMotion path="M-10 0 H720" dur={`${vehicle.duration}s`} begin={vehicle.begin} repeatCount="indefinite" /></use>)}
    </svg>
  </div>;
}

function Ticker() {
  const items = ['WA-4823K departed Warehouse 3', '#AB-9123 delivered · POD captured', 'Route 14 is ahead of schedule', 'DL-7550 checked in at HUB 02', '9 priority deliveries in transit'];
  return <div className="ticker"><div className="ticker-track">{[...items, items[0]].map((item, i) => <p key={i}><span>{item.split(' ').slice(0, 1)}</span> {item.split(' ').slice(1).join(' ')}</p>)}</div></div>;
}

function Stats() {
  const vehicles = useCount(128, 1450), rate = useCount(96, 1550), km = useCount(1840, 1600);
  return <div className="stage-stats"><div><strong>{vehicles}</strong><small>Active vehicles</small></div><div><strong>{rate}%</strong><small>On-time rate</small></div><div><strong>{km.toLocaleString()}</strong><small>km tracked today</small></div></div>;
}

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status !== 'idle') return;
    setError(null);
    setStatus('loading');
    try {
      await login(email.trim(), password);
      setStatus('success');
      // Brief success confirmation before entering the app.
      window.setTimeout(() => navigate('/dashboard'), 650);
    } catch (err: any) {
      setStatus('idle');
      setError(err?.message || 'Invalid email or password');
    }
  };

  return <main className="argo-login"><section className="argo-card">
    <aside className="argo-stage">
      <div className="stage-intro"><div className="brand-row"><div className="wordmark"><Logo />Argo<span>Logics</span></div><div className="live-chip"><i /> LIVE FLEET FEED</div></div><h1>Every vehicle, every destination, one live view.</h1><p>Sign in to track your fleet across every route in real time and keep each delivery on schedule.</p></div>
      <RoadScene /><Ticker /><Stats />
    </aside>
    <section className="login-panel"><div className="form-wrap">
      <div className="eyebrow"><i /> Fleet management system</div><h2>Welcome back</h2><p className="new-user">Sign in to your ArgoLogics fleet workspace.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form onSubmit={submit}>
        <label>Work email<input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <div className="form-options"><label className="remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in</label><a href="#forgot">Forgot password?</a></div>
        <button className={`submit-button ${status}`} type="submit" disabled={status !== 'idle'}>{status === 'loading' ? <b className="spinner" /> : status === 'success' ? <><b className="check">✓</b> Signed in</> : 'Sign in to dashboard'}</button>
      </form>
      <div className="divider"><span>or continue with</span></div><div className="providers"><button type="button">Single sign-on</button><button type="button"><b className="ms-logo">▦</b> Microsoft</button></div><p className="security">Protected by org-level SSO and MFA <b>·</b> <a href="#help">Help</a></p>
    </div></section>
  </section><style>{styles}</style></main>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
.argo-login{--ink:#0f1115;--map:#15171d;--map2:#1b1e24;--green:#3fde79;--off:#f5f6f2;--line:#e6e7e1;--text:#14161a;--muted:#6b7280;min-height:100vh;background:#0f1115;width:100vw;margin:0;padding:0;font-family:Inter,Arial,sans-serif;color:var(--text)}.argo-card{width:100%;min-height:100vh;height:100vh;border-radius:0;display:grid;grid-template-columns:1.25fr 1fr;border-radius:26px;overflow:hidden;box-shadow:0 35px 90px #0008;animation:card-in .7s cubic-bezier(.2,.8,.2,1) both}.argo-stage{min-width:0;padding:31px 34px 27px;color:#f2f3f0;background:linear-gradient(160deg,var(--map),var(--map2));display:flex;flex-direction:column;gap:16px}.stage-intro{min-height:264px}.brand-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:45px}.wordmark{display:flex;align-items:center;gap:8px;font-size:19px;font-weight:700;letter-spacing:-.8px}.wordmark span{color:var(--green)}.argo-mark{width:17px;height:16px;display:inline-block;background:var(--green);clip-path:polygon(50% 0,100% 100%,0 100%);animation:glow 2.2s infinite}.live-chip,.eyebrow{font:500 10px 'JetBrains Mono',monospace;letter-spacing:.35px}.live-chip{display:flex;align-items:center;gap:7px;border:1px solid #ffffff18;border-radius:999px;padding:7px 9px;color:#b5bbb9;background:#11131880}.live-chip i,.eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;animation:blink 1.3s infinite}.stage-intro h1{font-size:37px;line-height:1.12;letter-spacing:-1.65px;font-weight:600;max-width:475px;margin:0 0 16px;animation:rise .65s .1s both}.stage-intro p{color:#969da5;font-size:15px;line-height:1.65;max-width:425px;animation:rise .65s .25s both}.road-scene{flex:1;min-height:210px;position:relative;overflow:hidden;border-radius:14px;background-color:#171a20;background-image:linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px);background-size:30px 30px;animation:grid 17s linear infinite}.road-scene svg{position:absolute;inset:0;width:100%;height:100%}.ticker{height:31px;overflow:hidden;border:1px solid #ffffff12;border-radius:8px;background:#0e1014a0;font:11px 'JetBrains Mono',monospace;color:#a3aaa9}.ticker-track{animation:ticker 17.5s steps(5,end) infinite}.ticker p{height:29px;line-height:29px;padding-left:12px;white-space:nowrap}.ticker span{font-weight:700;color:var(--green)}.stage-stats{display:grid;grid-template-columns:repeat(3,1fr);padding-top:3px}.stage-stats strong{font-size:22px;letter-spacing:-.5px;display:block;font-variant-numeric:tabular-nums}.stage-stats small{display:block;margin-top:4px;font-size:10px;color:#8a9098}.login-panel{background:var(--off);display:grid;place-items:center;padding:44px}.form-wrap{width:min(440px,100%)}.eyebrow{width:max-content;border-radius:99px;padding:7px 9px;background:#dff7e8;color:#1b6b3d;display:flex;gap:7px;align-items:center;animation:rise .55s .05s both}.form-wrap h2{font-size:41px;letter-spacing:-1.4px;margin:21px 0 7px;animation:rise .55s .11s both}.new-user{font-size:15px;color:var(--muted);margin-bottom:31px;animation:rise .55s .17s both}.form-wrap a{color:#1b8045;font-weight:600}.form-error{background:#fdecec;border:1px solid #f4c4c4;color:#b5352f;font-size:12.5px;font-weight:500;padding:10px 12px;border-radius:8px;margin-bottom:16px;animation:rise .35s both}.form-wrap form{animation:rise .55s .23s both}.form-wrap label{font-size:16px;font-weight:600;display:block;margin-bottom:18px}.form-wrap input{width:100%;height:46px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:0 13px;margin-top:8px;font:14px Inter;color:var(--text);outline:none;transition:.2s}.form-wrap input:focus{border-color:#3fde79;box-shadow:0 0 0 3px #3fde7926}.password-field{position:relative}.password-field input{padding-right:52px}.password-field button{position:absolute;right:7px;top:14px;border:0;background:transparent;color:#397d51;font-size:12px;font-weight:700;cursor:pointer}.form-options{display:flex;justify-content:space-between;align-items:center;margin:-1px 0 22px}.form-options .remember{margin:0;font-size:12px;font-weight:500;color:#555b61;display:flex;align-items:center;gap:7px}.remember input{height:14px;width:14px;margin:0;accent-color:#3fde79}.form-options a{font-size:12px}.submit-button{width:100%;height:48px;border:0;border-radius:8px;background:var(--green);color:#13331f;font-weight:700;font-size:14px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center}.submit-button:hover:not(:disabled){background:#59e78b;transform:translateY(-1px)}.submit-button:disabled{cursor:default}.submit-button.success{background:#1b6b3d;color:white}.spinner{width:17px;height:17px;border:2px solid #214e2f;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin .8s linear infinite}.check{font-size:17px;margin-right:5px}.divider{display:flex;align-items:center;gap:11px;margin:27px 0 18px;color:#929792;font-size:11px}.divider:before,.divider:after{content:'';height:1px;background:#dedfd9;flex:1}.providers{display:grid;grid-template-columns:1fr 1fr;gap:9px}.providers button{height:40px;background:#fff;border:1px solid var(--line);border-radius:8px;font-size:11px;font-weight:600;color:#35393c;cursor:pointer}.ms-logo{font-size:15px;color:#2475c5;margin-right:4px}.security{text-align:center;font-size:10px;line-height:1.5;color:#8a9090;margin-top:28px;animation:rise .55s .35s both}.security b{color:#aeb2ae;margin:0 3px}@keyframes card-in{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes glow{50%{filter:brightness(1.5);box-shadow:0 0 12px #3fde79}}@keyframes blink{50%{opacity:.25}}@keyframes grid{to{background-position:30px 30px}}@keyframes ticker{to{transform:translateY(-145px)}}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:900px){.argo-login{padding:0}.argo-card{min-height:100vh;border-radius:0;grid-template-columns:1fr}.argo-stage{display:none}.login-panel{min-height:100vh;padding:28px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
`;
