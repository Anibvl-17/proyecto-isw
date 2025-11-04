import * as periodoService from "../services/periodo.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { periodoBodyValidation } from "../validations/periodo.validation.js";

// Crear un periodo
export async function createPeriodo(req, res) {
  try {
    const { body } = req;
    const { error } = periodoBodyValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros inválidos", error.message);
    }
    
    const nuevoPeriodo = await periodoService.createPeriodoService(body);
    handleSuccess(res, 201, "Período creado exitosamente", nuevoPeriodo);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear el período", error.message);
  }
}

// Obtener todos los periodos
export async function getPeriodos(req, res) {
  try {
    const periodos = await periodoService.getPeriodosService();
    handleSuccess(res, 200, "Períodos obtenidos", periodos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener períodos", error.message);
  }
}

// Obtener un periodo por ID
export async function getPeriodoById(req, res) {
  try {
    const { id } = req.params;
    const periodo = await periodoService.getPeriodoByIdService(id);
    handleSuccess(res, 200, "Período obtenido", periodo);
  } catch (error) {
    if (error.message === "Período no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al obtener el período", error.message);
    }
  }
}

// Actualizar un periodo
export async function updatePeriodo(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;
    const { error } = periodoBodyValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros inválidos", error.message);
    }

    const periodoActualizado = await periodoService.updatePeriodoService(id, body);
    handleSuccess(res, 200, "Período actualizado", periodoActualizado);
  } catch (error) {
    if (error.message === "Período no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al actualizar el período", error.message);
    }
  }
}

// Eliminar un periodo
export async function deletePeriodo(req, res) {
  try {
    const { id } = req.params;
    await periodoService.deletePeriodoService(id);
    handleSuccess(res, 200, "Período eliminado exitosamente");
  } catch (error) {
    if (error.message === "Período no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al eliminar el período", error.message);
    }
  }
}
