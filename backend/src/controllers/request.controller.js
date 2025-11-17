import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { createRequestService, getRequestsService, getRequestByIdService, reviewRequestService, hasRequestOfElectiveService } from "../services/request.service.js";
import { createRequestBodyValidation, reviewRequestValidation } from "../validations/request.validation.js";
import jwt from "jsonwebtoken";

export async function createRequest(req, res) {
  try {
    const { body } = req;
    const { error } = createRequestBodyValidation.validate(body);

    if (error) return handleErrorClient(res, 400, "Parámetros inválidos", error.message);

    // Verifica si ya existe una solicitud al electivo anteriormente para evitar 
    // solicitudes duplicadas
    const hasRequest = await hasRequestOfElectiveService(body.studentId, body.electiveId);
    if (hasRequest) return handleErrorClient(res, 409, "Ya existe una solicitud al electivo indicado");

    const newRequest = await createRequestService(body);
    handleSuccess(res, 201, "Solicitud creada exitosamente", newRequest);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear la solicitud", error.message);
  }
}

export async function getRequests(req, res) {
  try {
    let requests = await getRequestsService();

    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    const payload = jwt.decode(token, process.env.JWT_SECRET);

    // Los alumnos solo pueden ver sus propias solicitudes
    if (payload.role === "alumno") {      
      requests = requests.filter((request) => request.studentId === payload.id);
    }
    
    if (requests.length === 0) return handleSuccess(res, 404, "No hay solicitudes disponibles");
    handleSuccess(res, 200, "Solicitudes obtenidas exitosamente", requests);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener las solicitudes", error.message);
  }
}

export async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    const request = await getRequestByIdService(id);

    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    const payload = jwt.decode(token, process.env.JWT_SECRET);

    if (payload.role === "alumno" && request.studentId !== payload.id) {
      return handleErrorClient(res, 401, "La solicitud no corresponde al alumno");
    }

    handleSuccess(res, 200, "Solicitud encontrada", request);
  } catch (error) {
    if (error.message === "Solicitud no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al obtener la solicitud", error.message);
    }
  }
}

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