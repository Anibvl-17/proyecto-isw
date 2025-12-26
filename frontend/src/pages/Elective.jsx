import { useEffect, useState } from "react";
import {
    getElectives,
    createElective,
    updateElective,
    deleteElective,
    changeElectiveStatus,
} from "@services/elective.service";
import { getElectivesByPrerequisites } from "@services/inscription.service";
import { showErrorAlert } from "@helpers/sweetAlert";
import { useAuth } from "@context/AuthContext";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Badge } from "@components/Badge";
import { Elective } from "@components/Elective";
import { CheckCircle, PlusCircle, Pencil, Trash2, Eye, Filter, X } from "lucide-react";
import Swal from "sweetalert2";
import axios from "@services/root.service";

const Electives = () => {
    const [loading, setLoading] = useState(false);
    const [electives, setElectives] = useState([]);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const { user } = useAuth();
    const isDocente = user.role === "docente";
    const isAlumno = user.role === "alumno";
    const isJefeCarrera = user.role === "jefe_carrera" || user.role === "administrador";

    const fetchElectives = async () => {
        try {
            setLoading(true);
            const result = await getElectives();
            result.success ? setElectives(result.data || []) : showErrorAlert("Error", result.message);
        } catch (error) {
            console.error("Error al obtener electivos:", error);
            showErrorAlert("Error", "No se pudieron obtener los electivos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchElectives(); }, []);

    const handleCreateElective = async () => {
        try {
            const formData = await electiveDialog();
            if (!formData) return;
            const response = await createElective(formData);
            if (response.success) {
                Swal.fire({ toast: true, title: response.message || "Electivo creado exitosamente", icon: "success", timer: 4500, timerProgressBar: true, position: "bottom-end", showConfirmButton: false });
                await fetchElectives();
            } else showErrorAlert("Error", response.message);
        } catch (error) {
            showErrorAlert("Error", "No se pudo crear el electivo", error);
        }
    };

    const handleEditElective = async (elective) => {
        try {
            const formData = await electiveDialog(elective);
            if (!formData) return;
            const response = await updateElective(elective.id, formData);
            if (response.success) {
                Swal.fire({ toast: true, title: response.message || "Electivo actualizado exitosamente", icon: "success", timer: 4500, timerProgressBar: true, position: "bottom-end", showConfirmButton: false });
                await fetchElectives();
            } else showErrorAlert("Error", response.message);
        } catch (error) {
            showErrorAlert("Error", "No se pudo actualizar el electivo", error);
        }
    };

    const handleDeleteElective = async (elective) => {
        try {

            const inscriptionsResponse = await axios.get(`/inscription/elective/${elective.id}`);

            const hasInscriptions = inscriptionsResponse.data?.data?.length > 0;

            if (hasInscriptions) {
                return Swal.fire({
                    title: "No se puede eliminar",
                    html: `
          <div class="text-left">
            <p class="mb-3">El electivo <strong>"${elective.name}"</strong> no puede ser eliminado porque ya tiene inscripciones asociadas.</p>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p class="text-sm text-amber-800">
                <strong>Sugerencia:</strong> Si necesitas hacer cambios, puedes editar el electivo.
              </p>
            </div>
          </div>
        `,
                    icon: "warning",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#3b82f6",
                    customClass: {
                        popup: "text-left",
                        htmlContainer: "text-left"
                    }
                });
            }

            const result = await Swal.fire({
                title: "Eliminar electivo",
                text: `¿Seguro que deseas eliminar el electivo "${elective.name}"?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#6b7280"
            });
            if (!result.isConfirmed) return;
            const response = await deleteElective(elective.id);
            if (response.success) {
                Swal.fire({ toast: true, title: response.message || "Electivo eliminado exitosamente", icon: "success", timer: 4000, timerProgressBar: true, position: "bottom-end", showConfirmButton: false });
                await fetchElectives();
            } else showErrorAlert("Error", response.message);
        } catch {
            showErrorAlert("Error", "No se pudo eliminar el electivo");

            if (error.response?.status === 400 &&
                error.response?.data?.message?.includes("inscripciones")) {
                return Swal.fire({
                    title: "No se puede eliminar",
                    text: error.response.data.message,
                    icon: "warning",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#3b82f6"
                });
            }

            showErrorAlert("Error", "No se pudo eliminar el electivo");
        }

    };

    const handleViewDetails = async (elective) => {

        const formatScheduleForDialog = () => {
            if (elective.schedule && Array.isArray(elective.schedule) && elective.schedule.length > 0) {
                return elective.schedule
                    .map(entry => `${entry.day} ${entry.startTime?.substring(0, 5)}-${entry.endTime?.substring(0, 5)}`)
                    .join(", ");
            }
            return "No especificado";
        };

        const isPendiente = elective.status === "Pendiente";
        const isRechazado = elective.status === "Rechazado";

        const result = await Swal.fire({
            title: `<h3 class="text-xl font-bold">${elective.name}</h3>`,
            html: `
                <div class="text-left space-y-3 p-2">
                    <p><strong>Estado:</strong> 
                        <span class="${elective.status === 'Aprobado' ? 'text-green-600' : elective.status === 'Rechazado' ? 'text-red-600' : 'text-yellow-600'} font-bold">
                            ${elective.status}
                        </span>
                    </p>
                    ${isRechazado && elective.rejectReason ? `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p class="text-xs font-semibold text-gray-700 mb-1">Motivo del rechazo:</p>
                        <p class="text-sm text-red-800">${elective.rejectReason}</p>
                    </div>
                    ` : ''}
                    <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p class="text-sm text-gray-500 font-semibold">Descripción</p>
                        <p class="mb-2">${elective.description}</p>
                        <p class="text-sm text-gray-500 font-semibold">Objetivos</p>
                        <p>${elective.objectives}</p>
                    </div>
                    <div class="mb-3">
                        <p class="text-sm font-semibold text-gray-700">Horario</p>
                        <p class="text-sm text-gray-900">${formatScheduleForDialog()}</p>
                    </div>
                    <div class="mb-3">
                        <p class="text-sm font-semibold text-gray-700">Cupos</p>
                        <p class="text-sm text-gray-900">${elective.quotas}</p>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-gray-700">Prerrequisitos</p>
                        <p class="text-sm text-gray-900">${elective.prerrequisites || 'Ninguno'}</p>
                    </div>
                     ${isPendiente && isJefeCarrera ? `
                    <div class="mt-4">
                        <label for="rejectReason" class="text-sm font-semibold text-gray-700 block mb-1">
                            Motivo de rechazo <span class="text-gray-400 font-normal">(requerido si rechazas)</span>
                        </label>
                        <textarea 
                            id="rejectReason" 
                            rows="3" 
                            maxlength="500"
                            class="w-full border border-gray-300 px-3 py-2 text-sm rounded-md resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Escribe el motivo del rechazo..."
                        ></textarea>
                        <span class="text-xs text-gray-500 mt-1 block">Mínimo 10 caracteres</span>
                    </div>
                    ` : ''}
                </div>
            `,
            showCloseButton: true,
            showCancelButton: true,
            cancelButtonText: "Cerrar",
            showConfirmButton: isJefeCarrera && isPendiente,
            showDenyButton: isJefeCarrera && isPendiente,
            confirmButtonText: "Aprobar",
            denyButtonText: "Rechazar",
            confirmButtonColor: "#10B981",
            denyButtonColor: "#EF4444",
            width: "600px",
        });

        if (result.isConfirmed) {
            await changeStatus(elective.id, "Aprobado", null);
        } else if (result.isDenied) {
            const rejectReason = document.getElementById("rejectReason")?.value.trim();

            if (!rejectReason || rejectReason.length < 10) {
                return Swal.fire({
                    title: "Motivo requerido",
                    text: "Debe ingresar un motivo de rechazo de al menos 10 caracteres.",
                    icon: "warning",
                    confirmButtonText: "Entendido",
                    ConfirmButtonColor: "#3b82f6"
                });
            }

            await changeStatus(elective.id, "Rechazado", rejectReason);
        }
    };

    const changeStatus = async (id, status, rejectReason = null) => {
        const action = status === "Aprobado" ? "aprobado" : "rechazado";
        const confirm = await Swal.fire({
            title: `¿El electivo es ${action}?`,
            text: status === "Aprobado"
                ? "El electivo será visible para los alumnos."
                : "El docente deberá editarlo para reenviarlo.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: status === "Aprobado" ? "#10B981" : "#EF4444",
        });

        if (!confirm.isConfirmed) return;

        const payload = { status };
        if (status === "Rechazado" && rejectReason) {
            payload.rejectReason = rejectReason;
        }

        const response = await changeElectiveStatus(id, payload);
        if (response.success) {
            Swal.fire("¡Listo!", `Electivo ${action} exitosamente.`, "success");
            await fetchElectives();
        } else {
            showErrorAlert("Error", response.message || "No se pudo cambiar el estado");
        }
    }

    const handleFilterToggle = async () => {
        setLoading(true);
        try {
            if (isFilterActive) {
                // Si el filtro estaba activo, lo desactivamos y volvemos a cargar TODOS
                await fetchElectives();
                setIsFilterActive(false);
            } else {
                // Si el filtro estaba inactivo, llamamos al servicio de pero Sin Requisitos
                const result = await getElectivesByPrerequisites();
                if (result.success) {
                    setElectives(result.data || []);
                    setIsFilterActive(true);

                    Swal.fire({
                        toast: true,
                        title: "Filtro aplicado: Sin requisitos",
                        icon: "info",
                        timer: 2000,
                        position: "bottom-end",
                        showConfirmButton: false
                    });
                } else {
                    showErrorAlert("Error", result.message);
                }
            }
        } catch (error) {
            console.error("Error al filtrar:", error);
            showErrorAlert("Error", "No se pudo aplicar el filtro");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Sidebar />
            <div className="ml-72 flex flex-col p-4">
                <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <h1 className="font-bold text-2xl">Electivos</h1>
                            <p className="text-gray-600">
                                {isDocente ? (
                                    "Crea, actualiza y administra tus electivos."
                                ) : isJefeCarrera ? (
                                    "Evalúa los electivos."
                                ) : isAlumno ? (
                                    "Revisa los electivos disponibles para inscripción."
                                ) : (
                                    ""
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {(isAlumno || isJefeCarrera) && (
                                <button
                                    onClick={handleFilterToggle}
                                    className={`font-medium text-sm px-4 py-2 flex flex-row items-center gap-2 rounded-lg transition-all border
                                        ${isFilterActive
                                            ? "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {isFilterActive ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                                    {isFilterActive ? "Quitar filtro" : "Sin requisitos"}
                                </button>
                            )}

                            {isDocente && (<button onClick={handleCreateElective} className="bg-blue-700 text-white font-medium text-sm px-4 py-2 flex flex-row items-center gap-3 rounded-lg transition-all hover:shadow-md hover:bg-blue-700/90 active:bg-blue-700/80 active:scale-95 active:shadow-md"><PlusCircle className="h-4 w-4" />Nuevo electivo</button>)}
                        </div>
                    </div>

                    <div className="flex flex-row flex-1 gap-4 justify-start items-center">
                        {loading && <Badge text="Cargando" />}
                        {!loading && electives.length === 0 && (
                            <p className="text-gray-600 italic w-full flex flex-row gap-3 items-center">
                                <CheckCircle className="h-5 w-5" />
                                No hay electivos disponibles.
                            </p>
                        )}
                        {!loading && electives.length > 0 && (
                            <Badge type="info" text={`${electives.length} electivo${electives.length > 1 ? "s" : ""}`} />
                        )}
                    </div>
                    {!loading && electives.length > 0 && isAlumno && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {electives.map((elective) => (
                                <Elective
                                    key={elective.id}
                                    elective={elective}
                                    onEdit={fetchElectives}
                                />
                            ))}
                        </div>
                    )}
                    {!loading && electives.length > 0 && (isDocente || isJefeCarrera) && (
                        <div className="w-full border border-gray-300 rounded-lg">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="border-b border-gray-300 bg-gray-50">
                                    <tr>
                                        <th className="min-w-32 h-12 px-4 text-left font-medium">Nombre</th>
                                        <th className="min-w-40 h-12 px-4 text-left font-medium">Descripción</th>
                                        <th className="min-w-32 h-12 px-4 text-center font-medium">Horario</th>
                                        <th className="min-w-20 h-12 px-4 text-center font-medium">Cupos</th>
                                        <th className="min-w-20 h-12 px-4 text-center font-medium">Estado</th>
                                        {isDocente && (
                                            <th className="min-w-24 h-12 px-4 text-center font-medium">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {electives.map((elective) => (
                                        <tr key={elective.id}>
                                            <td className="px-4 py-3">{elective.name}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{elective.description}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {!elective.schedule || !Array.isArray(elective.schedule) || elective.schedule.length === 0 ? (
                                                        <span className="text-gray-500 italic">No especificado</span>
                                                    ) : (
                                                        elective.schedule.map((entry, idx) => (
                                                            <div key={idx} className="flex flex-col items-center">
                                                                <span className="font-semibold text-gray-900 text-xs">
                                                                    {entry.startTime?.substring(0, 5)} - {entry.endTime?.substring(0, 5)}
                                                                </span>
                                                                <span className="text-xs text-gray-600">{entry.day}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">{elective.quotas}</td>
                                            {(isDocente || isJefeCarrera) && (
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${elective.status === "Aprobado"
                                                        ? "bg-green-100 text-green-800"
                                                        : elective.status === "Rechazado"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        }`}>
                                                        {elective.status}
                                                    </span>
                                                </td>
                                            )}
                                            {isDocente && elective.teacherRut === user.rut && (
                                                <td className="px-4 py-3 text-center">
                                                    {elective.status === "Rechazado" && (
                                                        <button
                                                            onClick={() => handleViewDetails(elective)}
                                                            className="text-indigo-600 hover:text-indigo-800 mr-3"
                                                            title="Ver motivo de rechazo"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleEditElective(elective)} className="text-blue-600 hover:text-blue-800 mr-3">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteElective(elective)} className="text-red-600 hover:text-red-800">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                            {isJefeCarrera && (
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleViewDetails(elective)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Ver
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function generateTimeOptions() {
    const options = [];
    for (let hour = 8; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            options.push(time);
        }
    }
    return options;
}

async function electiveDialog(existingElective = null) {
    const isEdit = !!existingElective;
    const timeOptions = generateTimeOptions();

    const weekDays = [
        { id: "Lunes", label: "Lunes" },
        { id: "Martes", label: "Martes" },
        { id: "Miércoles", label: "Miércoles" },
        { id: "Jueves", label: "Jueves" },
        { id: "Viernes", label: "Viernes" },
        { id: "Sábado", label: "Sábado" },
    ];

    const initialSchedule = existingElective?.schedule || [];

    const { value: formValues } = await Swal.fire({
        html:
            '<div class="text-start">' +
            `<p class="font-bold text-md mb-1">${isEdit ? "Editar electivo" : "Crear electivo"}</p>` +
            `<p class="text-sm text-gray-500">${isEdit ? "Modifica la información del electivo." : "Completa la información para crear un nuevo electivo."}</p>` +
            '<div class="flex flex-col gap-4 mt-4">' +
            '<div class="flex flex-col gap-0.5">' +
            '<label for="name" class="text-sm font-medium">Nombre</label>' +
            `<input id="name" type="text" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700" value="${existingElective?.name || ""}" />` +
            "</div>" +
            '<div class="flex flex-col gap-0.5">' +
            '<label for="description" class="text-sm font-medium">Descripción</label>' +
            `<textarea id="description" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">${existingElective?.description || ""}</textarea>` +
            "</div>" +
            '<div class="flex flex-col gap-0.5">' +
            '<label for="objectives" class="text-sm font-medium">Objetivos</label>' +
            `<textarea id="objectives" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">${existingElective?.objectives || ""}</textarea>` +
            "</div>" +
            '<div class="flex flex-col gap-0.5">' +
            '<label for="prerrequisites" class="text-sm font-medium">Prerrequisitos</label>' +
            `<textarea id="prerrequisites" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">${existingElective?.prerrequisites || ""}</textarea>` +
            "</div>" +
            '<div class="flex flex-col gap-2">' +
            '<label class="text-sm font-semibold">Horarios de clases <span class="text-red-500">* (Máx 3 días)</span></label>' +
            '<div id="schedule-container" class="flex flex-col gap-3"></div>' +
            '<button type="button" id="add-schedule-btn" class="text-sm text-blue-600 hover:text-blue-800 font-medium self-start">+ Agregar día</button>' +
            '<span class="text-xs text-gray-500">Selecciona entre 1 y 3 días con sus respectivos horarios</span>' +
            "</div>" +
            '<div class="flex flex-col gap-0.5">' +
            '<label for="quotas" class="text-sm font-medium">Cupos</label>' +
            `<input id="quotas" type="number" min="1" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700" value="${existingElective?.quotas || 1}" />` +
            "</div>" +
            "</div>" +
            "</div>",
        width: "650px",
        confirmButtonText: isEdit ? "Guardar cambios" : "Crear electivo",
        confirmButtonColor: "oklch(52.7% 0.154 150.069)",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        showCloseButton: true,
        focusConfirm: false,
        didOpen: () => {
            const scheduleContainer = document.getElementById("schedule-container");
            const addScheduleBtn = document.getElementById("add-schedule-btn");

            let scheduleEntries = initialSchedule.length > 0
                ? initialSchedule
                : [{ day: "", startTime: "", endTime: "" }];

            const renderSchedules = () => {
                scheduleContainer.innerHTML = "";

                scheduleEntries.forEach((entry, index) => {
                    const scheduleRow = document.createElement("div");
                    scheduleRow.className = "flex gap-2 items-start border border-gray-200 rounded-lg p-3 bg-gray-50";
                    scheduleRow.innerHTML = `
            <div class="flex-1 grid grid-cols-3 gap-2">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-gray-700">Día</label>
                <select data-schedule-index="${index}" data-field="day" class="schedule-input border border-gray-300 px-2 py-1.5 text-sm rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Seleccionar...</option>
                  ${weekDays.map(day =>
                        `<option value="${day.id}" ${entry.day === day.id ? "selected" : ""}>${day.label}</option>`
                    ).join("")}
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-gray-700">Inicio</label>
                <select data-schedule-index="${index}" data-field="startTime" class="schedule-input border border-gray-300 px-2 py-1.5 text-sm rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">--:--</option>
                  ${timeOptions.map(time =>
                        `<option value="${time}" ${entry.startTime === time ? "selected" : ""}>${time}</option>`
                    ).join("")}
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-gray-700">Fin</label>
                <select data-schedule-index="${index}" data-field="endTime" class="schedule-input border border-gray-300 px-2 py-1.5 text-sm rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">--:--</option>
                  ${timeOptions.map(time =>
                        `<option value="${time}" ${entry.endTime === time ? "selected" : ""}>${time}</option>`
                    ).join("")}
                </select>
              </div>
            </div>
            ${scheduleEntries.length > 1 ? `
              <button type="button" data-remove-index="${index}" class="remove-schedule-btn mt-6 text-red-600 hover:text-red-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            ` : ""}
          `;
                    scheduleContainer.appendChild(scheduleRow);
                });

                document.querySelectorAll(".schedule-input").forEach(input => {
                    input.addEventListener("change", (e) => {
                        const index = parseInt(e.target.dataset.scheduleIndex);
                        const field = e.target.dataset.field;
                        scheduleEntries[index][field] = e.target.value;
                    });
                });

                document.querySelectorAll(".remove-schedule-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const index = parseInt(e.target.closest("button").dataset.removeIndex);
                        scheduleEntries.splice(index, 1);
                        renderSchedules();
                        updateAddButtonState();
                    });
                });

                updateAddButtonState();
            };

            const updateAddButtonState = () => {
                if (scheduleEntries.length >= 3) {
                    addScheduleBtn.disabled = true;
                    addScheduleBtn.classList.add("opacity-50", "cursor-not-allowed");
                } else {
                    addScheduleBtn.disabled = false;
                    addScheduleBtn.classList.remove("opacity-50", "cursor-not-allowed");
                }
            };

            addScheduleBtn.addEventListener("click", () => {
                if (scheduleEntries.length < 3) {
                    scheduleEntries.push({ day: "", startTime: "", endTime: "" });
                    renderSchedules();
                }
            });

            Swal.getPopup().scheduleEntries = scheduleEntries;

            renderSchedules();
        },
        preConfirm: () => {
            const name = document.getElementById("name").value.trim();
            const description = document.getElementById("description").value.trim();
            const objectives = document.getElementById("objectives").value.trim();
            const prerequisites = document.getElementById("prerrequisites").value.trim();
            const quotas = parseInt(document.getElementById("quotas").value.trim(), 10);
            const scheduleEntries = Swal.getPopup().scheduleEntries;

            if (!name || name.length < 3) {
                return Swal.showValidationMessage("El nombre debe tener al menos 3 caracteres");
            }
            if (!description || description.length < 10) {
                return Swal.showValidationMessage("La descripción debe tener al menos 10 caracteres");
            }
            if (!objectives || objectives.length < 10) {
                return Swal.showValidationMessage("Los objetivos deben tener al menos 10 caracteres");
            }
            if (scheduleEntries.length < 1 || scheduleEntries.length > 3) {
                return Swal.showValidationMessage("Debe seleccionar entre 1 y 3 días de clase");
            }

            for (let i = 0; i < scheduleEntries.length; i++) {
                const entry = scheduleEntries[i];
                if (!entry.day || !entry.startTime || !entry.endTime) {
                    return Swal.showValidationMessage(`Complete todos los campos del horario ${i + 1}`);
                }

                const [startHour, startMin] = entry.startTime.split(":").map(Number);
                const [endHour, endMin] = entry.endTime.split(":").map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;

                if (endMinutes <= startMinutes) {
                    return Swal.showValidationMessage(
                        "La hora de fin debe ser posterior a la hora de inicio"
                    );
                }
                if (endMinutes - startMinutes < 30) {
                    return Swal.showValidationMessage("La clase debe durar al menos 30 minutos");
                }
            }

            const uniqueDays = new Set(scheduleEntries.map(e => e.day));
            if (uniqueDays.size !== scheduleEntries.length) {
                return Swal.showValidationMessage("No puede repetir el mismo día");
            }

            if (Number.isNaN(quotas) || quotas < 1 || quotas > 200) {
                return Swal.showValidationMessage("Los cupos deben ser un número entre 1 y 200");
            }

            return {
                name,
                description,
                objectives,
                prerrequisites: prerequisites || null,
                schedule: scheduleEntries,
                quotas,
            };
        },
    });

    return formValues || null;
}

export default Electives;