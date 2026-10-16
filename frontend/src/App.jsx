import { useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import SeccionDashboard from "./modulos/dashboard/pages/SeccionDashboard";
import SeccionTrabajadores from "./modulos/trabajadores/pages/SeccionTrabajadores";

export default function App() {
  const [seccion, setSeccion] = useState("dashboard");
  return (
    <MainLayout actual={seccion} navegar={setSeccion}>
      {seccion === "dashboard" ? (
        <SeccionDashboard navegar={setSeccion}/>
      ) : (
        <SeccionTrabajadores/>
      )}
    </MainLayout>
  );
}
