import { useMemo, useState } from 'react'
import { LayoutDashboard, BriefcaseBusiness, Users, CalendarDays, Boxes, Settings, Search, Bell, Plus, ArrowUpRight, Clock3, CircleCheck, AlertTriangle, ChevronDown, Menu, X, Hammer, Ruler, Truck, ClipboardList, ArrowRight, Filter, LogOut } from 'lucide-react'

const initialJobs = [
  { id: 'TR-1048', client: 'María Fernanda López', initials: 'MF', project: 'Cubierta de cocina', material: 'Granito Negro San Gabriel', worker: 'Carlos Ramírez', date: '12 oct 2026', stage: 'Fabricación', progress: 52, urgent: false },
  { id: 'TR-1047', client: 'Roberto González', initials: 'RG', project: 'Barra de baño', material: 'Mármol Blanco Carrara', worker: 'Luis Hernández', date: '10 oct 2026', stage: 'Instalación', progress: 85, urgent: true },
  { id: 'TR-1046', client: 'Constructora del Valle', initials: 'CV', project: 'Escaleras y descansos', material: 'Granito Gris Oxford', worker: 'Miguel Torres', date: '16 oct 2026', stage: 'Templado', progress: 20, urgent: false },
  { id: 'TR-1045', client: 'Ana Sofía Martínez', initials: 'AS', project: 'Isla de cocina', material: 'Cuarzo Calacatta', worker: 'Carlos Ramírez', date: '14 oct 2026', stage: 'Detallado', progress: 72, urgent: false },
  { id: 'TR-1044', client: 'José Antonio Pérez', initials: 'JP', project: 'Cubierta para lavabo', material: 'Granito Blanco Dallas', worker: 'Luis Hernández', date: '08 oct 2026', stage: 'Finalizado', progress: 100, urgent: false },
]
const navigation = [
  { label: 'General', items: [{ name: 'Dashboard', icon: LayoutDashboard }, { name: 'Trabajos', icon: BriefcaseBusiness }, { name: 'Clientes', icon: Users }, { name: 'Calendario', icon: CalendarDays }] },
  { label: 'GESTIÓN', items: [{ name: 'Trabajadores', icon: Hammer }, { name: 'Materiales', icon: Boxes }, { name: 'Configuración', icon: Settings }] },
]
const stageStyle = {
  Templado: 'bg-violet-50 text-violet-700 ring-violet-100',
  Fabricación: 'bg-blue-50 text-blue-700 ring-blue-100',
  Detallado: 'bg-amber-50 text-amber-700 ring-amber-100',
  Instalación: 'bg-pink-50 text-pink-700 ring-pink-100',
  Finalizado: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
}
const stages = ['Todos', 'Templado', 'Fabricación', 'Detallado', 'Instalación', 'Finalizado']

