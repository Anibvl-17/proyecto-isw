import axios from "./root.service.js";

export async function getElectives() {
  try {
    const response = await axios.get("/electives");
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Electivos cargados correctamente",
    };
  } catch (error) {
    console.error("Error en getElectives():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al cargar los electivos",
    };
  }
}

export async function getElectiveById(id) {
  try {
    const response = await axios.get(`/electives/${id}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error en getElectiveById():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Electivo no encontrado",
    };
  }
}

export async function createElective(data) {
  try {
    const response = await axios.post("/electives", data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error en createElective():", error);
    return {
      success: false,
      message: error.response?.data?.message || "No se pudo crear el electivo",
    };
  }
}

export async function updateElective(id, data) {
  try {
    const response = await axios.patch(`/electives/${id}`, data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Electivo actualizado correctamente",
    };
  } catch (error) {
    console.error("Error en updateElective():", error);
    return {
      success: false,
      message: error.response?.data?.message || "No se pudo actualizar el electivo",
    };
  }
}

export async function deleteElective(id) {
  try {
    const response = await axios.delete(`/electives/${id}`);
    return {
      success: true,
      message: response.data.message || "Electivo eliminado correctamente",
    };
  } catch (error) {
    console.error("Error en deleteElective():", error);
    return {
      success: false,
      message: error.response?.data?.message || "No se pudo eliminar el electivo",
    };
  }
}

export async function changeElectiveStatus(id, payload) {
  try {
    const { data } = await axios.patch(`/electives/status/${id}`, payload);
    return {
      success: true,
      data: data.data,
      message: data.message 
    };
  } catch (error) {
    console.error("Error en changeElectiveStatus():", error);
    return {
      success: false,
      message: error.response?.data?.message || "No se pudo cambiar el estado del electivo",
    };
  }
}