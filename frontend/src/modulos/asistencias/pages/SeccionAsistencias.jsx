import { useEffect, useRef, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { obtenerTrabajadores } from "../../trabajadores/services/trabajadoresService";
import { obtenerZona, obtenerLlegadasHoy, registrarLlegada } from "../services/asistenciasService";
import { consultarUbicacion, opcionesGPS } from "../services/ubicacion";

const mensajesGPS = {
  1: "Permite el acceso a tu ubicación en el navegador para registrar tu llegada.",
  2: "No se pudo obtener tu ubicación. Activa la ubicación del celular e inténtalo de nuevo.",
  3: "La consulta de ubicación tardó demasiado. Inténtalo de nuevo al aire libre.",
};
const hora = (fecha, zonaHoraria) => new Date(fecha).toLocaleTimeString("es-MX", {
  timeZone: zonaHoraria, hour: "2-digit", minute: "2-digit", second: "2-digit",
});

function distancia(posicion, zona) {
  const rad = (valor) => valor * Math.PI / 180;
  const a = Math.sin(rad(posicion.coords.latitude - zona.latitud) / 2) ** 2 +
    Math.cos(rad(zona.latitud)) * Math.cos(rad(posicion.coords.latitude)) *
    Math.sin(rad(posicion.coords.longitude - zona.longitud) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export default function SeccionAsistencias() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [trabajador, setTrabajador] = useState("");
  const [zona, setZona] = useState(null);
  const [registros, setRegistros] = useState({ fecha: "", asistencias: [] });
  const [posicion, setPosicion] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const [cargando, setCargando] = useState(true);
  const [localizando, setLocalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorGPS, setErrorGPS] = useState("");
  const [exito, setExito] = useState("");
  const detenerConsulta = useRef(null);
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    Promise.all([obtenerTrabajadores(), obtenerZona(), obtenerLlegadasHoy()])
      .then(([equipo, configuracion, llegadas]) => {
        if (!montado.current) return;
        setTrabajadores(equipo.trabajadores.filter((persona) => persona.activo));
        setZona(configuracion.zona);
        setRegistros(llegadas);
      }).catch((e) => { if (montado.current) setError(e.message); })
      .finally(() => { if (montado.current) setCargando(false); });
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => {
      montado.current = false;
      clearInterval(reloj);
      detenerConsulta.current?.();
      detenerConsulta.current = null;
    };
  }, []);

  const verificar = () => {
    setErrorGPS("");
    setPosicion(null);
    if (!window.isSecureContext || !navigator.geolocation) {
      setErrorGPS("Abre la página mediante HTTPS y usa un navegador con acceso a la ubicación.");
      return;
    }
    detenerConsulta.current?.();
    setLocalizando(true);
    detenerConsulta.current = consultarUbicacion(navigator.geolocation, (ubicacion) => {
      if (!montado.current) return;
      setPosicion(ubicacion);
      setAhora(Date.now());
      setLocalizando(false);
      setErrorGPS("");
    }, (e) => {
      if (!montado.current) return;
      setPosicion(null);
      setLocalizando(false);
      setErrorGPS(mensajesGPS[e.code] || "No se pudo consultar la ubicación.");
    });
  };

  const metros = posicion && zona ? distancia(posicion, zona) : null;
  const reciente = posicion && ahora - posicion.timestamp <= 30000 && posicion.timestamp - ahora <= 5000;
  const precisa = posicion && posicion.coords.accuracy <= zona?.precisionMaxima;
  const dentro = metros !== null && metros <= zona.radioMetros;
  const partesFecha = zona ? new Intl.DateTimeFormat("en-US", {
    timeZone: zona.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(ahora)) : [];
  const parteFecha = (tipo) => partesFecha.find((parte) => parte.type === tipo)?.value;
  const fechaHoy = zona ? `${parteFecha("year")}-${parteFecha("month")}-${parteFecha("day")}` : "";
  const llegadas = registros.fecha === fechaHoy ? registros.asistencias : [];
  const yaRegistro = llegadas.some((registro) => (registro.trabajador?._id || registro.trabajador) === trabajador);
  const puedeRegistrar = trabajador && reciente && precisa && dentro && !yaRegistro && !cargando && !guardando;

  const checar = async () => {
    if (!puedeRegistrar) return;
    setGuardando(true);
    setError("");
    setExito("");
    let registrado = false;
    try {
      // Se obtiene una lectura nueva al pulsar para no enviar una ubicación anterior.
      const actual = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, opcionesGPS);
      });
      if (!montado.current) return;
      setPosicion(actual);
      setAhora(Date.now());
      const datos = await registrarLlegada({
        trabajador, latitud: actual.coords.latitude, longitud: actual.coords.longitude,
        precision: actual.coords.accuracy, tomadaEn: actual.timestamp,
      });
      if (!montado.current) return;
      registrado = true;
      const asistencia = { ...datos.asistencia, trabajador: trabajadores.find((persona) => persona._id === trabajador) };
      setRegistros((previo) => ({
        fecha: asistencia.fecha,
        asistencias: [asistencia, ...(previo.fecha === asistencia.fecha ? previo.asistencias : [])],
      }));
      setExito(`Llegada registrada a las ${hora(asistencia.llegada, zona.zonaHoraria)}.`);
    } catch (e) {
      if (!montado.current) return;
      setError(mensajesGPS[e.code] || e.message);
      if (e.code) setPosicion(null);
      if (e.status === 409) {
        try { const datos = await obtenerLlegadasHoy(); if (montado.current) setRegistros(datos); }
        catch { /* Se conserva el mensaje de entrada duplicada. */ }
      }
    } finally {
      if (montado.current) setGuardando(false);
      if (registrado) {
        detenerConsulta.current?.();
        detenerConsulta.current = null;
      }
    }
  };

  return <section className="mx-auto max-w-4xl p-4 pb-12 sm:p-6 lg:p-10">
    <div className="mb-6 rounded-[28px] bg-gradient-to-r from-[#123e83] to-[#a13f65] p-6 text-white sm:p-9">
      <Clock size={30} aria-hidden="true"/>
      <h1 className="mt-3 text-3xl font-black">Registrar llegada</h1>
      <p className="mt-3 text-white/90">Selecciona tu nombre y verifica tu ubicación para checar tu entrada.</p>
    </div>
    <div className="app-panel p-5 sm:p-8">
      {cargando ? <p role="status">Cargando trabajadores y zona de asistencia...</p> : <>
        <label htmlFor="trabajador-asistencia" className="app-label">Trabajador</label>
        <select id="trabajador-asistencia" className="app-field" value={trabajador} disabled={guardando} onChange={(e) => {
          setTrabajador(e.target.value); setError(""); setExito("");
        }}>
          <option value="">Selecciona tu nombre</option>
          {trabajadores.map((persona) => <option key={persona._id} value={persona._id}>{persona.nombre}</option>)}
        </select>
        {!trabajadores.length && <p className="mt-3 text-sm text-slate-600">No hay trabajadores activos disponibles.</p>}
        {zona && <div className="my-5 rounded-xl bg-blue-50 p-4 text-sm text-[#123e83]">
          <p className="flex items-center gap-2 font-bold"><MapPin size={18} aria-hidden="true"/>Zona de asistencia · {zona.radioMetros} metros</p>
          <p className="mt-2">{zona.direccion}</p>
          <p className="mt-2">Tu ubicación se consulta mientras esta pantalla está abierta. Al checar se guarda junto con tu llegada.</p>
        </div>}
        <button type="button" onClick={verificar} disabled={!zona || localizando || guardando} className="rounded-xl border-2 border-blue-200 px-4 py-3 font-bold text-[#124B91] disabled:opacity-50">
          {localizando ? "Consultando ubicación..." : "Verificar mi ubicación"}
        </button>
        <div className="my-4 text-sm" role="status" aria-live="polite">
          {posicion && <p>Distancia: {Math.ceil(metros)} m · Precisión estimada: ±{Math.ceil(posicion.coords.accuracy)} m.</p>}
          {posicion && (!reciente ? <p>La ubicación caducó. Verifica tu ubicación nuevamente.</p> :
            !precisa ? <p>La ubicación es poco precisa. Activa la ubicación precisa e inténtalo al aire libre.</p> :
            dentro ? <p className="font-semibold text-green-700">Estás dentro de la zona de asistencia.</p> :
            <p className="font-semibold text-amber-800">Acércate a la empresa para entrar al radio de {zona.radioMetros} metros.</p>)}
          {yaRegistro && <p className="mt-2 font-semibold text-green-700">Ya registraste tu llegada hoy.</p>}
        </div>
        {errorGPS && <p role="alert" className="my-4 rounded-xl bg-amber-50 p-4 text-amber-900">{errorGPS}</p>}
        <button type="button" disabled={!puedeRegistrar} onClick={checar} className="app-primary w-full rounded-xl px-5 py-4 font-bold disabled:opacity-50">
          {guardando ? "Registrando llegada..." : "Registrar llegada"}
        </button>
        <p className="mt-4 text-sm text-slate-500">Una llegada por día. Horario de México. Por ahora, el nombre se selecciona sin inicio de sesión.</p>
      </>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {exito && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 font-semibold text-green-800">{exito}</p>}
    </div>
    <div className="app-panel mt-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Llegadas de hoy</h2>
        <button type="button" disabled={cargando || guardando} className="text-sm font-bold text-[#124B91] disabled:opacity-50" onClick={async () => {
          try { setRegistros(await obtenerLlegadasHoy()); setError(""); }
          catch (e) { setError(e.message); }
        }}>Actualizar</button>
      </div>
      {!cargando && (llegadas.length ? <ul className="mt-4 divide-y divide-slate-100">
        {llegadas.map((registro) => <li key={registro._id} className="flex items-center justify-between gap-3 py-3">
          <span>{registro.trabajador?.nombre || "Trabajador eliminado"}</span>
          <time dateTime={registro.llegada} className="font-semibold text-[#124B91]">{hora(registro.llegada, zona?.zonaHoraria)}</time>
        </li>)}
      </ul> : <p className="mt-4 text-slate-500">Todavía no hay llegadas registradas hoy.</p>)}
    </div>
  </section>;
}