function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
  return <>
    {mobileOpen && <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col bg-[#12254A] text-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-23 items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="grid size-11 place-items-center rounded-xl bg-brand-coral shadow-lg shadow-red-900/20"><Ruler size={23} strokeWidth={2.4} /></div>
        <div><div className="text-[18px] font-extrabold tracking-tight">LA PROVIDENCIA</div><div className="text-[10px] font-semibold tracking-[.19em] text-blue-200/70">SISTEMA DE GESTIÓN</div></div>
        <button className="ml-auto lg:hidden" aria-label="Cerrar" onClick={() => setMobileOpen(false)}><X size={19}/></button>
      </div>
      <div className="flex-1 space-y-7 overflow-y-auto px-3 py-7">
        {navigation.map(group => <div key={group.label}>
          <div className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[.19em] text-blue-200/45">{group.label}</div>
          <div className="space-y-1">{group.items.map(({name,icon:Icon}) => <button key={name} onClick={() => {setActive(name);setMobileOpen(false)}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-semibold transition ${active === name ? 'bg-[#284574] text-white shadow-sm' : 'text-blue-100/65 hover:bg-white/8 hover:text-white'}`}><Icon size={18} strokeWidth={active === name ? 2.4 : 1.9}/>{name}{active === name && <span className="ml-auto h-5 w-1 rounded-full bg-brand-coral"/>}</button>)}</div>
        </div>)}
      </div>
      <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-3.5"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-[#F8D6D8] text-xs font-extrabold text-brand-pink">AD</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Administrador</p><p className="text-[11px] text-blue-100/50">Cuenta principal</p></div><LogOut size={16} className="text-blue-100/50"/></div></div>
    </aside>
  </>
}

function StatCard({ title, value, icon:Icon, tint, iconColor, note, sub }) {
  return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,.035)]">
    <div className="flex items-start justify-between"><span className="text-[13px] font-medium text-slate-500">{title}</span><span className={`grid size-11 place-items-center rounded-xl ${tint} ${iconColor}`}><Icon size={21}/></span></div>
    <div className="mt-2 text-[32px] font-extrabold tracking-tight text-[#18294B]">{value}</div>
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]"><span className="font-bold text-brand-blue">{note}</span><span className="text-slate-400">{sub}</span></div>
  </div>
}

function App() {
  const [active, setActive] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [jobs, setJobs] = useState(initialJobs)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('Todos')
  const [showNew, setShowNew] = useState(false)
  const [newClient, setNewClient] = useState('')
  const [newProject, setNewProject] = useState('')
  const [newMaterial, setNewMaterial] = useState('')
  const filtered = useMemo(() => jobs.filter(j => (stage === 'Todos' || j.stage === stage) && [j.client,j.project,j.id,j.material].some(v=>v.toLowerCase().includes(search.toLowerCase()))), [jobs,stage,search])
  const pending = jobs.filter(j=>j.stage !== 'Finalizado').length
  const finished = jobs.filter(j=>j.stage === 'Finalizado').length
  const alerts = jobs.filter(j=>j.urgent && j.stage !== 'Finalizado').length
  function addJob(e) {
    e.preventDefault()
    if (!newClient.trim() || !newProject.trim()) return
    setJobs(current=>[{id:`TR-${1049 + current.length - initialJobs.length}`,client:newClient.trim(),initials:newClient.trim().split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase(),project:newProject.trim(),material:newMaterial.trim() || 'Por definir',worker:'Sin asignar',date:'Por definir',stage:'Templado',progress:0,urgent:false},...current])
    setNewClient('');setNewProject('');setNewMaterial('');setStage('Todos');setSearch('');setShowNew(false);setActive('Trabajos')
  }
  return <div className="min-h-screen bg-[#F7F9FD]">
    <Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
    <div className="lg:pl-[258px]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3"><button aria-label="Abrir menú" className="lg:hidden" onClick={()=>setMobileOpen(true)}><Menu size={22}/></button><div className="text-sm text-slate-400">Panel <span className="px-1 text-slate-300">/</span> <span className="font-semibold text-[#18294B]">{active}</span></div></div>
        <div className="flex items-center gap-4"><span className="hidden text-xs text-slate-400 sm:inline">Viernes, 9 de octubre de 2026</span><span className="hidden h-6 w-px bg-slate-200 sm:block"/><button aria-label="Notificaciones" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Bell size={19}/><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-coral"/></button><div className="grid size-9 place-items-center rounded-full bg-[#F9E2E5] text-xs font-bold text-brand-pink">AD</div></div>
      </header>
      <main className="mx-auto max-w-[1460px] px-5 pb-12 pt-8 sm:px-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div><div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-brand-coral"><span className="size-1.5 rounded-full bg-brand-coral"/> Panel de administración</div><h1 className="text-[27px] font-extrabold tracking-tight text-[#18294B] sm:text-[32px]">{active === 'Dashboard' ? 'Resumen general' : active}</h1><p className="mt-1 text-[13px] text-slate-500">Controla tus proyectos, entregas y operaciones desde un solo lugar.</p></div>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-2 rounded-xl bg-brand-coral px-5 py-3 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(245,68,75,.22)] transition hover:brightness-95"><Plus size={18}/> Nuevo trabajo</button>
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Trabajos activos" value={pending} icon={BriefcaseBusiness} tint="bg-blue-50" iconColor="text-brand-blue" note="En proceso" sub="actualmente"/>
          <StatCard title="Clientes registrados" value={new Set(jobs.map(j=>j.client)).size} icon={Users} tint="bg-violet-50" iconColor="text-brand-purple" note="En el sistema" sub="(demo)"/>
          <StatCard title="Trabajos finalizados" value={finished} icon={CircleCheck} tint="bg-emerald-50" iconColor="text-emerald-600" note="Completados" sub="en la muestra"/>
          <StatCard title="Entregas por atender" value={alerts} icon={AlertTriangle} tint="bg-red-50" iconColor="text-brand-coral" note="Requieren atención" sub="prioritaria"/>
        </div>
        <div className="mb-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <section className="overflow-hidden rounded-2xl bg-[#182F58] p-6 text-white sm:p-7"><div className="flex flex-wrap items-center justify-between gap-5"><div><div className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-blue-200/70">VISTA GENERAL</div><h2 className="text-[22px] font-bold tracking-tight">Todo tu trabajo, bajo control.</h2><p className="mt-2 max-w-md text-[13px] leading-relaxed text-blue-100/70">Consulta el avance de cada proyecto y mantén a tu equipo organizado desde un solo panel.</p><button onClick={()=>{setActive('Trabajos');document.getElementById('jobs')?.scrollIntoView({behavior:'smooth'})}} className="mt-5 flex items-center gap-2 text-xs font-bold text-white">Ver todos los trabajos <ArrowRight size={15}/></button></div><div className="grid size-24 place-items-center rounded-full border-[12px] border-[#4D6E9A] border-t-brand-coral border-r-[#EAA4B5] rotate-[-30deg]"><span className="rotate-[30deg] text-xl font-extrabold">{jobs.length}</span></div></div></section>
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_3px_18px_rgba(15,23,42,.035)]"><div className="mb-5 flex items-center justify-between"><h2 className="text-[15px] font-bold text-[#18294B]">Etapas de producción</h2><ClipboardList size={18} className="text-slate-400"/></div><div className="space-y-3">{['Templado','Fabricación','Detallado','Instalación'].map((s,i)=>{const n=jobs.filter(j=>j.stage===s).length;return <div key={s} className="flex items-center gap-3"><span className="w-23 text-xs text-slate-500">{s}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${['bg-brand-purple','bg-brand-blue','bg-amber-400','bg-brand-coral'][i]}`} style={{width:`${n / Math.max(1,jobs.length)*100}%`}}/></div><span className="w-4 text-right text-xs font-bold text-[#18294B]">{n}</span></div>})}</div></section>
        </div>
        <section id="jobs" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_3px_18px_rgba(15,23,42,.035)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6"><div><h2 className="text-[17px] font-extrabold text-[#18294B]">Trabajos recientes</h2><p className="mt-1 text-xs text-slate-400">Consulta y organiza los proyectos registrados</p></div><div className="flex flex-wrap gap-2"><div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-400"><Search size={16}/><input aria-label="Buscar trabajos" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar trabajo..." className="w-35 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 sm:w-43"/></div><div className="relative flex items-center gap-1 rounded-lg border border-slate-200 px-3 text-slate-500"><Filter size={15}/><select aria-label="Filtrar por etapa" value={stage} onChange={e=>setStage(e.target.value)} className="max-w-30 appearance-none bg-transparent py-2 pr-4 text-xs outline-none">{stages.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={12} className="pointer-events-none absolute right-2"/></div></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-[#F9FAFD] text-[10px] font-bold uppercase tracking-[.1em] text-slate-400"><tr>{['Trabajo / Cliente','Material','Responsable','Entrega','Estado','Avance'].map(x=><th key={x} className="px-5 py-4 first:pl-6">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(job=><tr key={job.id} className="transition hover:bg-slate-50/70"><td className="px-5 py-4 pl-6"><div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F0EDF8] text-[11px] font-extrabold text-brand-purple">{job.initials}</div><div><div className="text-[12px] font-bold text-[#18294B]">{job.project}</div><div className="mt-0.5 text-[11px] text-slate-400">{job.client} · {job.id}</div></div></div></td><td className="px-5 py-4 text-[12px] text-slate-600">{job.material}</td><td className="px-5 py-4 text-[12px] text-slate-600">{job.worker}</td><td className="px-5 py-4"><div className="flex items-center gap-1.5 text-[12px] text-slate-600"><CalendarDays size={13} className="text-slate-400"/>{job.date}</div>{job.urgent && <span className="mt-1 inline-block text-[10px] font-semibold text-brand-coral">Prioritario</span>}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${stageStyle[job.stage]}`}>{job.stage}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-18 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-blue" style={{width:`${job.progress}%`}}/></div><span className="text-[11px] font-bold text-slate-500">{job.progress}%</span></div></td></tr>)}</tbody></table>{filtered.length===0 && <div className="py-12 text-center text-sm text-slate-400">No hay trabajos que coincidan con tu búsqueda.</div>}</div>
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400"><span>Mostrando {filtered.length} de {jobs.length} trabajos</span><span>Datos de demostración</span></div>
        </section>
        <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400"><Clock3 size={13}/> Prototipo visual · Los cambios todavía no se guardan en MongoDB</div>
      </main>
    </div>
    {showNew && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1730]/65 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setShowNew(false)}}><form onSubmit={addJob} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-[#18294B]">Nuevo trabajo</h2><p className="mt-1 text-xs text-slate-400">Registro de demostración</p></div><button type="button" aria-label="Cerrar" onClick={()=>setShowNew(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button></div>{[['Cliente',newClient,setNewClient,'Nombre del cliente'],['Proyecto',newProject,setNewProject,'Ej. Cubierta de cocina'],['Material',newMaterial,setNewMaterial,'Ej. Granito negro']].map(([label,value,setter,placeholder],i)=><label key={label} className="mb-4 block text-xs font-bold text-slate-600">{label}{i<2&&' *'}<input required={i<2} value={value} onChange={e=>setter(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal text-slate-800 outline-none focus:border-brand-blue"/></label>)}<button type="submit" className="mt-2 w-full rounded-xl bg-brand-coral py-3 text-sm font-bold text-white">Agregar trabajo</button></form></div>}
  </div>
}
export default App
