import axios from "./root.service.js";

export async function getRequests() {
  try {
    const response = await axios.get("/requests");

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error en el servicio de getRequests():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}

export async function getRequestById(id) {
  try {
    const response = await axios.get(`/requests/${id}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error en el servicio getRequestById():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}

export async function createRequest(data) {
  try {
    const response = await axios.post("/requests", data);

    return {
      success: true,
      message: response,
    };
  } catch (error) {
    console.error("Error en el servicio createRequest():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}

export async function reviewRequest(id, data) {
  try {
    const response = await axios.patch(`/requests/review/${id}`, data);

    return {
      success: true,
      message: response,
    };
  } catch (error) {
    console.error("Error en el servicio reviewRequest():", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}
