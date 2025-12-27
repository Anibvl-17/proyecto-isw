import { useEffect, useState } from "react";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Edit2, Trash2, CalendarPlus, Eye, EyeOff, Users, GraduationCap, User } from "lucide-react";
import { getPeriodos, createPeriodo, updatePeriodo, deletePeriodo } from "@services/periodo.service";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";
import Swal from "sweetalert2";

const Periodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPeriodos = async () => {
    try {
      setLoading(true);
      const data = await getPeriodos();
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener periodos", error);
      setPeriodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const dateFormatter = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePeriodoDialog = async (periodoToEdit = null) => {
    const isEdit = !!periodoToEdit;

    const formatForInput = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    };

    const result = await Swal.fire({
      title: isEdit ? "Editar Periodo" : "Crear Periodo",
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="text-sm font-medium">Nombre del Periodo</label>
            <input id="nombre" class="swal2-input m-0" placeholder="Ej: Inscripción 2025-1" value="${periodoToEdit?.nombre || ''}">
          </div>
          <div>
            <label class="text-sm font-medium">Fecha Inicio</label>
            <input type="datetime-local" id="fechaInicio" class="swal2-input m-0" value="${formatForInput(periodoToEdit?.fechaInicio)}">
          </div>
          <div>
            <label class="text-sm font-medium">Fecha Cierre</label>
            <input type="datetime-local" id="fechaCierre" class="swal2-input m-0" value="${formatForInput(periodoToEdit?.fechaCierre)}">
          </div>
          
          <div>
            <label class="text-sm font-medium">¿Para quién es el periodo?</label>
            <select id="visibilidad" class="swal2-select m-0">
              <option value="alumnos" ${periodoToEdit?.visibilidad === 'alumnos' ? 'selected' : ''}>Solo Alumnos</option>
              <option value="docentes" ${periodoToEdit?.visibilidad === 'docentes' ? 'selected' : ''}>Solo Docentes</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Guardar Cambios" : "Crear",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true, 
      preConfirm: async () => {
        const nombre = document.getElementById("nombre").value.trim();
        const fechaInicio = document.getElementById("fechaInicio").value;
        const fechaCierre = document.getElementById("fechaCierre").value;
        const visibilidad = document.getElementById("visibilidad").value;

        if (!nombre || !fechaInicio || !fechaCierre) {
          Swal.showValidationMessage("Completa los campos obligatorios");
          return false;
        }
        if (new Date(fechaCierre) <= new Date(fechaInicio)) {
          Swal.showValidationMessage("La fecha de cierre debe ser posterior a la de inicio");
          return false;
        }

        const dataToSend = {
          nombre,
          fechaInicio,
          fechaCierre,
          restriccionCarreras: null,
          restriccionAño: null,
          visibilidad,
        };

        try {
            if (isEdit) {
                await updatePeriodo(periodoToEdit.id, dataToSend);
            } else {
                await createPeriodo(dataToSend);
            }
            return true; 
        } catch (error) {
            const message = error.response?.data?.message || "Error desconocido al procesar";
            Swal.showValidationMessage(message);
            return false; 
        }
      },
    });

    if (result.isConfirmed) {
      showSuccessAlert(
        isEdit ? "¡Actualizado!" : "¡Creado!",
        isEdit ? "Periodo modificado correctamente." : "Periodo creado correctamente."
      );
      fetchPeriodos();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deletePeriodo(id);
        showSuccessAlert("Eliminado", "Periodo eliminado correctamente.");
        fetchPeriodos();
      } catch (error) {
        showErrorAlert("Error", "No se pudo eliminar el periodo.");
      }
    }
  };

  const renderVisibilidadBadge = (visibilidad) => {
    switch (visibilidad) {
      case "todos": 
        return <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200"><Users className="w-4 h-4" /> Todos</span>;
      case "alumnos":
        return <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200"><GraduationCap className="w-4 h-4" /> Alumnos</span>;
      case "docentes":
        return <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200"><User className="w-4 h-4" /> Docentes</span>;
      default:
        return <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200"><EyeOff className="w-4 h-4" /> Oculto</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col p-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-xl">Gestión de Periodos</h1>
              <p className="text-gray-500">Configura las fechas de inscripción de electivos</p>
            </div>

            <button
              onClick={() => handlePeriodoDialog()}
              className="bg-blue-600 text-white font-medium text-sm px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              <CalendarPlus className="h-4 w-4" />
              Nuevo Periodo
            </button>
          </div>

          <div className="w-full overflow-auto border border-gray-300 rounded-lg">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th className="h-12 px-4 text-left font-medium">Nombre</th>
                  <th className="h-12 px-4 text-left font-medium">Inicio</th>
                  <th className="h-12 px-4 text-left font-medium">Cierre</th>
                  <th className="h-12 px-4 text-left font-medium">Visibilidad</th>
                  <th className="h-12 px-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">Cargando...</td>
                  </tr>
                ) : periodos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      No hay periodos registrados
                    </td>
                  </tr>
                ) : (
                  periodos.map((periodo) => (
                    <tr key={periodo.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium">{periodo.nombre}</td>
                      <td className="p-4">{dateFormatter(periodo.fechaInicio)}</td>
                      <td className="p-4">{dateFormatter(periodo.fechaCierre)}</td>
                      <td className="p-4">{renderVisibilidadBadge(periodo.visibilidad)}</td>
                      <td className="p-4 flex justify-center gap-2">
                        <button
                          onClick={() => handlePeriodoDialog(periodo)}
                          className="p-2 hover:bg-gray-200 rounded-full text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(periodo.id)}
                          className="p-2 hover:bg-gray-200 rounded-full text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Periodos;