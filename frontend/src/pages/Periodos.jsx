import { useEffect, useState } from "react";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Edit2, Trash2, CalendarPlus } from "lucide-react"; // ← FIX: se eliminó CalendarRange
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
      setPeriodos(data);
    } catch (error) {
      console.error("Error al obtener periodos", error);
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

  // Crear o Editar periodo
  const handlePeriodoDialog = async (periodoToEdit = null) => {
    const isEdit = !!periodoToEdit;

    // Formatear datetime-local
    const formatForInput = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    };

    const { value: formValues } = await Swal.fire({
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
            <label class="text-sm font-medium">Restricción Carreras</label>
            <div class="flex gap-4 mt-2">
                <label class="flex items-center gap-2">
                    <input type="checkbox" id="check_icinf" ${periodoToEdit?.restriccionCarreras?.includes('ICINF') ? 'checked' : ''}> ICINF
                </label>
                <label class="flex items-center gap-2">
                    <input type="checkbox" id="check_ieci" ${periodoToEdit?.restriccionCarreras?.includes('IECI') ? 'checked' : ''}> IECI
                </label>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium">Restricción Año (Opcional)</label>
            <input type="number" id="restriccionAño" class="swal2-input m-0" placeholder="Ej: 4" value="${periodoToEdit?.restriccionAño || ''}">
          </div>

          <div class="flex items-center gap-2 mt-2">
            <input type="checkbox" id="visible" ${periodoToEdit?.visible ? 'checked' : ''}>
            <label for="visible" class="text-sm font-medium">Visible para alumnos</label>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Guardar Cambios" : "Crear",
      cancelButtonText: "Cancelar",

      preConfirm: () => {
        const nombre = document.getElementById("nombre").value;
        const fechaInicio = document.getElementById("fechaInicio").value;
        const fechaCierre = document.getElementById("fechaCierre").value;
        const icinf = document.getElementById("check_icinf").checked;
        const ieci = document.getElementById("check_ieci").checked;
        const restriccionAño = document.getElementById("restriccionAño").value;
        const visible = document.getElementById("visible").checked;

        if (!nombre || !fechaInicio || !fechaCierre) {
          Swal.showValidationMessage("Por favor completa los campos obligatorios");
          return false;
        }

        if (new Date(fechaCierre) <= new Date(fechaInicio)) {
          Swal.showValidationMessage("La fecha de cierre debe ser posterior a la de inicio");
          return false;
        }

        const carreras = [];
        if (icinf) carreras.push("ICINF");
        if (ieci) carreras.push("IECI");

        return {
          nombre,
          fechaInicio,
          fechaCierre,
          restriccionCarreras: carreras.length > 0 ? carreras : null,
          restriccionAño: restriccionAño ? parseInt(restriccionAño) : null,
          visible,
        };
      },
    });

    if (formValues) {
      try {
        if (isEdit) {
          await updatePeriodo(periodoToEdit.id, formValues);
          showSuccessAlert("¡Actualizado!", "El periodo ha sido modificado.");
        } else {
          await createPeriodo(formValues);
          showSuccessAlert("¡Creado!", "El periodo ha sido creado exitosamente.");
        }
        fetchPeriodos();
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", "Hubo un problema al guardar el periodo.");
      }
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
        showSuccessAlert("Eliminado", "El periodo ha sido eliminado.");
        fetchPeriodos();
      } catch (error) {
        showErrorAlert("Error", "No se pudo eliminar el periodo.");
      }
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
                  <th className="h-12 px-4 text-left font-medium">Carreras</th>
                  <th className="h-12 px-4 text-left font-medium">Estado</th>
                  <th className="h-12 px-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">Cargando...</td>
                  </tr>
                ) : periodos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">
                      No hay periodos registrados
                    </td>
                  </tr>
                ) : (
                  periodos.map((periodo) => (
                    <tr key={periodo.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium">{periodo.nombre}</td>
                      <td className="p-4">{dateFormatter(periodo.fechaInicio)}</td>
                      <td className="p-4">{dateFormatter(periodo.fechaCierre)}</td>

                      <td className="p-4">
                        {periodo.restriccionCarreras ? (
                          <div className="flex gap-1">
                            {periodo.restriccionCarreras.map((c) => (
                              <span key={c} className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Todas</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            periodo.visible
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {periodo.visible ? "Visible" : "Oculto"}
                        </span>
                      </td>

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
