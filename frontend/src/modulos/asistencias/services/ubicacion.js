export const opcionesGPS = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 };

// watchPosition puede dejar de notificar si el dispositivo está quieto.
// Pedimos lecturas nuevas antes de que venza el plazo de 30 segundos.
export function consultarUbicacion(geolocalizacion, recibir, fallar) {
  let activa = true;
  let pendiente = false;
  const consultar = () => {
    if (!activa || pendiente) return;
    pendiente = true;
    geolocalizacion.getCurrentPosition((posicion) => {
      pendiente = false;
      if (activa) recibir(posicion);
    }, (error) => {
      pendiente = false;
      if (activa) fallar(error);
    }, opcionesGPS);
  };
  consultar();
  const intervalo = setInterval(consultar, 10000);
  return () => {
    activa = false;
    clearInterval(intervalo);
  };
}
