import { useEffect, useState } from "react";
import AlertaModal from "./AlertaModal";

export default function AvisosSistema() {
  const [avisos, setAvisos] = useState([]);
  useEffect(() => {
    const recibir = ({ detail }) => setAvisos(actuales =>
      actuales.some(aviso => aviso.titulo === detail.titulo && aviso.mensaje === detail.mensaje)
        ? actuales : [...actuales, detail]);
    window.addEventListener("sistema:aviso", recibir);
    return () => window.removeEventListener("sistema:aviso", recibir);
  }, []);
  return <AlertaModal alerta={avisos[0]} onCerrar={() => setAvisos(actuales => actuales.slice(1))} />;
}
