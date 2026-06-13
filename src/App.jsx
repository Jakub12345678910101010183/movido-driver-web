import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zjvozjnbvrtrrpehqdpf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqdm96am5idnJ0cnJwZWhxZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDQ4NjMsImV4cCI6MjA4NDMyMDg2M30.dJE9aE0frdehWcQUGTbeq3-uGypwb6Imbf0rNmhSNNQ'
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

const C = {
  bg: '#0a0a0f', surface: '#111118', card: '#12121a', border: '#1e1e2a',
  primary: '#00d4ff', primaryFaint: 'rgba(0,212,255,0.1)',
  text: '#e8e8f0', textSub: '#8888a0', textMuted: '#55556a',
  success: '#22c55e', successFaint: 'rgba(34,197,94,0.1)',
  warning: '#f59e0b', error: '#ef4444', purple: '#8b5cf6',
}

const STATUS_COLOR = {
  pending: C.warning, assigned: C.purple,
  in_progress: C.primary, completed: C.success, failed: C.error,
}
const STATUS_LABEL = {
  pending: 'Pending', assigned: 'Assigned',
  in_progress: 'In Progress', completed: 'Completed', failed: 'Failed',
}

// ── STYLES ─────────────────────────────────────────────────
const g = {
  app: { minHeight:'100dvh', background:C.bg, color:C.text, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', WebkitFontSmoothing:'antialiased' },
  center: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'24px' },
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', marginBottom:'12px' },
  input: { width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'14px', color:C.text, fontSize:'16px', boxSizing:'border-box', outline:'none' },
  btn: { width:'100%', background:C.primary, border:'none', borderRadius:'10px', padding:'16px', color:C.bg, fontSize:'16px', fontWeight:'700', cursor:'pointer', letterSpacing:'0.5px' },
  label: { color:C.textSub, fontSize:'13px', fontWeight:'500', marginBottom:'6px', display:'block' },
  badge: (status) => ({
    display:'inline-block', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700',
    color: STATUS_COLOR[status] || C.textMuted,
    background: (STATUS_COLOR[status] || C.textMuted) + '22',
    border: `1px solid ${(STATUS_COLOR[status] || C.textMuted)}55`,
  }),
  tab: (active) => ({
    flex:1, padding:'12px 4px 8px', background:'none', border:'none',
    color: active ? C.primary : C.textMuted, fontSize:'10px', fontWeight:active?'700':'500',
    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
    borderTop: active ? `2px solid ${C.primary}` : '2px solid transparent',
  }),
}

// ── ICONS ──────────────────────────────────────────────────
const Icon = ({ name, size=20, color='currentColor' }) => {
  const icons = {
    jobs: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    nav: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polygon points="3,11 22,2 13,21 11,13"/></svg>,
    msg: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    time: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    loc: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    play: <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    send: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    truck: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  }
  return icons[name] || null
}

