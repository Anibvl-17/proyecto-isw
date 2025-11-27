import { useAuth } from "@context/AuthContext";
import { Badge } from "@components/Badge";
import { Calendar, Pencil, Trash2, Eye, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export function Elective({ 
  elective, 
  isCompact = false, 
  onEdit, 
  onDelete 
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isAlumno = user.role === "alumno";
  const isDocente = user.role === "docente";
  const isJefeCarrera = user.role === "jefe_carrera";

  // Verificar si el docente es dueño del electivo
  const isOwner = isDocente && elective.teacherRut === user.rut;

  const getBadgeType = () => {
    if (elective.status === "Pendiente") {
      return "pending";
    } else if (elective.status === "Aprobado") {
      return "success";
    } else {
      return "error";
    }
  };

  const getBadgeText = () => {
    if (elective.status === "Pendiente") {
      return "Pendiente";
    } else if (elective.status === "Aprobado") {
      return "Aprobado";
    } else {
      return "Rechazado";
    }
  };

  const handleViewDetails = async () => {
    try {
      await electiveDetailsDialog(elective, isAlumno, isJefeCarrera);
    } catch (error) {
      console.error("Error al mostrar detalles del electivo:", error);
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(elective);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(elective);
  };

  // Tarjetas para alumnos
  const cardAlumno = () => {
    return (
      <div className="border border-gray-300 px-6 py-4 rounded-md transition-all hover:shadow-md hover:border-gray-400">
        <div className="flex flex-row justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-row gap-4 justify-start items-center mb-2">
              <span className="font-semibold text-lg">{elective.name}</span>
              <Badge type={getBadgeType()} text={getBadgeText()} showIcon={false} />
            </div>

            {!isCompact && (
              <div className="text-sm text-gray-600 mb-3">{elective.description}</div>
            )}

            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <div className="flex flex-row gap-2 items-center">
                <Calendar className="h-4 w-4" />
                <span>Horario: {elective.schedule}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Users className="h-4 w-4" />
                <span>Cupos: {elective.quotas}</span>
              </div>
            </div>

            {!isCompact && elective.objectives && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700">Objetivos:</p>
                <p className="text-sm text-gray-600">{elective.objectives}</p>
              </div>
            )}
            {!isCompact && elective.prerrequisites && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700">Prerrequisitos:</p>
                <p className="text-sm text-gray-600">{elective.prerrequisites}</p>
              </div>
            )}
          </div>

          {isCompact && (
            <button
              onClick={handleViewDetails}
              className="px-3 py-1.5 text-sm flex items-center justify-center gap-2 rounded-lg text-gray-800 font-medium border transition-all border-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:bg-blue-700 active:scale-95"
            >
              <Eye className="h-4 w-4" /> Ver más
            </button>
          )}
        </div>
      </div>
    );
  };

  const trTable = () => {
    return (
      <tr className="border-b border-gray-200 last:border-0 transition-all hover:bg-gray-50">
        <td className="px-4 py-3 align-middle">
          <span className="font-medium text-sm">{elective.name}</span>
        </td>

        <td className="px-4 py-3 align-middle">
          <span className="text-sm text-gray-700 line-clamp-2">
            {elective.description}
          </span>
        </td>

        <td className="px-4 py-3 align-middle">
          <span className="text-sm text-gray-700">{elective.schedule}</span>
        </td>

        <td className="px-4 py-3 align-middle text-center">
          <span className="text-sm font-medium">{elective.quotas}</span>
        </td>

        <td className="px-4 py-3 align-middle">
          <div className="flex items-center justify-center">
            <Badge type={getBadgeType()} text={getBadgeText()} showIcon={false} />
          </div>
        </td>

        {isDocente && (
          <td className="px-4 py-3 align-middle">
            <div className="flex flex-row gap-2 justify-center items-center">
              {isOwner ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="text-blue-700 hover:text-blue-900 transition-colors"
                    title="Editar electivo"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Eliminar electivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">No editable</span>
              )}
            </div>
          </td>
        )}

        {isJefeCarrera && (
          <td className="px-4 py-3 align-middle">
            <div className="flex justify-center">
              <button
                onClick={handleViewDetails}
                className="px-3 py-1 text-sm flex items-center gap-2 rounded-lg text-gray-800 font-medium border border-gray-400 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 active:bg-blue-700 active:scale-95"
              >
                <Eye className="h-4 w-4" /> Ver
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  };

  if (loading) {
    if (isAlumno) return <p className="text-gray-500 text-sm">Cargando...</p>;
    return (
      <tr>
        <td colSpan="6" className="text-center py-4 text-gray-500 text-sm">
          Cargando...
        </td>
      </tr>
    );
  }

  if (isAlumno) {
    return cardAlumno();
  } else if (isDocente || isJefeCarrera) {
    return trTable();
  }

  return null;
}

async function electiveDetailsDialog(elective, isAlumno, isJefeCarrera) {
  await Swal.fire({
    html:
      '<div class="text-start">' +
      '<p class="font-semibold text-xl mb-1 text-black">Detalles del Electivo</p>' +
      '<p class="text-sm text-gray-600 mb-4">' +
      "Creado el " +
      dateFormatter(elective.createdAt) +
      "</p>" +
      '<div class="flex flex-col gap-3">' +
      '<div class="bg-blue-50 border border-blue-200 rounded-md p-3">' +
      '<p class="font-bold text-sm text-gray-800 mb-2">Información General</p>' +
      '<div class="flex flex-col gap-2">' +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Nombre: </span>' +
      '<span class="font-semibold">' +
      elective.name +
      "</span>" +
      "</p>" +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Estado: </span>' +
      '<span class="font-semibold">' +
      elective.status +
      "</span>" +
      "</p>" +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Horario: </span>' +
      '<span class="font-semibold">' +
      elective.schedule +
      "</span>" +
      "</p>" +
      '<p class="text-sm text-gray-800">' +
      '<span class="text-gray-600">Cupos: </span>' +
      '<span class="font-semibold">' +
      elective.quotas +
      "</span>" +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div>' +
      '<p class="font-bold text-sm text-gray-800 mb-2">Descripción</p>' +
      '<div class="p-3 text-sm text-gray-800 border bg-gray-50 border-gray-200 rounded-md">' +
      elective.description +
      "</div>" +
      "</div>" +
      '<div>' +
      '<p class="font-bold text-sm text-gray-800 mb-2">Objetivos</p>' +
      '<div class="p-3 text-sm text-gray-800 border bg-gray-50 border-gray-200 rounded-md">' +
      (elective.objectives || "No especificados") +
      "</div>" +
      "</div>" +
      '<div>' +
      '<p class="font-bold text-sm text-gray-800 mb-2">Prerrequisitos</p>' +
      '<div class="p-3 text-sm text-gray-800 border bg-gray-50 border-gray-200 rounded-md">' +
      (elective.prerrequisites || "Ninguno") +
      "</div>" +
      "</div>" +
      (isJefeCarrera
        ? '<div class="bg-purple-50 border border-purple-200 rounded-md p-3">' +
          '<p class="font-bold text-sm text-gray-800 mb-2">Docente Responsable</p>' +
          '<p class="text-sm text-gray-800">' +
          '<span class="text-gray-600">RUT: </span>' +
          '<span class="font-semibold">' +
          elective.teacherRut +
          "</span>" +
          "</p>" +
          "</div>"
        : "") +
      "</div>" +
      "</div>",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "oklch(48.8% 0.243 264.376)",
    showCloseButton: true,
  });
}

// Formateador de fechas
function dateFormatter(date) {
  const dateObject = new Date(date);
  return dateObject.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
