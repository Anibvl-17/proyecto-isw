import { getRequests, createRequest } from "@services/request.service";
import { showErrorAlert } from "@helpers/sweetAlert";
import { useAuth } from "@context/AuthContext";
import { Sidebar } from "@components/Sidebar";
import { Request } from "@components/Request";
import { Header } from "@components/Header";
import { Badge } from "@components/Badge";
import { CheckCircle, MessageSquareDashedIcon, MessageSquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// Pendiente:
// - Controlar la cantidad de solicitudes mostradas (10 o 20 por página)
const Requests = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showPending, togglePending] = useState(true);
  const [showApproved, toggleApproved] = useState(true);
  const [showRejected, toggleRejected] = useState(true);
  const [pendingCounter, setPendingCounter] = useState(0);
  const [approvedCounter, setApprovedCounter] = useState(0);
  const [rejectedCounter, setRejectedCounter] = useState(0);
  const { user } = useAuth();
  const isAlumno = user.role === "alumno";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setPendingCounter(0);
      setApprovedCounter(0);
      setRejectedCounter(0);

      const result = await getRequests();

      if (result.success) {
        if (!result.data || result.data.length === 0) {
          setRequests([]);
          return;
        }
        setRequests(result.data);

        result.data.forEach((request) => {
          if (request.status === "pendiente") {
            setPendingCounter((prev) => prev + 1);
          } else if (request.status === "aprobado") {
            setApprovedCounter((prev) => prev + 1);
          } else {
            setRejectedCounter((prev) => prev + 1);
          }
        });
      }
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Verificar periodos a la hora de inscribir:
  // - Permitir solicitud a un mismo electivo pero en distinto periodo
  const handleCreateRequest = async () => {
    try {
      const formValues = await createRequestDialog();
      if (!formValues) return;

      console.log(formValues);
      const createRequestResponse = await createRequest(formValues);

      if (createRequestResponse.success) {
        Swal.fire({
          toast: true,
          title: "Solicitud creada exitosamente",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
          position: "bottom-end",
          showConfirmButton: false,
        });
        await fetchRequests();
      } else {
        showErrorAlert("Error", createRequestResponse.message);
      }
    } catch (error) {
      console.error("Error al crear solicitud", error);
      showErrorAlert("Error", "No se pudo crear la solicitud");
    }
  };

  const badgeAction = (id) => {
    if (id === "pending-counter") {
      togglePending((prev) => !prev);
    } else if (id === "approved-counter") {
      toggleApproved((prev) => !prev);
    } else if (id === "rejected-counter") {
      toggleRejected((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col p-4">
        {/* Contenido de la página */}
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">
          {/* Titulo, descripción y boton de agregar solicitud */}
          <div className="flex flex-row flex-1 justify-between items-center">
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl">Solicitudes</h1>
              <p className="text-gray-600">
                {isAlumno
                  ? "Solicita inscripciones excepcionales fuera del período, en electivos sin cupos o con pre-requisitos pendientes."
                  : "Revisa y responde las solicitudes de inscripción excepcionales"}
              </p>
            </div>
            {isAlumno && (
              <button
                onClick={handleCreateRequest}
                className="bg-green-700 text-white font-medium text-sm px-4 py-2 flex flex-row items-center gap-3 rounded-lg transition-all hover:shadow-md hover:bg-green-700/90 active:bg-green-700/80 active:scale-95 active:shadow-md"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Nueva Solicitud
              </button>
            )}
          </div>

          {/* Badges con la cantidad de solicitudes */}
          <div className="flex flex-row flex-1 gap-4 justify-start items-center">
            {loading && <Badge text="Cargando" />}

            {requests.length === 0 && (
              <p className="text-gray-600 italic w-full flex flex-row gap-3 items-center">
                Haz click en el botón
                <span className="text-gray-600 border border-dashed border-gray-400 font-medium text-sm px-4 py-2 flex flex-row items-center gap-3 rounded-lg">
                  <MessageSquarePlus className="h-4 w-4" />
                  Nueva Solicitud
                </span>
                para crear una solicitud de inscripción
              </p>
            )}

            {pendingCounter > 0 && (
              <Badge
                type="pending"
                text={pendingCounter + " " + (pendingCounter > 1 ? "pendientes" : "pendiente")}
                callback={!isAlumno && badgeAction}
                badgeId="pending-counter"
                canToggleActive={!isAlumno && true}
              />
            )}

            {approvedCounter > 0 && (
              <Badge
                type="success"
                text={approvedCounter + " " + (approvedCounter > 1 ? "aprobadas" : "aprobada")}
                callback={!isAlumno && badgeAction}
                badgeId="approved-counter"
                canToggleActive={!isAlumno && true}
              />
            )}

            {rejectedCounter > 0 && (
              <Badge
                type="error"
                text={rejectedCounter + " " + (rejectedCounter > 1 ? "rechazadas" : "rechazada")}
                callback={!isAlumno && badgeAction}
                badgeId="rejected-counter"
                canToggleActive={!isAlumno && true}
              />
            )}
          </div>

          {/* Cards con solicitudes para alumno */}
          {!loading && isAlumno && requests.length > 0 && (
            <div className="flex flex-row flex-wrap gap-6 ">
              {/* Solicitudes pendientes */}
              <div className="flex-2">
                <h3 className="text-xl font-semibold mb-4">Solicitudes pendientes</h3>
                <div className="flex flex-col gap-3">
                {pendingCounter > 0 ? (
                  requests.map((request) => {
                    if (request.status === "pendiente")
                      return <Request key={request.id} request={request} />;
                  })
                ) : (
                  <p className="text-gray-600 italic w-full flex flex-row gap-3 items-center">
                    Haz click en el botón
                    <span className="text-gray-600 border border-dashed border-gray-400 font-medium text-sm px-4 py-2 flex flex-row items-center gap-3 rounded-lg">
                      <MessageSquarePlus className="h-4 w-4" />
                      Nueva Solicitud
                    </span>
                    para crear una solicitud de inscripción
                  </p>
                )}
                </div>
              </div>

              {/* Historial de solicitudes */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Historial de solicitudes</h3>
                <div className="flex flex-col gap-2">
                {approvedCounter > 0 || rejectedCounter > 0 ? (
                  requests.map((request) => {
                    if (request.status !== "pendiente")
                      return <Request key={request.id} request={request} isCompact={true} />;
                  })
                ) : (
                  <p className="text-gray-600 italic flex flex-row gap-2 items-center">
                    <MessageSquareDashedIcon className="h-5 w-5" /> Las solicitudes revisadas
                    aparecerán aquí
                  </p>
                )}
                </div>
              </div>
            </div>
          )}

          {/* Tabla con solicitudes para jefe de carrera */}
          {(!loading && !isAlumno && requests.length > 0 && (
            <div className="flex flex-row flex-wrap gap-6">
              {/* Tabla de solicitudes pendientes */}
              <div className="flex-2">
                <h3 className="text-xl font-semibold mb-4">Listado de solicitudes</h3>
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
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => {
                        if (request.status === "pendiente" && showPending)
                          return <Request key={request.id} request={request} fetchCallback={fetchRequests}/>;

                        if (request.status === "aprobado" && showApproved)
                          return <Request key={request.id} request={request} />;

                        if (request.status === "rechazado" && showRejected)
                          return <Request key={request.id} request={request} />;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )) ||
            (requests.length === 0 && (
              <p className="text-gray-600 italic w-full flex flex-row gap-3 items-center">
                <CheckCircle className="h-5 w-5" /> No hay solicitudes por revisar
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

async function createRequestDialog() {
  const { value: formValues } = await Swal.fire({
    html:
      '<div class="text-start">' +
      '<p class="font-bold text-md mb-1">Crear solicitud</p>' +
      '<p class="text-sm text-gray-500">Completa la información para crear una nueva solicitud.</p>' +
      '<div class="flex flex-col gap-4 mt-4">' +
      // Input Electivo
      '<div class="flex flex-col gap-0.5">' +
      '<label for="elective" class="text-sm font-medium">Electivo a Inscribir</label>' +
      '<select id="elective" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">' +
      '<option value="1" selected>PL/SQL</option>' +
      '<option value="2">Machine Learning</option>' +
      '<option value="3">Ciberseguridad</option>' +
      "</select>" +
      "</div>" +
      // Input Descripción
      '<div class="flex flex-col gap-0.5">' +
      '<label for="description" class="text-sm font-medium">Motivo de la Solicitud</label>' +
      '<textarea id="description" placeholder="Explica por qué deseas inscribir este electivo..." class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700" autocomplete></textarea> ' +
      "</div>" +
      // Fin formulario
      "</div>" +
      "</div>" +
      "</div>",
    confirmButtonText: "Crear solicitud",
    confirmButtonColor: "oklch(52.7% 0.154 150.069)",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    showCloseButton: true,
    preConfirm: () => {
      const electiveId = parseInt(document.getElementById("elective").value.trim());
      const description = document.getElementById("description").value.trim();

      if (!description) {
        Swal.showValidationMessage("La descripción es obligatoria");
        return false;
      }

      if (description.length < 2 || description.length > 300) {
        Swal.showValidationMessage("La descripción debe contener entre 5 y 300 caracteres");
        return false;
      }

      return { electiveId, description };
    },
  });

  if (formValues) {
    return {
      electiveId: formValues.electiveId,
      description: formValues.description,
    };
  }

  return null;
}

export default Requests;
