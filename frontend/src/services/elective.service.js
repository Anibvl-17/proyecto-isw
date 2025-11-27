import axios from "./root.service.js";

export async function getElectives() {
  try {
    const response = await axios.get("/electives");
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error en el servicio getElectives():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
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
    console.error("Error en el servicio getElectiveById():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
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
    console.error("Error en el servicio createElective():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}

export async function updateElective(id, data) {
  try {
    const response = await axios.patch(`/electives/${id}`, data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error en el servicio updateElective():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}

export async function deleteElective(id) {
  try {
    const response = await axios.delete(`/electives/${id}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error en el servicio deleteElective():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}
