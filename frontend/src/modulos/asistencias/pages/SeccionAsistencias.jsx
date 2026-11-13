import AlertaModal from "../../../components/ui/AlertaModal";
import { avisar } from "../../../services/avisos";
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { obtenerZona, obtenerLlegadasHoy, registrarLlegada, registrarSalida } from "../services/asistenciasService";
import { opcionesGPS } from "../services/ubicacion";

const mensajesGPS = {
  1: "Permite el acceso a tu ubicación en el navegador para registrar tu asistencia.",
  2: "No se pudo obtener tu ubicación. Activa la ubicación del celular e inténtalo de nuevo.",
  3: "La consulta de ubicación tardó demasiado. Inténtalo de nuevo al aire libre.",
};
const hora = (fecha, zonaHoraria) => new Date(fecha).toLocaleTimeString("es-MX", {
  timeZone: zonaHoraria, hour: "2-digit", minute: "2-digit", second: "2-digit",
});

export default function SeccionAsistencias({ miTrabajador }) {
  const trabajador = miTrabajador;
  const [zona, setZona] = useState(null);
  const [registros, setRegistros] = useState({ fecha: "", asistencias: [] });
  const [ahora, setAhora] = useState(Date.now());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    Promise.all([obtenerZona(), obtenerLlegadasHoy()])
      .then(([configuracion, llegadas]) => {
        if (!montado.current) return;
        setZona(configuracion.zona);
        setRegistros(llegadas);
      }).catch((e) => { if (montado.current) setError(e.message); })
      .finally(() => { if (montado.current) setCargando(false); });
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => {
      montado.current = false;
      clearInterval(reloj);
    };
  }, [miTrabajador]);

  const [confirmacion, setConfirmacion] = useState(null);

  const partesFecha = zona ? new Intl.DateTimeFormat("en-US", {
    timeZone: zona.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(ahora)) : [];
  const parteFecha = (tipo) => partesFecha.find((parte) => parte.type === tipo)?.value;
  const fechaHoy = zona ? `${parteFecha("year")}-${parteFecha("month")}-${parteFecha("day")}` : "";
  const llegadas = registros.fecha === fechaHoy ? registros.asistencias : [];
  const registroActual = llegadas.find((registro) => (registro.trabajador?._id || registro.trabajador) === trabajador);
  const yaRegistro = !!registroActual;
  const yaSalio = !!registroActual?.salida;
  const salidaDesde = registroActual ? new Date(registroActual.llegada).getTime() + (zona.esperaSalidaMs ?? 4 * 60 * 60 * 1000) : 0;
  const puedeRegistrar = zona && trabajador && !yaSalio && !cargando && !guardando &&
    (!yaRegistro || ahora >= salidaDesde);
  const accion = yaRegistro ? "Registrar salida" : "Registrar llegada";

  const checar = async () => {
    if (!puedeRegistrar || confirmacion !== accion) return;
    setConfirmacion(null);
    if (!window.isSecureContext || !navigator.geolocation) {
      avisar("error", "Ubicación no disponible", "Abre la página mediante HTTPS y habilita el acceso a tu ubicación.");
      return;
    }
    setGuardando(true);
    setError("");
    setExito("");
    try {
      // Se obtiene una lectura nueva al pulsar para no enviar una ubicación anterior.
      const actual = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, opcionesGPS);
      });
      if (!montado.current) return;
      setAhora(Date.now());
      const registrar = yaRegistro ? registrarSalida : registrarLlegada;
      const datos = await registrar({
        trabajador, latitud: actual.coords.latitude, longitud: actual.coords.longitude,
        precision: actual.coords.accuracy, tomadaEn: actual.timestamp,
      });
      if (!montado.current) return;
      const asistencia = datos.asistencia;
      setRegistros((previo) => ({
        fecha: asistencia.fecha,
        asistencias: [asistencia, ...(previo.fecha === asistencia.fecha ? previo.asistencias.filter(
          (registro) => (registro.trabajador?._id || registro.trabajador) !== trabajador,
        ) : [])],
      }));
      setExito(`${yaRegistro ? "Salida" : "Llegada"} registrada a las ${hora(yaRegistro ? asistencia.salida : asistencia.llegada, zona.zonaHoraria)}.`);
    } catch (e) {
      if (!montado.current) return;
      setError(mensajesGPS[e.code] || e.message);
      if (e.code) {
        avisar("error", "No se pudo obtener tu ubicación", mensajesGPS[e.code] || e.message);
      }
      if (e.status === 409) {
        try { const datos = await obtenerLlegadasHoy(); if (montado.current) setRegistros(datos); }
        catch { /* Se conserva el mensaje del servidor. */ }
      }
    } finally {
      if (montado.current) setGuardando(false);
    }
  };

  return <section className="mx-auto max-w-4xl p-4 pb-12 sm:p-6 lg:p-10">
    <div className="mb-6 rounded-[28px] bg-gradient-to-r from-[#123e83] to-[#a13f65] p-6 text-white sm:p-9">
      <Clock size={30} aria-hidden="true"/>
      <h1 className="mt-3 text-3xl font-black">Registrar asistencia</h1>
      <p className="mt-3 text-white/90">Verifica tu ubicación para registrar tu entrada o salida.</p>
    </div>
    <div className="app-panel p-5 sm:p-8">
      {cargando ? <p role="status">Cargando mi asistencia...</p> : <>
        {yaRegistro && <p className="mb-4 text-sm font-semibold text-slate-700">
          Llegada registrada a las {hora(registroActual.llegada, zona.zonaHoraria)}.
          {yaSalio ? ` Salida registrada a las ${hora(registroActual.salida, zona.zonaHoraria)}.` :
            ahora < salidaDesde ? ` Podrás registrar tu salida a partir de las ${hora(salidaDesde, zona.zonaHoraria)}.` : ""}
        </p>}
        <button type="button" disabled={!puedeRegistrar} onClick={() => setConfirmacion(accion)}
          className="app-primary w-full rounded-xl px-5 py-4 font-bold disabled:opacity-50">
          {guardando ? "Registrando..." : yaSalio ? "Salida registrada" : accion}
        </button>
        <p className="mt-4 text-sm text-slate-500">Una entrada y una salida por día. Horario de México.</p>
      </>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {exito && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 font-semibold text-green-800">{exito}</p>}
    </div>
    <AlertaModal alerta={confirmacion === accion && puedeRegistrar && {
      tipo: "confirm", titulo: confirmacion, confirmarTexto: confirmacion,
      mensaje: `Usaremos tu ubicación para verificar que estás dentro del radio de ${zona.radioMetros} metros de la empresa.`,
    }} onCerrar={() => setConfirmacion(null)} onConfirmar={checar} />
  </section>;
}
