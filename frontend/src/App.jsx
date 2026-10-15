import { Building2, Users } from "lucide-react";
import SeccionTrabajadores from "./modulos/trabajadores/pages/SeccionTrabajadores";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <header className="border-b border-slate-200 bg-white px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="rounded-xl bg-[#124B91] p-2 text-white"><Building2 size={22}/></div>
          <div><p className="text-lg font-extrabold tracking-tight text-slate-900">La Providencia</p><p className="text-xs text-slate-500">Sistema de organización</p></div>
          <span className="ml-auto flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#124B91]"><Users size={14}/> Personal</span>
        </div>
      </header>
      <SeccionTrabajadores />
    </div>
  );
}
