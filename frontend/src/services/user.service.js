import axios from "./root.service.js";

export async function getUsers() {
  try {
    const response = await axios.get("/users");

    return {
      success: true,
      data: response.data.data
    }
  } catch (error) {
    console.error("Error en el servicio de obtener usuarios:", error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor",
    };
  }
}

export async function getUserById(id) {
  try {
    const response = await axios.get(`/users/${id}`);
    
    return {
      success: true,
      data: response.data.data,
    }
  } catch (error) {
    console.error("Error en el servicio de obtener usuario por id:", error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor"
    }
  }
}

export async function editUser(id, data) {
  try {
    const response = await axios.patch(`/users/${id}`, data);

    return {
      success: true,
      data: response.data.data,
    }
  } catch (error) {
    console.error("Error en el servicio de editar usuario:", error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || "Error al conectar con el servidor"
    }
  }
}
