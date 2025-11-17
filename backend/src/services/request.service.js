import { AppDataSource } from "../config/configDb.js";
import { Request } from "../entities/request.entity.js";

export async function createRequestService(data) {
  const requestRepository = AppDataSource.getRepository(Request);

  const newRequest = requestRepository.create(data);
  return await requestRepository.save(newRequest);
}

export async function getRequestsService() {
  const requestRepository = AppDataSource.getRepository(Request);

  return await requestRepository.find();
}

export async function getRequestByIdService(id) {
  const requestRepository = AppDataSource.getRepository(Request);
  const request = await requestRepository.findOneBy({ id: parseInt(id) });

  if (!request) throw new Error("Solicitud no encontrada");

  return request;
}

// Verifica si existe una solicitud en estado pendiente o aprobada según el id de electivo
export async function hasRequestOfElectiveService(studentId, electiveId) {
  const requestRepository = AppDataSource.getRepository(Request);
  const request = await requestRepository.find({
    where: [
      {studentId, electiveId, status: "pendiente"},
      {studentId, electiveId, status: "aprobado"}
      ]
  });

  if (request.length === 0) return false;
  
  return true;
}

export async function reviewRequestService(id, data) {
  const requestRepository = AppDataSource.getRepository(Request);
  const request = await getRequestByIdService(id);

  request.status = data.status;
  request.reviewerId = data.reviewerId;
  request.reviewedAt = new Date(); // Revisado en la fecha actual

  if (data.status === "rechazado") {
    request.reviewComment = data.reviewComment;
  }

  const updatedRequest = await requestRepository.save(request);
  return updatedRequest;
}

// Implementada solo para admin!
export async function deleteRequest(id) {
  const requestRepository = AppDataSource.getRepository(Request);
  const request = await requestRepository.findOneBy({ id });

  if (!request) return false;

  await requestRepository.delete(request);
  return true;
}