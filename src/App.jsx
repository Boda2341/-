import { useState } from 'react'
import './App.css'

async function askGemini(mode, prompt, context = '') {
  const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, prompt, context }) })
  if (!response.ok) throw new Error('AI request failed')
  return response.json()
}

const initialHabits = [
  { id: 1, title: 'شرب 2 لتر من الماء', time: '08:00 ص', category: 'صحة', streak: 5, done: true },
  { id: 2, title: 'قراءة صفحتين من القرآن أو كتاب', time: '09:00 م', category: 'عقل', streak: 3, done: false },
  { id: 3, title: 'ممارسة الرياضة لمدة 20 دقيقة', time: '05:00 م', category: 'بدن', streak: 0, done: false },
]

export default function App() {
  const [tab, setTab] = useState('home')
  const [habits, setHabits] = useState(initialHabits)
  const [profile, setProfile] = useState({ xp: 320, coins: 150, level: 3, freezes: 2 })
  const [modal, setModal] = useState(false)
  const [mode, setMode] = useState('manual')
  const [form, setForm] = useState({ title: '', time: '08:00 ص', category: 'صحة' })
  const [aiPrompt, setAiPrompt] = useState('')
  const [messages, setMessages] = useState([{ sender: 'coach', text: 'أهلاً بك يا صديقي! كيف أساعدك اليوم في تنظيم روتينك؟' }])
  const [coachInput, setCoachInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 3000) }
  const completed = habits.filter((habit) => habit.done).length

  const toggle = (id) => {
    setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, done: !habit.done, streak: Math.max(0, habit.streak + (habit.done ? -1 : 1)) } : habit))
    const habit = habits.find((item) => item.id === id)
    if (habit && !habit.done) setProfile((current) => ({ ...current, xp: current.xp + 25, coins: current.coins + 10 }))
    notify(habit?.done ? 'تم إلغاء إنجاز العادة' : 'أحسنت! حصلت على 25 XP و10 عملات')
  }

  const addManual = (event) => {
    event.preventDefault(); if (!form.title.trim()) return
    setHabits((current) => [{ ...form, id: Date.now(), streak: 0, done: false }, ...current])
    setForm({ title: '', time: '08:00 ص', category: 'صحة' }); setModal(false); notify('تمت إضافة العادة بنجاح')
  }

  const addWithAi = async (event) => {
    event.preventDefault(); if (!aiPrompt.trim()) return; setLoading(true)
    try {
      const data = await askGemini('habits', aiPrompt)
      const items = Array.isArray(data) ? data : []
      setHabits((current) => [...items.map((item, index) => ({ id: Date.now() + index, title: item.title || aiPrompt, time: item.time || '08:00 ص', category: ['صحة', 'عقل', 'بدن'].includes(item.category) ? item.category : 'صحة', streak: 0, done: false })), ...current])
      notify(`تمت إضافة ${items.length || 1} عادة بالذكاء الاصطناعي`)
    } catch { setHabits((current) => [{ id: Date.now(), title: aiPrompt, time: '08:00 ص', category: 'صحة', streak: 0, done: false }, ...current]); notify('تعذر الاتصال، تمت الإضافة محلياً') }
    setAiPrompt(''); setModal(false); setLoading(false)
  }

  const sendCoach = async (event) => {
    event.preventDefault(); if (!coachInput.trim() || loading) return
    const text = coachInput; setCoachInput(''); setMessages((current) => [...current, { sender: 'user', text }]); setLoading(true)
    try { const data = await askGemini('coach', text, `أتم المستخدم ${completed} من أصل ${habits.length} عادات اليوم.`); setMessages((current) => [...current, { sender: 'coach', text: data.text }]) }
    catch { setMessages((current) => [...current, { sender: 'coach', text: 'استمر بخطوة صغيرة اليوم، فالاستمرارية أهم من الكمال.' }]) }
    setLoading(false)
  }

  return <div className="app" dir="rtl">
    <header><div className="brand"><b>ع</b><div><strong>عاداتي</strong><small>المستوى {profile.level}</small></div></div><div className="stats"><span>⚡ {profile.xp} XP</span><span>🪙 {profile.coins}</span></div></header>
    <div className="progress"><span style={{ width: `${profile.xp % 100}%` }} /></div>
    {toast && <div className="toast">✨ {toast}</div>}
    <main>
      {tab === 'home' && <section className="stack"><div className="welcome"><p className="eyebrow">مساحة صغيرة لتقدم كبير</p><h1>صباح التميز، يا صديقي ☀️</h1><p>أتممت اليوم <b>{completed}</b> من أصل <b>{habits.length}</b> عادات. استمر في البناء نحو الأفضل.</p><button onClick={() => setModal(true)}>＋ إضافة عادة جديدة</button></div><div className="section-title"><h2>عادات اليوم</h2><span>{habits.length} مسجلة</span></div>{habits.map((habit) => <button className={`habit ${habit.done ? 'done' : ''}`} key={habit.id} onClick={() => toggle(habit.id)}><i>{habit.done ? '✓' : ''}</i><div><strong>{habit.title}</strong><small><em className={`tag ${habit.category}`}>{habit.category}</em> ⏰ {habit.time}</small></div><b className="streak">🔥 {habit.streak}</b></button>)}</section>}
      {tab === 'stats' && <section className="stack"><h1>إحصائياتك</h1><div className="metrics"><div><span>🎯</span><small>إنجاز اليوم</small><strong>{habits.length ? Math.round(completed / habits.length * 100) : 0}%</strong></div><div><span>🔥</span><small>أفضل سلسلة</small><strong>{Math.max(0, ...habits.map((habit) => habit.streak))} أيام</strong></div></div><div className="panel"><h2>تقدم العادات</h2>{habits.map((habit) => <div className="bar-row" key={habit.id}><span>{habit.title}</span><b>{habit.streak} يوم</b><div><i style={{ width: `${Math.min(100, habit.streak * 10)}%` }} /></div></div>)}</div></section>}
      {tab === 'coach' && <section className="stack coach"><h1>المساعد الذكي</h1><div className="chat">{messages.map((message, index) => <p className={message.sender} key={index}>{message.text}</p>)}{loading && <p className="coach">جارِ التفكير...</p>}</div><form onSubmit={sendCoach} className="send"><input value={coachInput} onChange={(event) => setCoachInput(event.target.value)} placeholder="اسأل مرشدك الذكي..." /><button>إرسال</button></form></section>}
      {tab === 'store' && <section className="stack"><h1>المتجر والأوسمة</h1><div className="panel purchase"><div><h2>🧊 تجميد السلسلة</h2><p>المخزون لديك: {profile.freezes}</p></div><button onClick={() => profile.coins >= 50 ? (setProfile({ ...profile, coins: profile.coins - 50, freezes: profile.freezes + 1 }), notify('تم شراء التجميد')) : notify('تحتاج إلى 50 عملة')}>🪙 50 شراء</button></div><div className="badges">{['🌱 بداية موفقة', '🔥 محترف الـ 5 أيام', '💪 بطل الصحة', '👑 حكيم الزمان'].map((badge, index) => <div key={badge} className={index < 2 ? 'unlocked' : ''}><span>{badge.split(' ')[0]}</span><b>{badge.slice(2)}</b><small>{index < 2 ? 'مفتوح ✨' : 'مغلق 🔒'}</small></div>)}</div></section>}
    </main>
    <nav>{[['home', '🏠', 'العادات'], ['stats', '📊', 'الإحصائيات'], ['coach', '🤖', 'المساعد'], ['store', '🎁', 'المتجر']].map(([key, icon, label]) => <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}><span>{icon}</span>{label}</button>)}</nav>
    {modal && <div className="overlay"><div className="modal"><button className="close" onClick={() => setModal(false)}>×</button><h2>إضافة عادة جديدة</h2><div className="switch"><button type="button" className={mode === 'manual' ? 'selected' : ''} onClick={() => setMode('manual')}>يدوية</button><button type="button" className={mode === 'ai' ? 'selected' : ''} onClick={() => setMode('ai')}>ذكية بالـ AI</button></div>{mode === 'manual' ? <form onSubmit={addManual}><input required placeholder="اسم العادة" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><div className="two"><input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>صحة</option><option>عقل</option><option>بدن</option></select></div><button>حفظ العادة</button></form> : <form onSubmit={addWithAi}><textarea required rows="4" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="مثال: أريد إضافة الصلوات الخمسة أو ممارسة الرياضة الساعة 5..." /><button disabled={loading}>{loading ? 'جارِ التحليل...' : 'إضافة ذكية ✨'}</button></form>}</div></div>}
  </div>
}
