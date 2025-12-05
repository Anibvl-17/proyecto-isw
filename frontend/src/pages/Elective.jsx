import { useEffect, useState } from "react";
import {
    getElectives,
    createElective,
    updateElective,
    deleteElective,
} from "@services/elective.service";
import { getElectivesByPrerequisites } from "@services/inscription.service";
import { showErrorAlert } from "@helpers/sweetAlert";
import { useAuth } from "@context/AuthContext";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Badge } from "@components/Badge";
import { Elective } from "@components/Elective";
import { CheckCircle, PlusCircle, Pencil, Trash2, Filter, X } from "lucide-react";
import Swal from "sweetalert2";

const Electives = () => {
    const [loading, setLoading] = useState(false);
    const [electives, setElectives] = useState([]);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const { user } = useAuth();
    const isDocente = user.role === "docente";
    const isAlumno = user.role === "alumno";
    const isJefeCarrera = user.role === "jefe_carrera";

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
                        {!loading && electives.length === 0 && (<p className="text-gray-600 italic w-full flex flex-row gap-3 items-center"><CheckCircle className="h-5 w-5" />No hay electivos disponibles.</p>)}
                        {!loading && electives.length > 0 && (<Badge type="info" text={`${electives.length} electivo${electives.length > 1 ? "s" : ""}`} />)}
                    </div>
                    {!loading && electives.length > 0 && isAlumno &&(
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
                                        <th className="min-w-40 h-12 px-4 text-left font-medium">Objetivos</th>
                                        <th className="min-w-40 h-12 px-4 text-left font-medium">Prerrequisitos</th>
                                        <th className="min-w-32 h-12 px-4 text-left font-medium">Horario</th>
                                        <th className="min-w-20 h-12 px-4 text-center font-medium">Cupos</th>
                                        {(isJefeCarrera || isDocente) && (
                                            <th className="min-w-20 h-12 px-4 text-center font-medium">Estado</th>
                                        )}
                                        {isDocente && (
                                            <th className="min-w-24 h-12 px-4 text-center font-medium">Acciones</th>
                                        )}
                                        {isJefeCarrera && (
                                            <th className="min-w-24 h-12 px-4 text-center font-medium">Detalles</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {electives.map((elective) => (
                                        <Elective
                                            key={elective.id}
                                            elective={elective}
                                            onEdit={handleEditElective}
                                            onDelete={handleDeleteElective}
                                        />
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

async function electiveDialog(existingElective = null) {
    const isEdit = !!existingElective;
    const { value: formValues } = await Swal.fire({
        html:
            '<div class="text-start">' +
            `<p class="font-bold text-md mb-1">${isEdit ? "Editar electivo" : "Crear electivo"}</p>` +
            `<p class="text-sm text-gray-500">${isEdit ? "Modifica la información del electivo." : "Completa la información para crear un nuevo electivo."}</p>` +
            '<div class="flex flex-col gap-4 mt-4">' +
            // nombre
            '<div class="flex flex-col gap-0.5">' +
            '<label for="name" class="text-sm font-medium">Nombre</label>' +
            `<input id="name" type="text" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700" value="${existingElective?.name || ""}" />` +
            "</div>" +
            // descripción
            '<div class="flex flex-col gap-0.5">' +
            '<label for="description" class="text-sm font-medium">Descripción</label>' +
            `<textarea id="description" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">${existingElective?.description || ""}</textarea>` +
            "</div>" +
            // objetivos
            '<div class="flex flex-col gap-0.5">' +
            '<label for="objectives" class="text-sm font-medium">Objetivos</label>' +
            `<textarea id="objectives" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">${existingElective?.objectives || ""}</textarea>` +
            "</div>" +
            // prerrequisitos
            '<div class="flex flex-col gap-0.5">' +
            '<label for="prerrequisites" class="text-sm font-medium">Prerrequisitos</label>' +
            `<textarea id="prerrequisites" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700">${existingElective?.prerrequisites || ""}</textarea>` +
            "</div>" +
            // horario
            '<div class="flex flex-col gap-0.5">' +
            '<label for="schedule" class="text-sm font-medium">Horario</label>' +
            `<input id="schedule" type="text" class="border border-gray-300 px-2 py-1 text-sm rounded-md outline-0 transition-all hover:shadow-sm focus:border-blue-700" value="${existingElective?.schedule || ""}" />` +
            "</div>" +
            // cupos
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
            const schedule = document.getElementById("schedule").value.trim();
            const quotas = parseInt(document.getElementById("quotas").value.trim(), 10);

            if (!name) return Swal.showValidationMessage("El nombre es obligatorio");
            if (!description) return Swal.showValidationMessage("La descripción es obligatoria");
            if (!objectives) return Swal.showValidationMessage("Los objetivos son obligatorios");
            if (!schedule) return Swal.showValidationMessage("El horario es obligatorio");
            if (Number.isNaN(quotas) || quotas <= 0) return Swal.showValidationMessage("Los cupos deben ser un número mayor a 0");

            return { name, description, objectives, prerrequisites, schedule, quotas };
        },
    });
    return formValues || null;
}

export default Electives;
