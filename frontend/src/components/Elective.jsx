import { useAuth } from "@context/AuthContext";
import { Badge } from "@components/Badge";
import { Calendar, Pencil, Trash2, Eye, Users, Clock, CheckCircle, BookOpen, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createInscription, getInscription } from "@services/inscription.service";
import { getElectiveById } from "@services/elective.service";
import Swal from "sweetalert2";

export function Elective({
  elective,
  isCompact = false,
  onEdit,
  onDelete
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [Elective, setElective] = useState(elective);
  const [myInscriptions, setMyInscriptions] = useState([]);
  const refreshIntervalMs = 5000; // Actualizar cupos cada 5 segundos

  const isAlumno = user.role === "alumno";
  const isDocente = user.role === "docente";
  const isJefeCarrera = user.role === "jefe_carrera";

  // Verificar si el docente es dueño del electivo
  const isOwner = isDocente && elective.teacherRut === user.rut;

  useEffect(() => {
    let refresh = true;

    setElective(elective);

    const fetchData = async () => {
      try {
        if (!elective?.id) return;
        const res = await getElectiveById(elective.id);
        if (res?.success && refresh) {
          setElective(res.data);
        }
      } catch (error) {
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshIntervalMs);

    return () => {
      refresh = false;
      clearInterval(interval);
    };
  }, [elective?.id]);

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

  const formatSchedule = () => {
    if (!elective.startTime || !elective.endTime || !elective.weekDays) {
      return "No especificado";
    }

    const days = Array.isArray(elective.weekDays)
      ? elective.weekDays.join(", ")
      : elective.weekDays;

    return `${elective.startTime.substring(0, 5)} - ${elective.endTime.substring(0, 5)} (${days})`;
  };

  const formatScheduleTable = () => {
    if (!elective.startTime || !elective.endTime || !elective.weekDays) {
      return <span className="text-gray-500 text-xs italic">No especificado</span>;
    }

    const dayAbbrevs = {
      Lunes: "Lu",
      Martes: "Ma",
      Miércoles: "Mi",
      Jueves: "Ju",
      Viernes: "Vi",
      Sábado: "Sáb",
    };

    const daysArray = Array.isArray(elective.weekDays)
      ? elective.weekDays
      : [elective.weekDays];

    const daysShort = daysArray
      .map((day) => dayAbbrevs[day] || day)
      .join(" - ");

    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-gray-900 text-sm">
          {elective.startTime} - {elective.endTime}
        </span>
        <span className="text-xs text-gray-600">{daysShort}</span>
      </div>
    );
  };

  const getAvailabilityBadge = () => {
    const availableQuotas = Elective?.quotas ?? 0;

    if (availableQuotas > 0) {
      return { text: "Disponible", color: "bg-green-100 text-green-700" };
    } else {
      return { text: "Sin cupos", color: "bg-red-100 text-red-700" };
    }
  };

  const handleViewDetails = async () => {
    try {
      await electiveDetailsDialog(elective, isAlumno, isJefeCarrera);
    } catch (error) {
      console.error("Error al mostrar detalles del electivo:", error);
    }
  };

  const handleInscription = async () => {
    const confirm = await Swal.fire({
      title: "¿Inscribir electivo?",
      text: `¿Deseas solicitar inscripción en ${elective.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, inscribirme",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "oklch(52.7% 0.154 150.069)",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await createInscription({ electiveId: elective.id });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: response.message,
          timer: 3000,
          showConfirmButton: false
        });

        if (onEdit) onEdit();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo procesar la inscripción",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(elective);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(elective);
  };

  const getMyInscriptions = async () => {
  if (!isAlumno) return;

  try {
    const res = await getInscription();

    if (res.success) {
      setMyInscriptions(res.data || []);
    }
  } catch (error) {
    console.error("Error al obtener inscripciones", error);
  }
  };

  useEffect(() => {
    getMyInscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAlumno]);

  // Tarjetas para alumnos
  const cardAlumno = () => {

    const availability = getAvailabilityBadge();
    const hasQuotas = (Elective?.quotas ?? 0) > 0;

    const isAlreadyInscribed = myInscriptions.some(
      (inscription) => inscription.electiveId === Elective?.id
    );

    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:border-gray-400 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-row justify-between items-start mb-3">
            <h3 className="font-bold text-x1 text-gray-900 flex-1 pr-4">
              {Elective?.name}
            </h3>
            <span className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${availability.color}`}>{availability.text}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
            <Calendar className="h-4 w-4" />
            <span>2025-2</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatSchedule()}</span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">
              <span className="font-semibold text-blue-600">{Elective?.quotas ?? 0}</span> cupos disponibles
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-gray-700">Pre-requisitos:</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {Elective?.prerrequisites && Elective.prerrequisites.trim() !== "" ? (
                  Elective.prerrequisites.split(',').map((prereq, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300"
                    >
                      {prereq.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-xs">Ninguno</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 grid grid-cols-2 gap-3">
          <button
            onClick={handleViewDetails}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Ver Detalles
          </button>

          <button
            onClick={handleInscription}
            disabled={!hasQuotas || isAlreadyInscribed}
            className={`w-full px-3 py-2 text-sm font-medium text-white rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 
              ${isAlreadyInscribed
                ? "bg-gray-500 cursor-not-allowed"
                :hasQuotas
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                : 'bg-gray-400 cursor-not-allowed'}`}
          >
            <PlusCircle className="h-4 w-4" />
            {isAlreadyInscribed
              ? "Inscrito"
              : hasQuotas
              ? "Inscribirse"
              : "Sin cupos"}
          </button>
        </div>
      </div>
    );
  };

  const trTable = () => {
    return (
      <tr className="border-b border-gray-200 last:border-0 transition-all hover:bg-gray-50">
        <td className="px-4 py-3 align-middle">
          <span className="font-medium text-sm">{Elective?.name}</span>
        </td>

        <td className="px-4 py-3 align-middle">
          <span className="text-sm text-gray-700 line-clamp-2">
            {Elective?.description}
          </span>
        </td>

        <td className="px-4 py-3 align-middle">
            {formatScheduleTable()}
        </td>

        <td className="px-4 py-3 align-middle text-center">
          <span className="text-sm font-medium">{Elective?.quotas}</span>
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
        <td colSpan="7" className="text-center py-4 text-gray-500 text-sm">
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

async function electiveDetailsDialog(elective) {

  const formatSchedule = () => {
    if (!elective.startTime || !elective.endTime || !elective.weekDays) {
      return "No especificado";
    }
    const days = Array.isArray(elective.weekDays)
      ? elective.weekDays.join(", ")
      : elective.weekDays;
    return `${elective.startTime.substring(0, 5)} - ${elective.endTime.substring(0, 5)} (${days})`;
  };

  await Swal.fire({
    html:
      '<div class="text-start">' +
      '<div class="mb-4">' +
      '<p class="font-bold text-2xl text-gray-900 mb-1">' +
      elective.name +
      "</p>" +
      "</div>" +
      '<div class="flex flex-col gap-4">' +
      '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">' +
      '<p class="font-bold text-sm text-gray-900 mb-3">Información General</p>' +
      '<div class="grid grid-cols-2 gap-3">' +
      '<div class="col-span-2">' +
      '<p class="text-xs text-gray-600 mb-0.5">Nombre del electivo</p>' +
      '<p class="text-sm font-semibold text-gray-900">' +
      elective.name +
      "</p>" +
      "</div>" +
      "<div>" +
      '<p class="text-xs text-gray-600 mb-0.5">Periodo</p>' +
      '<p class="text-sm font-semibold text-gray-900">2025-2</p>' +
      "</div>" +
      '<div class="col-span-2">' +
      '<p class="text-xs text-gray-600 mb-0.5">Horario</p>' +
      '<p class="text-sm font-semibold text-gray-900">' +
      formatSchedule() +
      "</p>" +
      "</div>" +
      "<div>" +
      '<p class="text-xs text-gray-600 mb-0.5">Cupos disponibles</p>' +
      '<p class="text-sm font-semibold text-blue-600">' +
      elective.quotas +
      "</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "<div>" +
      '<p class="font-bold text-sm text-gray-900 mb-2">Descripción</p>' +
      '<div class="p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg leading-relaxed">' +
      elective.description +
      "</div>" +
      "</div>" +
      "<div>" +
      '<p class="font-bold text-sm text-gray-900 mb-2">Objetivos del Electivo</p>' +
      '<div class="p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg leading-relaxed">' +
      (elective.objectives || '<span class="italic text-gray-500">No especificados</span>') +
      "</div>" +
      "</div>" +
      "<div>" +
      '<p class="font-bold text-sm text-gray-900 mb-2">Prerrequisitos</p>' +
      '<div class="p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">' +
      (elective.prerrequisites && elective.prerrequisites.trim() !== ""
        ? '<div class="flex flex-wrap gap-2">' +
          elective.prerrequisites
            .split(",")
            .map(
              (prereq) =>
                '<span class="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-medium">' +
                prereq.trim() +
                "</span>"
          )
          .join("") +
        "</div>"
        : '<span class="italic text-gray-500">Ninguno</span>') +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>",
    width: "600px",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#7c3aed",
    showCloseButton: true,
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg px-6 py-2.5",
    },
  });
}
