import axios from "./root.service.js";

export async function getInscription() {
    try {
        const response = await axios.get("/inscription");

        return {
            success: true,
            data: response.data.data,
        };
        } catch (error) {
            console.error("Error en el servicio de obtener inscripcion:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Error al conectar con el servidor",
            };
    }
}

export async function getInscriptionId(id) {
    try {
        const response = await axios.get(`/inscription/${id}`);

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error("Error en el servicio de obtener inscripciones por id:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error al conectar con el servidor",
        };
    }
}

export async function createInscription(data) {
    try {
        const response = await axios.post("/inscription", data);

        return {
            success: true,
            data: response.data.data,
            message: "Inscripción creada exitosamente"
        };
    } catch (error) {
        console.error("Error en el servicio de crear la inscripcion:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error al conectar con el servidor",
        };
    }
}

export async function updateStatus(id, data) {
    try {
        const response = await axios.patch(`/inscription/status/${id}`, data);

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error("Error en el servicio de cambiar el estado de inscripcion:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error al conectar con el servidor",
        };
    }
}

export async function deleteInscription(id) {
    try {
        const response = await axios.delete(`/inscription/${id}`);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error("Error en el servicio de eliminar inscripción:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error al eliminar la inscripción",
        };
    }
}

export async function getElectivesByPrerequisites() {
    try {
        const response = await axios.get("/inscription/filter");
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error("Error al obtener electivos sin requisitos:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error al conectar con el servidor",
        };
    }
}