// ── LOGIN ──────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const login = async () => {
    if (!email || !pass) return
    setLoading(true); setErr('')
    const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass })
    if (error) { setErr('Nieprawidłowy email lub hasło'); setLoading(false) }
    else onLogin()
  }

  return (
    <div style={g.center}>
      <div style={{ textAlign:'center', marginBottom:'40px' }}>
        <div style={{ width:72, height:72, borderRadius:36, background:C.primaryFaint, border:`2px solid ${C.primary}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <span style={{ color:C.primary, fontSize:32, fontWeight:700 }}>M</span>
        </div>
        <div style={{ color:C.text, fontSize:28, fontWeight:700, letterSpacing:8 }}>MOVIDO</div>
        <div style={{ color:C.primary, fontSize:13, fontWeight:600, letterSpacing:6, marginTop:2 }}>DRIVER</div>
      </div>
      <div style={{ width:'100%', maxWidth:380 }}>
        <label style={g.label}>Email</label>
        <input style={{ ...g.input, marginBottom:12 }} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="driver@company.com" />
        <label style={g.label}>Hasło</label>
        <input style={{ ...g.input, marginBottom:err?8:20 }} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&login()} />
        {err && <div style={{ color:C.error, fontSize:13, marginBottom:12 }}>{err}</div>}
        <button style={g.btn} onClick={login} disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </div>
      <div style={{ color:C.textMuted, fontSize:12, marginTop:32 }}>Movido Logistics · Northampton</div>
    </div>
  )
}

// ── JOBS SCREEN ────────────────────────────────────────────
function Jobs({ userId }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await sb.from('jobs').select('*')
      .eq('driver_id', userId)
      .in('status', ['pending','assigned','in_progress'])
      .order('created_at')
    setJobs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [userId])

  const startJob = async (id) => {
    if (!confirm('Rozpocząć zlecenie?')) return
    await sb.from('jobs').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', id)
    fetch()
  }

  const completeJob = async (id) => {
    if (!confirm('Oznaczyć jako dostarczone?')) return
    await sb.from('jobs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id)
    fetch()
  }

  const openMaps = (addr) => window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`)

  if (loading) return <div style={{ textAlign:'center', paddingTop:80, color:C.textMuted }}>Ładowanie zleceń...</div>

  const inProg = jobs.filter(j=>j.status==='in_progress')
  const rest = jobs.filter(j=>j.status!=='in_progress')

  return (
    <div style={{ padding:'16px' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:22, fontWeight:700 }}>Moje Zlecenia</div>
        <div style={{ color:C.textMuted, fontSize:13, marginTop:2 }}>{jobs.length} zleceń dziś</div>
      </div>

      {jobs.length === 0 && (
        <div style={{ textAlign:'center', paddingTop:60, color:C.textMuted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
          <div>Brak aktywnych zleceń</div>
        </div>
      )}

      {[...inProg, ...rest].map(job => {
        const sc = STATUS_COLOR[job.status]
        return (
          <div key={job.id} style={{ ...g.card, borderColor: job.status==='in_progress' ? C.primary+'44' : C.border }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ color:C.primary, fontSize:12, fontWeight:700, fontFamily:'monospace' }}>{job.reference}</div>
                <div style={{ fontSize:17, fontWeight:600, marginTop:2 }}>{job.customer}</div>
              </div>
              <span style={g.badge(job.status)}>{STATUS_LABEL[job.status]}</span>
            </div>

            <div style={{ color:C.textSub, fontSize:13, marginBottom:8, display:'flex', alignItems:'center', gap:4 }}>
              <Icon name="loc" size={13} color={C.textMuted} />
              {job.address || 'Brak adresu'}
            </div>

            {job.weight_kg && (
              <div style={{ color:C.textMuted, fontSize:12, marginBottom:10 }}>📦 {job.weight_kg}kg</div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              {(job.status==='pending'||job.status==='assigned') && (
                <button onClick={()=>startJob(job.id)} style={{ ...g.btn, padding:'10px', fontSize:14 }}>
                  ▶ Rozpocznij
                </button>
              )}
              {job.status==='in_progress' && (<>
                <button onClick={()=>openMaps(job.address)} style={{ flex:1, background:C.primaryFaint, border:`1px solid ${C.primary}`, borderRadius:10, padding:'10px', color:C.primary, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  🧭 Nawiguj
                </button>
                <button onClick={()=>completeJob(job.id)} style={{ flex:1, background:C.successFaint, border:`1px solid ${C.success}`, borderRadius:10, padding:'10px', color:C.success, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  ✅ POD
                </button>
              </>)}
            </div>
          </div>
        )
      })}

      <button onClick={fetch} style={{ ...g.btn, background:'transparent', border:`1px solid ${C.border}`, color:C.textSub, marginTop:4, fontSize:14 }}>
        🔄 Odśwież
      </button>
    </div>
  )
}

// ── MESSENGER ──────────────────────────────────────────────
function Messenger({ userId }) {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottom = useRef(null)

  const fetchMsgs = async () => {
    const { data } = await sb.from('messages').select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at')
    setMsgs(data || [])
    setLoading(false)
    setTimeout(() => bottom.current?.scrollIntoView({ behavior:'smooth' }), 100)
  }

  useEffect(() => {
    fetchMsgs()
    const ch = sb.channel('msgs').on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, fetchMsgs).subscribe()
    return () => sb.removeChannel(ch)
  }, [userId])

  const send = async () => {
    if (!text.trim()) return
    await sb.from('messages').insert({ sender_id: userId, content: text.trim(), message_type: 'text' })
    setText('')
    fetchMsgs()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100dvh - 130px)' }}>
      <div style={{ padding:'16px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:18, fontWeight:700 }}>Wiadomości</div>
        <div style={{ color:C.textMuted, fontSize:13 }}>Dispatch</div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:8 }}>
        {loading && <div style={{ color:C.textMuted, textAlign:'center' }}>Ładowanie...</div>}
        {msgs.map(m => {
          const mine = m.sender_id === userId
          return (
            <div key={m.id} style={{ display:'flex', justifyContent: mine?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'75%', background: mine?C.primary:C.card, color: mine?C.bg:C.text, borderRadius: mine?'16px 16px 4px 16px':'16px 16px 16px 4px', padding:'10px 14px', fontSize:14, border: mine?'none':`1px solid ${C.border}` }}>
                {m.content}
                <div style={{ fontSize:10, marginTop:4, opacity:0.6, textAlign:'right' }}>
                  {new Date(m.created_at).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottom} />
      </div>
      <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.border}`, display:'flex', gap:8 }}>
        <input style={{ ...g.input, flex:1 }} value={text} onChange={e=>setText(e.target.value)} placeholder="Napisz wiadomość..." onKeyDown={e=>e.key==='Enter'&&send()} />
        <button onClick={send} style={{ background:C.primary, border:'none', borderRadius:10, padding:'0 16px', cursor:'pointer' }}>
          <Icon name="send" size={18} color={C.bg} />
        </button>
      </div>
    </div>
  )
}

// ── WTD TIMER ──────────────────────────────────────────────
function WTD() {
  const [activity, setActivity] = useState('resting')
  const [times, setTimes] = useState({ driving:0, working:0, resting:0 })
  const [running, setRunning] = useState(false)
  const interval = useRef(null)

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setTimes(t => ({ ...t, [activity]: t[activity]+1 }))
      }, 1000)
    }
    return () => clearInterval(interval.current)
  }, [running, activity])

  const fmt = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const pct = (val, max) => Math.min(100, (val/max)*100)

  const limits = { driving: 9*3600, working: 13*3600, resting: 11*3600 }

  return (
    <div style={{ padding:16 }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:22, fontWeight:700 }}>Czas Pracy (WTD)</div>
        <div style={{ color:C.textMuted, fontSize:13 }}>Limity UK Working Time Directive</div>
      </div>

      {['driving','working','resting'].map(act => {
        const val = times[act], max = limits[act]
        const p = pct(val, max)
        const col = p>90 ? C.error : p>75 ? C.warning : C.success
        const labels = { driving:'🚛 Jazda', working:'💼 Praca', resting:'😴 Odpoczynek' }
        return (
          <div key={act} style={g.card}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontWeight:600 }}>{labels[act]}</span>
              <span style={{ color:col, fontFamily:'monospace', fontWeight:700 }}>{fmt(val)}</span>
            </div>
            <div style={{ background:C.surface, borderRadius:4, height:6, overflow:'hidden' }}>
              <div style={{ width:`${p}%`, background:col, height:'100%', transition:'width 0.3s', borderRadius:4 }} />
            </div>
            <div style={{ color:C.textMuted, fontSize:11, marginTop:4 }}>
              Limit: {fmt(max)} · Pozostało: {fmt(Math.max(0,max-val))}
            </div>
          </div>
        )
      })}

      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {['driving','working','resting'].map(act => {
          const labels = { driving:'🚛 Jazda', working:'💼 Praca', resting:'😴 Odpoczynek' }
          const active = activity===act
          return (
            <button key={act} onClick={()=>setActivity(act)} style={{ flex:1, background: active?C.primaryFaint:C.surface, border:`1px solid ${active?C.primary:C.border}`, borderRadius:8, padding:'10px 4px', color: active?C.primary:C.textSub, fontSize:11, fontWeight:active?700:400, cursor:'pointer' }}>
              {labels[act].split(' ')[0]}<br/><span style={{fontSize:9}}>{labels[act].split(' ')[1]}</span>
            </button>
          )
        })}
      </div>

      <button onClick={()=>setRunning(r=>!r)} style={{ ...g.btn, background: running?C.error:C.success }}>
        {running ? '⏹ Zatrzymaj' : '▶ Start'}
      </button>
    </div>
  )
}

// ── PROFILE ────────────────────────────────────────────────
function Profile({ user, onLogout }) {
  return (
    <div style={{ padding:16 }}>
      <div style={{ textAlign:'center', padding:'32px 0 24px' }}>
        <div style={{ width:72, height:72, borderRadius:36, background:C.primaryFaint, border:`2px solid ${C.primary}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:28 }}>
          🧑‍✈️
        </div>
        <div style={{ fontSize:18, fontWeight:700 }}>{user?.email?.split('@')[0] || 'Driver'}</div>
        <div style={{ color:C.textMuted, fontSize:13 }}>{user?.email}</div>
      </div>

      <div style={g.card}>
        <div style={{ color:C.textMuted, fontSize:12, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Informacje</div>
        <div style={{ color:C.textSub, fontSize:14, lineHeight:1.8 }}>
          <div>🏢 Movido Logistics</div>
          <div>📍 Northampton, UK</div>
          <div>🚛 HGV Driver</div>
        </div>
      </div>

      <div style={g.card}>
        <div style={{ color:C.textMuted, fontSize:12, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Aplikacja</div>
        <div style={{ color:C.textSub, fontSize:13 }}>Movido Driver v1.0.0</div>
      </div>

      <button onClick={onLogout} style={{ ...g.btn, background:'transparent', border:`1px solid ${C.error}44`, color:C.error, marginTop:8 }}>
        Wyloguj się
      </button>
    </div>
  )
}

// ── APP ────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('jobs')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => { setSession(session); setChecking(false) })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => { setSession(s); setChecking(false) })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) return (
    <div style={{ ...g.center, gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:24, background:C.primaryFaint, border:`2px solid ${C.primary}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:C.primary, fontSize:22, fontWeight:700 }}>M</span>
      </div>
      <div style={{ color:C.textMuted }}>Ładowanie...</div>
    </div>
  )

  if (!session) return <Login onLogin={() => {}} />

  const tabs = [
    { id:'jobs', label:'Zlecenia', icon:'jobs' },
    { id:'messenger', label:'Chat', icon:'msg' },
    { id:'wtd', label:'WTD', icon:'time' },
    { id:'profile', label:'Profil', icon:'user' },
  ]

  return (
    <div style={g.app}>
      <div style={{ paddingBottom:70 }}>
        {tab==='jobs' && <Jobs userId={session.user.id} />}
        {tab==='messenger' && <Messenger userId={session.user.id} />}
        {tab==='wtd' && <WTD />}
        {tab==='profile' && <Profile user={session.user} onLogout={() => sb.auth.signOut()} />}
      </div>

      {/* Tab Bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, display:'flex', paddingBottom:'env(safe-area-inset-bottom)' }}>
        {tabs.map(t => (
          <button key={t.id} style={g.tab(tab===t.id)} onClick={()=>setTab(t.id)}>
            <Icon name={t.icon} size={20} color={tab===t.id ? C.primary : C.textMuted} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
