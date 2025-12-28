import { AppDataSource } from "../config/configDb.js";
import { ElectiveEntity } from "../entities/elective.entity.js";
import { Inscription } from "../entities/inscription.entity.js";
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
      { studentId, electiveId, status: "pendiente" },
      { studentId, electiveId, status: "aprobado" },
    ],
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

  // En caso de aprobar la solicitud, se crea la inscripción
  if (request.status === "aprobado") {
    const { studentId, electiveId } = request;
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    const elective = await electiveRepository.findOne({ where: { id: electiveId } });

    elective.quotas -= 1;
    await electiveRepository.save(elective);
    const newInscription = inscriptionRepository.create({
      userId: studentId,
      electiveId: elective.id,
      estado: "aprobado",
      reviewedAt: new Date(),
    });

    return await inscriptionRepository.save(newInscription);
  }

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
