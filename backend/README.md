# API de trabajos

Desde esta carpeta, instala las dependencias con `npm.cmd ci`. Crea un archivo
`.env` con `MONGO_URI` apuntando a tu base de datos y, opcionalmente, `PORT`
(por defecto es `3000`). Ejecuta `npm.cmd run dev` para iniciar el servidor.

## Rutas

| Método | Ruta | Resultado |
| --- | --- | --- |
| POST | `/api/trabajos` | Crea un trabajo (201). |
| GET | `/api/trabajos` | Devuelve `{ "trabajos": [...] }` (200). |
| GET | `/api/trabajos/:id` | Devuelve `{ "trabajo": {...} }` (200). |
| PUT | `/api/trabajos/:id` | Actualiza los campos enviados y devuelve el trabajo (200). |
| DELETE | `/api/trabajos/:id` | Elimina el trabajo (200). |
| HEAD | `/api/trabajos` o `/api/trabajos/:id` | Mismo estado y encabezados de GET, sin cuerpo. |

Envía JSON con el encabezado `Content-Type: application/json`.

Ejemplo de cuerpo para POST:

```json
{
  "nombre": "Ventana de cocina",
  "material": "vidrio",
  "especificaciones": "Vidrio templado",
  "fechaInicio": "2026-10-13",
  "fechaFinal": "2026-10-20"
}
```

Los campos obligatorios son `nombre`, `material`, `fechaInicio` y `fechaFinal`.
`material` admite `vidrio` o `granito`. `estado` admite `templado`, `fabricacion`,
`detallado`, `instalacion` y `finalizado`; por defecto es `templado`.
También puedes enviar `trabajador`, `responsableTemple` y `cliente` como IDs de
MongoDB, y `video` como texto. No se comprueba la existencia de esas referencias.

Ejemplo de cuerpo para PUT (conserva los campos no enviados):

```json
{
  "estado": "finalizado"
}
```

La API responde 400 si el ID o los datos son inválidos, 404 si el trabajo no
existe y 500 si ocurre un error interno. PUT exige al menos un campo permitido
y aplica las validaciones del modelo.

## Pruebas

Ejecuta `npm.cmd test`. Las pruebas realizan peticiones HTTP a Express y simulan
las operaciones de base de datos; no necesitan una conexión a MongoDB.

## Registro de llegada

La sección **Asistencia** permite seleccionar un trabajador activo, consultar su
ubicación y registrar una entrada diaria. El centro está en `21.5224892,
-102.246005` (Cuenca Lerma Santiago 26) con radio de 100 metros. La configuración
está en `src/utils/asistencia.js` y se consulta en `GET /api/asistencias/zona`.

`POST /api/asistencias` recibe:

```json
{
  "trabajador": "ID_MONGODB",
  "latitud": 21.5224892,
  "longitud": -102.246005,
  "precision": 10,
  "tomadaEn": 1792735200000
}
```

`tomadaEn` debe ser el timestamp de la lectura GPS actual en milisegundos; el
número del ejemplo es ilustrativo. Se rechazan lecturas de más de 30 segundos,
precisión peor a 100 metros y posiciones fuera del radio. La precisión es una
estimación: puede haber errores cerca del límite. El servidor asigna la hora y
el día en `America/Mexico_City`. El índice único trabajador/fecha impide entradas
duplicadas, incluso simultáneas; el servidor espera su creación antes de escuchar.
Un duplicado devuelve 409. `GET /api/asistencias/hoy` lista nombres y horas de hoy
sin divulgar coordenadas en esa lista.

Para usar ubicación desde celulares, publica el frontend con **HTTPS** y apunta
`VITE_API_URL` al backend accesible por HTTPS. En el backend, configura
`FRONTEND_URL` con el origen del frontend (sin barra final); admite varios orígenes
separados por comas y por defecto permite `http://localhost:5173`.
`localhost` en un celular corresponde al propio celular, no a la computadora.
Entrar por una IP local con HTTP normalmente no permite geolocalización.

Esta versión no tiene autenticación: cualquiera puede seleccionar otro nombre y
el navegador puede enviar coordenadas manipuladas. El radio valida las coordenadas
recibidas, no acredita la identidad ni impide falsificar el GPS. La ubicación se
consulta en la pantalla y se almacena solo al registrar una llegada.
Después de pulsar **Verificar mi ubicación**, se solicita una lectura nueva cada
10 segundos, aunque el dispositivo permanezca quieto. Las consultas se detienen
al salir de la pantalla o al registrar correctamente una llegada. Se conserva la
caducidad de 30 segundos si no se logra obtener una lectura nueva.

## Pruebas de asistencia

Ejecuta `npm.cmd test` para validar las rutas, límites de ubicación, fecha local,
errores de BD y manejo de duplicados. Las operaciones MongoDB están simuladas;
la creación real del índice y la geolocalización requieren probar la aplicación
con MongoDB y un celular. Comprueba permiso denegado, ubicación imprecisa,
fuera/dentro del radio, registro exitoso y segundo intento del mismo día.

En `frontend`, `npm.cmd test` comprueba la renovación de ubicación sin movimiento,
los reintentos y la cancelación de consultas al salir de la pantalla.
