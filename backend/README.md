# API de trabajos

Desde esta carpeta, instala las dependencias con `npm.cmd ci`. Copia
`.env.example` a `.env`, configura `MONGO_URI`, `JWT_SECRET` (un secreto
aleatorio de al menos 32 caracteres) y las credenciales iniciales del
administrador. El administrador inicial es `admin@gmail.com`. Para el primer acceso
local puedes configurar `ADMIN_PASSWORD=admin`; esa cuenta quedará obligada a
cambiar la contraseña por una de al menos 12 caracteres antes de usar cualquier
módulo. En producción configura desde el inicio una contraseña propia de al
menos 12 caracteres. Ejecuta `npm.cmd run bootstrap:admin` una sola vez para
crear esa cuenta y `npm.cmd run dev` para iniciar el servidor.

El bootstrap no reemplaza ni modifica administradores existentes. No se permite el
registro público. Desde **Trabajadores → Acceso**, un administrador habilita una
cuenta para una ficha activa o restablece su contraseña temporal. Las cuentas
heredadas sin ficha pueden vincularse desde ese mismo formulario usando su correo
original y una contraseña temporal nueva.

Las contraseñas se guardan con bcrypt. Los JWT duran 12 horas y quedan
invalidados cuando se cambia o restablece la contraseña.

## Rutas

| Método | Ruta | Resultado |
| --- | --- | --- |
| POST | `/api/trabajos` | Crea un trabajo (201). |
| GET | `/api/trabajos` | Devuelve `{ "trabajos": [...] }` (200). |
| GET | `/api/trabajos/:id` | Devuelve `{ "trabajo": {...} }` (200). |
| PUT | `/api/trabajos/:id` | Actualiza los campos enviados y devuelve el trabajo (200). |
| DELETE | `/api/trabajos/:id` | Elimina el trabajo (200). |
| HEAD | `/api/trabajos` o `/api/trabajos/:id` | Mismo estado y encabezados de GET, sin cuerpo. |

Todas las rutas bajo `/api/trabajos`, `/api/clientes`, `/api/trabajadores` y
`/api/dashboard`, `/api/registro-ventas` y `/api/tareas` requieren un token de administrador.

| Método | Ruta | Acceso | Resultado |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | Valida credenciales y devuelve JWT y usuario. |
| GET | `/api/auth/me` | Sesión válida | Devuelve el usuario de la sesión. |
| GET | `/api/auth/users` | Solo administrador | Lista cuentas de usuario, sin incluir administradores. |
| POST | `/api/auth/users` | Solo administrador | Crea o vincula una cuenta a una ficha de trabajador activa. |
| PATCH | `/api/auth/users/:id/password` | Solo administrador | Cambia la contraseña de un usuario y obliga a renovarla al iniciar sesión. |
| POST | `/api/auth/change-password` | Sesión válida | Cambia la contraseña actual. |

Para crear o vincular un acceso, envía `email`, `password` (mínimo 8 caracteres)
y `trabajador` (ID de su ficha) como JSON a `/api/auth/users`. Cada ficha admite
una sola cuenta. Las cuentas nuevas y las contraseñas restablecidas deben
renovarse en el primer inicio de sesión.

Una cuenta de trabajador activa consulta `GET /api/mi-trabajo` para ver trabajos,
tareas y gavetas asignadas. La respuesta omite precios y datos de cobro.
`GET /api/asistencias/hoy`, `POST /api/asistencias` y `POST /api/asistencias/salida`
usan su ficha autenticada.
Las cuentas sin ficha activa carecen de acceso a esos módulos.

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

## Registro de asistencia

Después de registrar la entrada, el botón cambia a **Checar salida**. La salida
requiere verificar nuevamente la ubicación si ha caducado y cumplir el mismo
radio y precisión que la entrada. `POST /api/asistencias/salida` recibe los mismos
campos que el registro de entrada y guarda `salida` con la hora del servidor en
la asistencia del día local. Solo permite una salida y exige una entrada ese día;
los intentos sin entrada o con salida ya registrada devuelven 409. La actualización
es atómica para evitar sobrescribir la hora ante solicitudes simultáneas.
`GET /api/asistencias/hoy` incluye `salida`, que también aparece en la lista de
asistencias. Los registros anteriores sin ese campo se consideran sin salida.

En **Asistencia**, los administradores consultan una tabla de entradas y salidas,
con búsqueda por nombre, selección de fecha y duración entre ambas checadas.
`GET /api/asistencias/historial?fecha=YYYY-MM-DD` requiere un administrador y
devuelve únicamente trabajador, fecha, llegada y salida, además de la zona horaria.
Si se omite la fecha usa el día actual de México. Las fechas inválidas devuelven 400.
Los trabajadores registran su propia asistencia desde su portal con la ficha
vinculada a su sesión y no pueden consultar el historial administrativo.
El centro está en `21.5224892,
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

La cuenta de trabajador usa su ficha autenticada aunque se envíe otro nombre o ID.
El navegador puede enviar coordenadas manipuladas: el radio valida las coordenadas
recibidas y no impide falsificar el GPS. La ubicación se
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
