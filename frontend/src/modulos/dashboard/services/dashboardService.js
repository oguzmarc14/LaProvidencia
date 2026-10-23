import { solicitarApi } from "../../../services/api";

export const obtenerResumenDashboard = () => solicitarApi("/api/dashboard/resumen");
