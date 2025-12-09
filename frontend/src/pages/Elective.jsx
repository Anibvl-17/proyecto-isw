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
            const result = await Swal.fire({
                title: "Eliminar electivo",
                text: `¿Seguro que deseas eliminar el electivo "${elective.name}"?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "oklch(52.7% 0.154 15)",
            });
            if (!result.isConfirmed) return;
            const response = await deleteElective(elective.id);
            if (response.success) {
                Swal.fire({ toast: true, title: response.message || "Electivo eliminado exitosamente", icon: "success", timer: 4000, timerProgressBar: true, position: "bottom-end", showConfirmButton: false });
                await fetchElectives();
            } else showErrorAlert("Error", response.message);
        } catch {
            showErrorAlert("Error", "No se pudo eliminar el electivo");
        }
    };

    const handleViewDetails = async (elective) => {
        const isPendiente = elective.status === "Pendiente";

        const result = await Swal.fire({
            title: `<h3 class="text-xl font-bold">${elective.name}</h3>`,
            html: `
                <div class="text-left space-y-3 p-2">
                    <p><strong>Estado:</strong> 
                        <span class="${elective.status === 'Aprobado' ? 'text-green-600' : elective.status === 'Rechazado' ? 'text-red-600' : 'text-yellow-600'} font-bold">
                            ${elective.status}
                        </span>
                    </p>
                    <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p class="text-sm text-gray-500 font-semibold">Descripción</p>
                        <p class="mb-2">${elective.description}</p>
                        <p class="text-sm text-gray-500 font-semibold">Objetivos</p>
                        <p>${elective.objectives}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-semibold">Horario</p>
                        <div class="text-sm space-y-1">
                            <p><strong>Hora:</strong> ${elective.startTime ? elective.startTime.substring(0, 5) : 'N/A'} - ${elective.endTime ? elective.endTime.substring(0, 5) : 'N/A'}</p>
                            <p><strong>Días:</strong> ${elective.weekDays ? elective.weekDays.join(', ') : 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-semibold">Cupos</p>
                        <p>${elective.quotas}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-semibold">Prerrequisitos</p>
                        <p>${elective.prerrequisites || 'Ninguno'}</p>
                    </div>
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
            await changeStatus(elective.id, "Aprobado");
        } else if (result.isDenied) {
            await changeStatus(elective.id, "Rechazado");
        }
    };

    const changeStatus = async (id, status) => {
        const action = status === "Aprobado" ? "aprobado" : "rechazado";
        const confirm = await Swal.fire({
            title: `¿${action} electivo?`,
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

        const response = await changeElectiveStatus(id, status);
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
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-gray-700">{elective.startTime?.substring(0, 5)} - {elective.endTime?.substring(0, 5)}</p>
                                                    <p>{elective.weekDays ? elective.weekDays.join(' y ') : 'N/A'}</p>
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
            '<div class="grid grid-cols-2 gap-3">' +
            '<div class="flex flex-col gap-1">' +
            '<label for="startTime" class="text-sm font-semibold">Hora Inicio <span class="text-red-500">*</span></label>' +
            '<select id="startTime" class="border border-gray-300 px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white">' +
            '<option value="">Seleccionar...</option>' +
            timeOptions
                .map(
                    (time) =>
                        `<option value="${time}" ${existingElective?.startTime === time ? "selected" : ""}>${time}</option>`
                )
                .join("") +
            "</select>" +
            "</div>" +
            '<div class="flex flex-col gap-1">' +
            '<label for="endTime" class="text-sm font-semibold">Hora Fin <span class="text-red-500">*</span></label>' +
            '<select id="endTime" class="border border-gray-300 px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white">' +
            '<option value="">Seleccionar...</option>' +
            timeOptions
                .map(
                    (time) =>
                        `<option value="${time}" ${existingElective?.endTime === time ? "selected" : ""}>${time}</option>`
                )
                .join("") +
            "</select>" +
            "</div>" +
            "</div>" +
            '<div class="flex flex-col gap-2">' +
            '<label class="text-sm font-semibold">Días de la semana <span class="text-red-500">*</span></label>' +
            '<div class="grid grid-cols-3 gap-2">' +
            weekDays
                .map(
                    (day) =>
                        `<label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">` +
                        `<input type="checkbox" id="day-${day.id}" value="${day.id}" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" ${existingElective?.weekDays?.includes(day.id) ? "checked" : ""
                        } />` +
                        `<span class="text-sm text-gray-700 select-none">${day.label}</span>` +
                        `</label>`
                )
                .join("") +
            "</div>" +
            '<span class="text-xs text-gray-500">Selecciona al menos un día</span>' +
            "</div>" +
            '<div class="flex flex-col gap-0.5">' +
            '<label for="quotas" class="text-sm font-medium">Cupos</label>' +
            `<input id="quotas" type="number" min="1" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700" value="${existingElective?.quotas || 1}" />` +
            "</div>" +
            "</div>" +
            "</div>",
        confirmButtonText: isEdit ? "Guardar cambios" : "Crear electivo",
        confirmButtonColor: "oklch(52.7% 0.154 150.069)",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        showCloseButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById("name").value.trim();
            const description = document.getElementById("description").value.trim();
            const objectives = document.getElementById("objectives").value.trim();
            const prerrequisites = document.getElementById("prerrequisites").value.trim();
            const startTime = document.getElementById("startTime").value;
            const endTime = document.getElementById("endTime").value;
            const quotas = parseInt(document.getElementById("quotas").value.trim(), 10);

            const weekDays = Array.from(
                document.querySelectorAll('input[type="checkbox"]:checked')
            ).map((checkbox) => checkbox.value);

            if (!name || name.length < 3) {
                return Swal.showValidationMessage("El nombre debe tener al menos 3 caracteres");
            }
            if (!description || description.length < 10) {
                return Swal.showValidationMessage("La descripción debe tener al menos 10 caracteres");
            }
            if (!objectives || objectives.length < 10) {
                return Swal.showValidationMessage("Los objetivos deben tener al menos 10 caracteres");
            }
            if (!startTime) {
                return Swal.showValidationMessage("Debe seleccionar una hora de inicio");
            }
            if (!endTime) {
                return Swal.showValidationMessage("Debe seleccionar una hora de fin");
            }
            if (weekDays.length === 0) {
                return Swal.showValidationMessage("Debe seleccionar al menos un día de la semana");
            }
            if (Number.isNaN(quotas) || quotas < 1 || quotas > 200) {
                return Swal.showValidationMessage("Los cupos deben estar entre 1 y 200");
            }

            const [startHour, startMin] = startTime.split(":").map(Number);
            const [endHour, endMin] = endTime.split(":").map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (endMinutes <= startMinutes) {
                return Swal.showValidationMessage("La hora de fin debe ser posterior a la hora de inicio");
            }
            if (endMinutes - startMinutes < 30) {
                return Swal.showValidationMessage("La clase debe durar al menos 30 minutos");
            }


            return {
                name,
                description,
                objectives,
                prerrequisites: prerrequisites || null,
                startTime,
                endTime,
                weekDays,
                quotas,
            };
        },
    });
    return formValues || null;
}

export default Electives;