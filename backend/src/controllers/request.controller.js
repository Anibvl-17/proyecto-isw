import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { createRequestService, getRequestsService, getRequestByIdService, reviewRequestService } from "../services/request.service.js";
import { createRequestBodyValidation, reviewRequestValidation } from "../validations/request.validation.js";

export async function createRequest(req, res) {
  try {
    const { body } = req;
    const { error } = createRequestBodyValidation.validate(body);

    if (error) return handleErrorClient(res, 400, "Parámetros inválidos", error.message);

    // Verificar si ya hizo una solicitud al electivo anteriormente
    // para evitar solicitudes duplicadas

    const newRequest = await createRequestService(body);
    handleSuccess(res, 201, "Solicitud creada exitosamente", newRequest);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear la solicitud", error.message);
  }
}

// En caso de ser estudiante, obtener solo las solicitudes propias
// En caso de ser jefe de carrera, ver todas las solicitudes
export async function getRequests(req, res) {
  try {
    const requests = await getRequestsService();

    if (requests.length === 0) handleSuccess(res, 404, "No hay solicitudes disponibles");

    handleSuccess(res, 200, "Solicitudes obtenidas exitosamente", requests);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener las solicitudes", error.message);
  }
}

// Igual que en el caso anterior, solo solicitudes propias para estudiante
// Jefe de carrera puede ver todas las solictudes
export async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    
    const request = await getRequestByIdService(id);
    handleSuccess(res, 200, "Solicitud encontrada", request);
  } catch (error) {
    if (error.message === "Solicitud no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al obtener la solicitud", error.message);
    }
  }
}

// Solo el jefe de carrera puede revisar solicitudes
export async function reviewRequest(req, res) {
  try {
    const { body } = req;
    const { id } = req.params;

    const request = await getRequestByIdService(id);
    if (request.status !== "pendiente") {
      return handleErrorClient(res, 409, "La solicitud ya fue revisada");
    }

    const { error } = reviewRequestValidation.validate(body);
    if (error) return handleErrorClient(res, 400, "Parámetros inválidos", error.message);

    const updatedRequest = await reviewRequestService(id, body);
    handleSuccess(res, 200, "Solicitud revisada exitosamente", updatedRequest);
  } catch (error) {
    if (error.message === "Solicitud no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al revisar la solicitud", error.message);
    }
  }
}