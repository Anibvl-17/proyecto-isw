import axios from "./root.service";

// Obtener todos los periodos (para la gestión de la jefa de carrera)
export const getPeriodos = async () => {
  try {
    const response = await axios.get("/periodos");
    if (response.status === 200) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error al obtener periodos:", error);
    return [];
  }
};

// Crear un nuevo periodo
export const createPeriodo = async (data) => {
  try {
    const response = await axios.post("/periodos", data);
    if (response.status === 201) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error al crear periodo:", error);
    throw error;
  }
};

// Actualizar un periodo existente
export const updatePeriodo = async (id, data) => {
  try {
    const response = await axios.put(`/periodos/${id}`, data);
    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error al actualizar periodo:", error);
    throw error;
  }
};

// Eliminar un periodo
export const deletePeriodo = async (id) => {
  try {
    const response = await axios.delete(`/periodos/${id}`);
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error al eliminar periodo:", error);
    throw error;
  }
};

// Obtener los periodos activos para el usuario actual
export const getActivePeriod = async () => {
  try {
    const response = await axios.get("/periodos/active");
    if (response.status === 200) {
      const periods = response.data.data;
      return Array.isArray(periods) ? periods : [];
    }
    return [];
  } catch (error) {
    console.error("Error al obtener periodos activos:", error);
    return [];
  }
};