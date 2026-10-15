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
