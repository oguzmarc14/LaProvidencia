# Asistencias

El módulo conserva el inicio de sesión y los roles existentes. `usuario` es el trabajador con ficha activa vinculada; `admin` y el rol legado `superadmin` administran el módulo. No hace falta cambiar cuentas, JWT ni registros existentes.

## Operación

- **Control y reportes**: por defecto muestra hoy en `America/Mexico_City`. Incluye personal activo aunque no haya checado. Los indicadores representan jornadas del rango, no personas únicas. Consulta hasta 31 días, busca por nombre y filtra por trabajador o estado. La tabla pagina 100 filas; CSV exporta todo el resultado filtrado y neutraliza fórmulas de hojas de cálculo. Las horas ISO del CSV están en UTC; interfaz y clasificación usan México.
- **Registrar asistencia**: conserva entrada y salida, GPS reciente, precisión máxima de 100 m, radio de 100 m y hora del servidor. Una entrada por trabajador y fecha mediante índice único; salida mediante actualización condicional atómica. Se permite registrar asistencia en descansos para no perder evidencia de trabajo extraordinario.
- **Horarios**: selecciona trabajador, vigencia, días de la semana, entrada/salida y tolerancia de 0 a 180 minutos. Días desmarcados son descanso. Sin horario configurado se muestra ese estado y no se genera falta. La vigencia permite cambiar horarios sin afectar automáticamente fechas anteriores.
- **Calendario**: festivos y no laborables generales o individuales, jornadas excepcionales con horas específicas y ausencias justificadas individuales. Toda excepción tiene rango inclusivo y motivo obligatorio.
- **Auditoría**: versiones de configuración con autor, motivo y fecha; últimas 500 versiones. Evidencia GPS de las últimas 100 jornadas con responsables de entrada/salida. Los registros anteriores siguen disponibles, aunque no contienen evidencia GPS de salida ni autor si se crearon antes de esta versión.
- **Trabajador**: ve su jornada, el reloj GPS y solo su historial. El servidor impone la ficha de la sesión también en CSV aunque el cliente envíe otro identificador. No puede acceder a horarios de otros trabajadores, configuración ni auditoría.

## Reglas de cálculo

1. El horario con fecha de inicio más reciente aplicable al día define el turno. Si coinciden las fechas, prevalece la versión creada más recientemente.
2. Una excepción individual prevalece sobre una general. Entre excepciones del mismo alcance prevalece la fecha de inicio más reciente; a igual inicio, la versión más reciente. Para sustituir una regla agrega una nueva con el mismo inicio y alcance. Para hacer laborable un festivo, registra una jornada excepcional con horas y el alcance correspondiente.
3. Hasta la entrada más tolerancia: programado. Después del margen y antes de terminar el turno: pendiente. Al terminar el turno sin entrada: ausente. Un día pasado laborable sin entrada es ausente. Un día futuro nunca es falta.
4. Entrada registrada: trabajando; con salida: finalizado. Retardo se muestra por separado, incluso al finalizar. Se calcula por minuto local, descontando la tolerancia. Descansos, festivos y justificaciones nunca generan faltas.
5. Duración trabajada es tiempo real entre entrada y salida; no descuenta comida ni representa un cálculo de nómina.

## Persistencia y límites

Nueva colección `planasistencias` con índice por trabajador/vigencia. Mongoose crea colección e índice al utilizar el modelo conforme a la configuración de índices del entorno. Los campos de autor y GPS de salida en `asistencias` son opcionales para conservar compatibilidad. No hay migración destructiva ni modificación de registros existentes.

Las versiones son inmutables mediante la API: no existen rutas de edición o eliminación. La escritura de una configuración y su evidencia de auditoría son el mismo documento, sin riesgo de guardar el cambio y perder su autor. Agregar una versión con vigencia retroactiva recalcula el reporte de ese período y queda documentado; las checadas originales no se modifican. Las justificaciones son excepciones, no sustituciones de la hora real de una checada.

Se soporta un turno por día civil, con salida posterior a entrada dentro del mismo día. No se admiten turnos nocturnos que crucen medianoche. Se conserva el límite original de una entrada/salida diaria. El personal inactivo aparece únicamente cuando tiene registros en el período; no se reconstruyen altas/bajas históricas anteriores al módulo. No se aceptan marcas GPS del cliente como una prueba criptográfica contra suplantación del dispositivo; se conservan los controles de ubicación del sistema existente.

## Validación

```sh
cd backend
npm ci
npm test
cd ../frontend
npm ci
npm test
npm run build
npm run test:ui
```

Playwright usa Chrome instalado en desarrollo y Chromium en CI (`npx playwright install --with-deps chromium`). Sus pruebas recorren la app completa con respuestas HTTP de prueba, en escritorio y móvil; las pruebas del backend recorren Express/RBAC con modelos simulados. No requieren credenciales ni modifican una base real. La validación con MongoDB y GPS reales requiere el entorno desplegado y un dispositivo en la zona; no está cubierta por los dobles de prueba.

No se modifican variables de entorno existentes: backend utiliza su conexión MongoDB y JWT actuales; frontend `VITE_API_URL`. Las respuestas del módulo conservan `Cache-Control: no-store`.
