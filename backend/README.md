# API de trabajos

Desde esta carpeta, instala las dependencias con `npm.cmd ci`. Copia
`.env.example` a `.env`, configura `MONGO_URI`, `JWT_SECRET` (un secreto
aleatorio de al menos 32 caracteres) y las credenciales iniciales del
superadmin. El superadmin inicial es `admin@gmail.com`. Para el primer acceso
local puedes configurar `ADMIN_PASSWORD=admin`; esa cuenta quedará obligada a
cambiar la contraseña por una de al menos 12 caracteres antes de usar cualquier
módulo. En producción configura desde el inicio una contraseña propia de al
menos 12 caracteres. Ejecuta `npm.cmd run bootstrap:admin` una sola vez para
crear esa cuenta y `npm.cmd run dev` para iniciar el servidor.

El bootstrap no reemplaza ni modifica superadmins existentes. No se permite el
registro público: el superadmin autenticado crea usuarios desde la aplicación.
Las contraseñas se guardan con bcrypt. Los JWT duran 7 días y el frontend
restaura la sesión guardada en ese navegador.

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
`/api/dashboard` requieren `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Resultado |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | Valida credenciales y devuelve JWT y usuario. |
| GET | `/api/auth/me` | Sesión válida | Devuelve el usuario de la sesión. |
| GET | `/api/auth/users` | Solo superadmin | Lista cuentas de usuario, sin incluir superadmins. |
| POST | `/api/auth/users` | Solo superadmin | Crea una cuenta de usuario. |
| PATCH | `/api/auth/users/:id/password` | Solo superadmin | Cambia la contraseña de un usuario y obliga a renovarla al iniciar sesión. |
| POST | `/api/auth/change-password` | Sesión válida | Cambia la contraseña actual. |

Para crear un usuario, envía `email` y `password` (mínimo 12 caracteres) como
JSON a `/api/auth/users`. No es posible asignar privilegios desde esta ruta.
Las cuentas nuevas y las contraseñas restablecidas deben renovarse en el primer
inicio de sesión.

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
