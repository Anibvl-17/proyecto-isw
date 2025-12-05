import { useEffect, useState } from "react";
import { useAuth } from "@context/AuthContext";
import { getInscription} from "@services/inscription.service";

import { showErrorAlert } from "@helpers/sweetAlert";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Inscription } from "@components/Inscription";
import { Badge } from "@components/Badge";

const Inscriptions = () => {
  const [loading, setLoading] = useState(false);
  const [inscriptions, setInscriptions] = useState([]);

  const [pendingCounter, setPendingCounter] = useState(0);
  const [approvedCounter, setApprovedCounter] = useState(0);
  const [rejectedCounter, setRejectedCounter] = useState(0);

  const [showPending, togglePending] = useState(true);
  const [showApproved, toggleApproved] = useState(true);
  const [showRejected, toggleRejected] = useState(true);

  const { user } = useAuth();
  const isAlumno = user.role === "alumno";

  const fetchData = async () => {
    try {
      setLoading(true);
      setPendingCounter(0);
      setApprovedCounter(0);
      setRejectedCounter(0);

      const result = await getInscription();
      if (result.success) {
        // Ordenar por estado
        const sorted = result.data.sort((a, b) => {
          const order = { pendiente: 1, aprobado: 2, rechazado: 3 };
          return order[a.estado] - order[b.estado];
        });

        setInscriptions(sorted);

        // Contadores
        setPendingCounter(sorted.filter(inscription => inscription.estado === "pendiente").length);
        setApprovedCounter(sorted.filter(inscription => inscription.estado === "aprobado").length);
        setRejectedCounter(sorted.filter(inscription => inscription.estado === "rechazado").length);
      }
    } catch (error) {
      showErrorAlert("Error", "No se pudieron cargar las inscripciones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const badgeAction = (id) => {
    if (id === "pending-counter") togglePending((prev) => !prev);
    if (id === "approved-counter") toggleApproved((prev) => !prev);
    if (id === "rejected-counter") toggleRejected((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col p-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">

          {/* HEADER */}
          <div>
            <h1 className="font-bold text-2xl">Gestión de Inscripciones</h1>
            <p className="text-gray-600">
              {isAlumno
                ? "Revisa el estado de tus inscripciones"
                : "Revisa y gestiona las solicitudes de inscripción"}
            </p>
          </div>

          {/* BADGES */}
          <div className="flex gap-4">
            {pendingCounter > 0 && (
              <Badge type="pending" text={`${pendingCounter} pendientes`} callback={badgeAction} badgeId="pending-counter" canToggleActive />
            )}
            {approvedCounter > 0 && (
              <Badge type="success" text={`${approvedCounter} aprobadas`} callback={badgeAction} badgeId="approved-counter" canToggleActive />
            )}
            {rejectedCounter > 0 && (
              <Badge type="error" text={`${rejectedCounter} rechazadas`} callback={badgeAction} badgeId="rejected-counter" canToggleActive />
            )}
          </div>

          {/* VISTA ALUMNO */}
          {isAlumno && inscriptions.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold">Mis Inscripciones</h3>
              {inscriptions.map(inscription => {
                if (inscription.estado === "pendiente" && showPending) {
                  return (
                    <Inscription
                      key={inscription.id}
                      inscription={inscription}
                      onActionSuccess={fetchData}
                    />
                  );
                }

                // Si es aprobado y el filtro approved está activo -> mostrar
                if (inscription.estado === "aprobado" && showApproved) {
                  return (
                    <Inscription
                      key={inscription.id}
                      inscription={inscription}
                      onActionSuccess={fetchData}
                    />
                  );
                }

                // Si es rechazado y el filtro rejected está activo -> mostrar
                if (inscription.estado === "rechazado" && showRejected) {
                  return (
                    <Inscription
                      key={inscription.id}
                      inscription={inscription}
                      onActionSuccess={fetchData}
                    />
                  );
                }

                // Si no cumple ninguno, no renderiza nada
                return null;
              })}
            </div>
          )}

          {/* VISTA DOCENTE */}
          {!loading && !isAlumno && inscriptions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Listado de Inscripciones</h3>
                <div className="w-full overflow-auto border border-gray-400 rounded-lg">
                  <table className="w-full caption-bottom text-sm overflow-x-scroll">
                    <thead className="border-b border-gray-400">
                      <tr>
                        <th className="min-w-28 h-12 px-4 text-left align-middle font-medium">
                          Estudiante
                        </th>
                        <th className="min-w-10 h-12 px-4 text-left align-middle font-medium">
                          Electivo
                        </th>
                        <th className="min-w-10 h-12 px-4 text-left align-middle font-medium">
                          Fechas
                        </th>
                        <th className="min-w-10 h-12 px-4 text-center align-middle font-medium">
                          Estado
                        </th>
                        <th className="min-w-10 h-12 px-4 text-center align-middle font-medium">
                          Detalles
                        </th>
                        <th className="min-w-10 h-12 px-4 text-center align-middle font-medium">
                          Acciones
                        </th>
                      </tr>
                      
                    </thead>
                    <tbody>
                      {inscriptions.map((inscription) => {
                        if (inscription.estado === "pendiente" && showPending) return <Inscription key={inscription.id} inscription={inscription} onActionSuccess={fetchData}/>;
                        if (inscription.estado === "aprobado" && showApproved) return <Inscription key={inscription.id} inscription={inscription} onActionSuccess={fetchData}/>;
                        if (inscription.estado === "rechazado" && showRejected) return <Inscription key={inscription.id} inscription={inscription} onActionSuccess={fetchData}/>;
                          return null;
                      })}
                    </tbody>
                  </table>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Inscriptions;
