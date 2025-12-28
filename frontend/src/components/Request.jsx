import { getElectiveById } from "@services/elective.service";
import { showErrorAlert } from "@helpers/sweetAlert";
import { reviewRequest } from "@services/request.service";
import { getUserById } from "@services/user.service";
import { useAuth } from "@context/AuthContext";
import { Badge } from "@components/Badge";
import { Calendar, CalendarCheck, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

/* Componente para mostrar las solicitudes según rol y el atributo isCompact (compacta) 
Para los alumnos:
- En formato de Card, isCompact se utiliza para las solicitudes ya revisadas, donde se
   muestra menos información, con un botón para ver todos los detalles.
- Para las no revisadas, se muestra toda la información.

Para jefe de carrera:
- Las solicitudes se presentan en formato de tabla, así que se devuelve una fila de tabla
- El atributo isCompact no tiene efecto en este caso.
*/
export function Request({ request, isCompact = false, fetchCallback }) {
  const [loading, setLoading] = useState(false);
  const [elective, setElective] = useState(null);
  const [student, setStudent] = useState(null);
  const { user } = useAuth();

  const isAlumno = user.role === "alumno";
  const isJefeCarrera = user.role === "jefe_carrera";

  const studentId = request.studentId;
  const electiveId = request.electiveId;

  const fetchElectiveById = async () => {
    try {
      setLoading(true);
      const result = await getElectiveById(electiveId);
      setElective(result.data);
    } catch (error) {
      console.error("Error al obtener el electivo en RequestCard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async () => {
    try {
      setLoading(true);
      const result = await getUserById(studentId);
      setStudent(result.data);
    } catch (error) {
      console.error("Error al obtener usuario en RequestCard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserById();
    fetchElectiveById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBadgeType = () => {
    if (request.status === "pendiente") {
      return "pending";
    } else if (request.status === "aprobado") {
      return "success";
    } else {
      return "error";
    }
  };

  const getBadgeText = () => {
    if (request.status === "pendiente") {
      return "Pendiente";
    } else if (request.status === "aprobado") {
      return "Aprobada";
    } else {
      return "Rechazada";
    }
  };

  const handleViewDetails = async () => {
    try {
      const formValues = await requestDetailsDialog(request, student, elective, isAlumno);
      if (!formValues) return;

      const result = await reviewRequest(request.id, formValues);

      if (result.success) {
        const toastText =
          formValues.status === "aprobado"
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
        fetchCallback();
      } else {
        showErrorAlert("Error", "No se pudo revisar la solicitud.");
      }
    } catch (error) {
      console.error("Error al obtener detalles de la solicitud:", error);
      showErrorAlert("Error", "No se pudo obtener los detalles de la solicitud");
    }
  };

  const cardAlumno = () => {
    return (
      <div className="border border-gray-300 px-6 py-4 rounded-md transition-all hover:shadow-md hover:border-gray-400 flex flex-row justify-between items-center">
        <div>
          <div className="flex flex-row gap-4 justify-start items-center mb-2">
            <span className=" font-semibold text-lg">{elective.name} </span>
            <Badge type={getBadgeType()} text={getBadgeText()} showIcon={false} />
          </div>

          {/* En formato compacto, no se muestra la fecha de creación de solictud */}
          {!isCompact && (
            <div className="text-sm flex flex-row gap-2 items-center text-gray-500 mb-1">
              <Calendar className="h-4 w-4" /> Solicitado el {dateFormatter(elective.createdAt)}
            </div>
          )}

          {request.status !== "pendiente" && (
            <div className="text-sm flex flex-row gap-2 items-center text-gray-500">
              <CalendarCheck className="h-4 w-4" /> Revisada el {dateFormatter(request.reviewedAt)}
            </div>
          )}

          {/* En formato compacto, no se muestra la descripción*/}
          {!isCompact && <div className="text-sm text-gray-600 mt-4">{request.description}</div>}
        </div>

        {/* En formato compacto, se muestra el botón de detalles */}
        {isCompact && (
          <div>
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={handleViewDetails}
                className="px-3 py-0.5 text-sm flex items-center justify-center gap-2 rounded-2xl text-gray-800 font-semibold border transition-all border-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:bg-blue-700 active:border-blue-700 active:text-gray-200 active:scale-95"
              >
                <Eye className="h-4 w-4" /> Ver
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Dado que el jefe de carrera maneja varias solicitudes, se utiliza una tabla más
  // más compacta para mostrar las solicitudes, así es más facil revisarlas
  // Por eso en vez de retornar una Card, se retorna una fila de tabla <tr>
  const trJefeCarrera = () => {
    return (
      <tr className="border-b border-gray-300 px-1 py-1 transition-all hover:bg-gray-100 last:border-0">
        {/* Datos del estudiante */}
        <td className="min-w-8 p-4 align-middle">
          <div className="flex-1 flex flex-col items-start justify-between">
            <span className="font-medium text-sm">{student.username}</span>
            <span className="text-gray-500 text-sm ">{student.rut}</span>
          </div>
        </td>
        {/* Datos del electivo */}
        <td className="min-w-8 p-4 align-middle">
          <span className="text-sm font-semibold">{elective.name}</span>
        </td>
        {/* Fechas */}
        <td className="min-w-8 p-4 align-middle">
          <div className="flex flex-col">
            {request.status === "pendiente" ? (
              <span className="text-sm flex flex-row gap-2 items-center text-gray-500 mb-1">
                <Calendar className="h-4 w-4" /> Solicitado el {dateFormatter(elective.createdAt)}
              </span>
            ) : (
              <span className="text-sm flex flex-row gap-2 items-center text-gray-500">
                <CalendarCheck className="h-4 w-4" /> Revisada el{" "}
                {dateFormatter(request.reviewedAt)}
              </span>
            )}
          </div>
        </td>

        {/* Estado de solicitud */}
        <td className="min-w-8 p-4 align-middle">
          <div className="flex items-center justify-center">
            <Badge type={getBadgeType()} text={getBadgeText()} showIcon={false} />
          </div>
        </td>

        {/* Botón de ver detalles */}
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
  };

  if (loading || elective === null || student === null) {
    if (isAlumno) return <p>Cargando...</p>;
    else
      return (
        <tr>
          <td>Cargando...</td>
        </tr>
      );
  } else if (isAlumno) {
    return cardAlumno();
  } else if (isJefeCarrera) {
    return trJefeCarrera();
  }
}

async function requestDetailsDialog(request, student, elective, isAlumno) {
  const { value: formValues } = await Swal.fire({
    html:
      '<div class="text-start">' +
      '<p class="font-semibold text-xl mb-1 text-black">Detalle de la Solicitud</p>' +
      '<p class="text-sm text-gray-600">' +
      "Solicitud creada el " +
      dateFormatter(request.createdAt) +
      "</p>" +
      '<p class="text-sm mb-2 text-gray-600">' +
      (request.status !== "pendiente"
        ? "Solicitud revisada el " + dateFormatter(request.reviewedAt)
        : "Solicitud aún no revisada") +
      "</p>" +
      '<div class="flex flex-col gap-2 mt-4">' +
      // Info estudiante, si el alumno ve los detalles no es necesario que vea esta sección
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
      // Info electivo
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
      elective.prerrequisites +
      "</span>" +
      "</p>" +
      "</div>" +
      // Motivo de la solicitud
      '<p class="font-bold text-sm text-gray-800">' +
      "Motivo de la solicitud" +
      "</p>" +
      '<div class="flex flex-col gap-1 mb-3">' +
      '<div class="p-2 text-sm text-gray-800 border bg-blue-50 border-blue-200 rounded-md">' +
      request.description +
      "</div>" +
      "</div>" +
      // Motivo de rechazo si es que fue rechazada
      (request.status === "rechazado"
        ? '<div class="flex flex-col gap-1">' +
          '<p class="font-bold text-sm text-gray-800 mb-2">' +
          "Motivo de rechazo" +
          "</p>" +
          '<div class="p-2 text-sm text-gray-800 border bg-red-50 border-red-200 rounded-md">' +
          request.reviewComment +
          "</div>" +
          "</div>"
        : "") +
      // Fin
      "</div>" +
      "</div>" +
      "</div>",
    showConfirmButton: request.status === "pendiente",
    confirmButtonText: "Aprobar",
    confirmButtonColor: "oklch(52.7% 0.154 150.069)",
    showDenyButton: request.status === "pendiente",
    denyButtonText: "Rechazar",
    denyButtonColor: "oklch(50.5% 0.213 27.518)",
    showCancelButton: true,
    cancelButtonText: "Volver",
    showCloseButton: true,
    preConfirm: () => {
      const status = "aprobado";
      //const reviewComment = "";

      return { status };
    },
    preDeny: async () => {
      const status = "rechazado";
      const reviewComment = await reviewCommentDialog();

      if (!reviewComment) return false;

      return { status, reviewComment };
    },
  });

  if (formValues) {
    return {
      status: formValues.status,
      reviewComment: formValues.reviewComment,
    };
  }
}

async function reviewCommentDialog() {
  const { value: formValues } = await Swal.fire({
    html:
      '<div class="text-start flex flex-col gap-2">' +
      '<p class="font-semibold text-xl mb-1 text-black">Motivo de rechazo</p>' +
      '<label for="description" class="text-sm text-gray-600">' +
      "Escriba el motivo de rechazo de la solicitud " +
      "</label>" +
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
        Swal.showValidationMessage("El comentario debe contener entre 5 y 300 caracteres");
        return false;
      }

      return { reviewComment };
    },
  });

  if (formValues) {
    return formValues.reviewComment;
  }
}

function dateFormatter(date) {
  const dateObject = new Date(date);
  return dateObject.toLocaleString();
}
