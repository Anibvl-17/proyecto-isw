import { useAuth } from "@context/AuthContext";
import { deleteInscription, updateStatus } from "@services/inscription.service";
import {
  showErrorAlert,
  showSuccessToast,
  showConfirmAlert,
} from "@helpers/sweetAlert";
import { Badge } from "@components/Badge";
import { Calendar, CalendarCheck, Eye, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import axios from "@services/root.service";
import { useEffect, useState } from "react";
import { getUserById } from "@services/user.service"; // <- traer user

/* 
  Componente para mostrar las inscripciones según rol.
  - Alumnos: tarjeta (tr) con info y opción eliminar si está pendiente.
  - Docente: tarjeta (tr) con fila de tabla y opción revisar.
*/
export function Inscription({
  inscription,
  onActionSuccess,
  isCompact = false,
}) {
  const [loading, setLoading] = useState(false);
  const [elective, setElective] = useState(null);
  const [student, setStudent] = useState(null);
  const { user } = useAuth();

  const isAlumno = user.role === "alumno";
  const isDocente = user.role === "docente";

  const studentId = inscription.userId;
  const electiveId = inscription.electiveId;

  async function getElectiveById(id) {
    try {
      const response = await axios.get(`/electives/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error en getElectiveById:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al conectar",
      };
    }
  }

  const fetchElectiveById = async () => {
    if (!electiveId) return;
    try {
      setLoading(true);
      const result = await getElectiveById(electiveId);
      if (result.success) setElective(result.data);
    } catch (error) {
      console.error("Error al obtener el electivo en Inscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentById = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const result = await getUserById(studentId);
      if (result.success) setStudent(result.data);
    } catch (error) {
      console.error("Error al obtener usuario en Inscription:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectiveById();
    fetchStudentById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers visuales
  const getBadgeType = () => {
    if (inscription.estado === "pendiente") return "pending";
    if (inscription.estado === "aprobado") return "success";
    return "error";
  };

  const getBadgeText = () => {
    if (inscription.estado === "pendiente") return "Pendiente";
    if (inscription.estado === "aprobado") return "Aprobada";
    return "Rechazada";
  };

  // Eliminar inscripcion (Solo Alumno)
  const handleDelete = () => {
    showConfirmAlert(
      "¿Estás seguro?",
      "Esta acción eliminará tu solicitud de inscripción permanentemente.",
      "Sí, eliminar",
      async () => {
        try {
          const result = await deleteInscription(inscription.id);
          if (result.success) {
            showSuccessToast("Inscripción eliminada correctamente");
            if (onActionSuccess) onActionSuccess(inscription.id);
          } else {
            showErrorAlert("Error", result.message);
          }
        } catch (error) {
          showErrorAlert(
            "Error",
            "Ocurrió un error al intentar eliminar.",
            error
          );
        }
      }
    );
  };

  // Revisar inscripcion (Solo docente)
  const handleViewDetails = async () => {
    try {
      const formValues = await inscriptionDetailsDialog(
        inscription,
        student,
        elective,
        isAlumno
      );
      if (!formValues) return;

      const result = await updateStatus(inscription.id, formValues);

      if (result.success) {
        const toastText =
          formValues.estado === "aprobado"
            ? "Solicitud aprobada exitosamente"
            : "Solicitud rechazada exitosamente";
        Swal.fire({
          toast: true,
          title: toastText,
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
          position: "bottom-end",
          showConfirmButton: false,
        });
        onActionSuccess();
      } else {
        showErrorAlert("Error", "No se pudo revisar la inscripcion.");
      }
    } catch (error) {
      console.error("Error al obtener detalles de la inscripcion:", error);
      showErrorAlert(
        "Error",
        "No se pudo obtener los detalles de la inscripcion"
      );
    }
  };

  // Vista del A lumno (CARD) 
  const trAlumno = () => (
    <div className="border border-gray-300 px-6 py-4 rounded-md transition-all hover:shadow-md hover:border-gray-400 flex flex-row justify-between items-center mb-4 bg-white">
      <div>
        <div className="flex flex-row gap-4 justify-start items-center mb-2">
          <span className="font-semibold text-lg">
            {elective?.name || "Electivo Desconocido"}
          </span>
          <Badge type={getBadgeType()} text={getBadgeText()} showIcon={true} />
        </div>

        {!isCompact && (
          <div className="text-sm flex flex-row gap-2 items-center text-gray-500 mb-1">
            <Calendar className = "h-4 w-4" /> Solicitado el{" "}
            {dateFormatter(inscription.createdAt)}
          </div>
        )}

        {inscription.estado !== "pendiente" && (
          <div className="text-sm flex flex-row gap-2 items-center text-gray-500">
            <CalendarCheck className = "h-4 w-4" /> Revisada el{" "}
            {dateFormatter(inscription.reviewedAt)}
          </div>
        )}

        {inscription.motivo_rechazo && (
          <div className="mt-2 p-3 rounded-md border border-red-400 bg-red-50 text-red-700 line-clamp-2 break-all overflow-hidden">
            <strong>Motivo rechazo:</strong> {inscription.motivo_rechazo}
          </div>
        )}
      </div>

      {/* Botón Eliminar (Solo si está pendiente y es alumno) */}
      {isAlumno && inscription.estado === "pendiente" && (
        <div>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Eliminar solicitud"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  // Vista docente (CARD)
  const trDocente = () => (
    <tr className="border-b border-gray-300 px-1 py-1 transition-all hover:bg-gray-100 last:border-0">
      {/* Estudiante */}
      <td className="min-w-8 p-4 align-middle">
        <div className="flex-1 flex flex-col items-start justify-between">
          <span className="font-medium text-sm">
            {student.username || "Desconocido"}
          </span>
          <span className="text-gray-500 text-sm">{student.rut || "-"}</span>
        </div>
      </td>

      {/* Electivo */}
      <td className="min-w-8 p-4 align-middle">
        <span className="text-sm font-semibold">{elective.name || "-"}</span>
      </td>

      {/* Fecha */}
      <td className="min-w-8 p-4 align-middle">
        <div className="flex flex-col">
          {inscription.estado === "pendiente" ? (
            <span className="text-sm flex flex-row gap-2 items-center text-gray-500 mb-1">
              <Calendar className="h-4 w-4" /> Solicitado el{" "}
              {dateFormatter(elective.createdAt)}
            </span>
          ) : (
            <span className="text-sm flex flex-row gap-2 items-center text-gray-500">
              <CalendarCheck className="h-4 w-4" /> Revisada el{" "}
              {dateFormatter(inscription.reviewedAt)}
            </span>
          )}
        </div>
      </td>

      {/* Estado */}
      <td className="min-w-8 p-4 align-middle text-center">
        <td className="flex justify-center items-center">
          <Badge type={getBadgeType()} text={getBadgeText()} showIcon={true} />
        </td>
      </td>

      {/* Motivo de rechazo (si hay) */}
      <td className="min-w-8 p-4 align-middle">
        {inscription.motivo_rechazo && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-400 max-w-xs">
            <strong>Motivo:</strong>
            <p className="line-clamp-1 overflow-hidden text-ellipsis break-all">
              {inscription.motivo_rechazo}
            </p>
          </div>
        )}
      </td>

      {/* Acciones */}
      <td className="min-w-8 p-4 align-middle">
        <div className="flex items-center justify-center">
          <button
            onClick={handleViewDetails}
            className="px-3 py-0.5 text-sm flex-1 flex items-center justify-center gap-2 rounded-2xl text-gray-800 font-semibold border transition-all border-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:bg-blue-700 active:border-blue-700 active:text-gray-200 active:scale-95"
          >
            <Eye className="h-4 w-4" /> Ver
          </button>
        </div>
      </td>
    </tr>
  );

  // Estado de carga
  if (loading || (isAlumno ? !elective : !elective || !student)) {
    if (isAlumno) return <p>Cargando...</p>;
    return (
      <tr>
        <td>Cargando...</td>
      </tr>
    );
  }

  if (isAlumno) return trAlumno();
  if (isDocente) return trDocente();

  return null;
}

function dateFormatter(date) {
  if (!date) return "-";
  const dateObject = new Date(date);
  return dateObject.toLocaleString();
}

async function inscriptionDetailsDialog(
  inscription,
  student,
  elective,
  isAlumno
) {
  const { value: formValues } = await Swal.fire({
    html:
      '<div class="text-start">' +
      '<p class="font-semibold text-xl mb-1 text-black">Detalle de la Solicitud</p>' +
      '<p class="text-sm text-gray-600">' +
      "Solicitud creada el " +
      dateFormatter(inscription.createdAt) +
      "</p>" +
      '<p class="text-sm mb-2 text-gray-600">' +
      (inscription.estado !== "pendiente"
        ? "Solicitud revisada el " + dateFormatter(inscription.reviewedAt)
        : "Solicitud aún no revisada") +
      "</p>" +
      '<div class="flex flex-col gap-2 mt-4">' +
      // Informacion estudiante
      (!isAlumno
        ? '<p class="font-bold text-sm text-gray-800">' +
          "Información del Estudiante" +
          "</p>" +
          '<div class="bg-blue-50 border border-blue-200 rounded-md p-2 flex flex-col gap-1 mb-3">' +
          '<p class="text-sm text-gray-800">' +
          '<span class="text-gray-600">Nombre: </span>' +
          '<span class="font-semibold">' +
          student.username +
          "</span>" +
          "</p>" +
          '<p class="text-sm text-gray-800">' +
          '<span class="text-gray-600">RUT: </span>' +
          '<span class="font-semibold">' +
          student.rut +
          "</span>" +
          "</p>" +
          '<p class="text-sm text-gray-800">' +
          '<span class="text-gray-600">Email: </span>' +
          '<span class="font-semibold">' +
          student.email +
          "</span>" +
          "</p>" +
          "</div>"
        : "") +
      // Infoormacion electivo
      '<p class="font-bold text-sm text-gray-800">' +
      "Información del Electivo" +
      "</p>" +
      '<div class="bg-blue-50 rounded-md p-2 flex flex-col gap-1 border border-blue-200 mb-3">' +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Nombre: </span>' +
      '<span class="font-semibold">' +
      elective.name +
      "</span>" +
      "</p>" +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Cupos: </span>' +
      '<span class="font-semibold">' +
      elective.quotas +
      "</span>" +
      "</p>" +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Prerrequisitos: </span>' +
      '<span class="font-semibold">' +
      `${elective.prerrequisites || 'Ninguno'}` +
      "</span>" +
      "</p>" +
      "</div>" +
      // Motivo de rechazo si es que fue rechazada
      (inscription.estado === "rechazado"
        ? '<div class="flex flex-col gap-1">' +
          '<p class="font-bold text-sm text-gray-800 mb-2">' +
          "Motivo de rechazo" +
          "</p>" +
          '<div class="p-2 text-sm text-gray-800 border bg-red-50 border-red-200 rounded-md">' +
          inscription.motivo_rechazo +
          "</div>" +
          "</div>"
        : "") +
      "</div>" +
      "</div>" +
      "</div>",
    showConfirmButton: inscription.estado === "pendiente",
    confirmButtonText: "Aprobar",
    confirmButtonColor: "oklch(52.7% 0.154 150.069)",
    showDenyButton: inscription.estado === "pendiente",
    denyButtonText: "Rechazar",
    denyButtonColor: "oklch(50.5% 0.213 27.518)",
    showCancelButton: true,
    cancelButtonText: "Volver",
    showCloseButton: true,
    preConfirm: () => {
      const estado = "aprobado";

      return { estado };
    },
    preDeny: async () => {
      const estado = "rechazado";
      const reviewComment = await reviewCommentDialog();

      if (!reviewComment) return false;

      return { estado, reviewComment };
    },
  });

  if (formValues) {
    return {
      estado: formValues.estado,
      motivo_rechazo: formValues.reviewComment,
    };
  }
}

async function reviewCommentDialog() {
  const { value: formValues } = await Swal.fire({
    html:
      '<div class="text-start flex flex-col gap-2">' +
      '<p class="font-semibold text-xl mb-1 text-black">Motivo de rechazo</p>' +
      '<label for="description" class="text-sm text-gray-600">Escriba el motivo de rechazo de la solicitud</label>' +
      '<textarea class="text-sm p-2 border border-gray-300 outline-0 transition-all focus:border-blue-300" id="description"></textarea>' +
      "</div>",
    confirmButtonText: "Guardar comentario",
    confirmButtonColor: "oklch(48.8% 0.243 264.376)",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    showCloseButton: true,
    preConfirm: () => {
      const reviewComment = document.getElementById("description").value.trim();
      if (!reviewComment) {
        Swal.showValidationMessage("El comentario es obligatorio");
        return false;
      }
      if (reviewComment.length < 5 || reviewComment.length > 300) {
        Swal.showValidationMessage(
          "El comentario debe contener entre 5 y 300 caracteres"
        );
        return false;
      }
      return reviewComment;
    },
  });

  return formValues;
}

export default Inscription;
