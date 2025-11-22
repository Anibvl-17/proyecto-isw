import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import { createInscriptionBodyValidation, updateStatusValidation } from "../validations/inscription.validation.js";
import { createInscriptionService, getInscriptionService, getInscriptionIdService, deleteInscriptionIdService, updateStatusService, hasInscriptionToElectiveService } from "../services/inscription.service.js";
import { getElectivesService } from "../services/elective.service.js";
import jwt from "jsonwebtoken";

export async function createInscription(req, res){//Ver bien como implementar que e jefe de carrera peda inscribir a un alumno a electivo ya que se puede dar el alumno caso de que no pueda 
                                                    //Inscribirse porque estan los cupos llenos entonces el jede de carrera podria hacerlo
    try {
        const data = req.body;
        const { error } = createInscriptionBodyValidation.validate(data);

        if(error) return handleErrorClient(res, 400, "Parametros invalidos", error.message);

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];
        const payload = jwt.decode(token, process.env.JWT_SECRET);
        data.userId = payload.id;

        const hasInscription = await hasInscriptionToElectiveService(payload.id, data.electiveId);
        if(hasInscription) return handleErrorClient(res, 409, "Ya existe una solicitud al electivo indicado");

        const newInscription = await createInscriptionService(data);
        handleSuccess(res, 201, "Inscripcion creada exitosamente", newInscription);
    } catch (error) {
        handleErrorServer(res, 500, "Error al crear la solicitud", error.message);
    }
}

export async function getInscription(req, res){
    try {
        let inscriptions = await getInscriptionService();
        
        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];
        const payload = jwt.decode(token, process.env.JWT_SECRET);

        if (payload.role === "alumno"){
            inscriptions = inscriptions.filter((inscription) => inscription.userId === payload.id);
        } else if (payload.role === "docente"){
            const electives = await getElectivesService();

            const myElectives = electives.filter(elective => elective.teacherRut === payload.rut).map(elective => elective.id);

            inscriptions = inscriptions.filter((inscription) => myElectives.includes(inscription.electiveId));
        }

        if(inscriptions.length < 1) return handleSuccess(res, 404, "No se encontro ninguna inscripcion");

        handleSuccess(res, 200, "Inscripciones obtenidas exitosamente", inscriptions);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener las solicitudes", error.message);
    }
}

export async function getInscriptionId(req, res){
    try {
        const { id } = req.params;
        const inscription = await getInscriptionIdService(id);

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];
        const payload = jwt.decode(token, process.env.JWT_SECRET);

        if(payload.role === "alumno" && inscription.userId !== payload.id){
            return handleErrorClient(res, 403, "La solicitud no corresponde al alumno");
        }

        handleSuccess(res, 200, "Inscripcion encontrada", inscription);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener la solicitud", error.message);
    }
}

export async function deleteInscriptionId(req, res){
    try {
        const { id } = req.params;
        const inscription = await deleteInscriptionIdService(id);

        if(!inscription) return handleErrorClient(res, 404, "Inscripción no encontrada");

        handleSuccess(res, 200, "Inscripcion eliminada exitosamente", inscription); 
    } catch (error) {
        return handleErrorServer(res, 500, "Error al eliminar la inscripcion", error.message);
    }
}

export async function updateStatus(req, res){
    try {
        const data = req.body;
        const { id } = req.params;

        const inscription = await getInscriptionIdService(id);
        if(inscription.estado !== "pendiente"){
            return handleErrorClient(res, 400, "La inscripcion ya fue revisada");
        }

        const { error } = updateStatusValidation.validate(data);
        if ( error ) return handleErrorClient(res, 400, "Parametros invalidos", error.message);

        const updateStatus = await updateStatusService(id, data);
        handleSuccess(res, 200, "Solicitud revisada exitosamente", updateStatus);
    } catch (error) {
        handleErrorServer(res, 500, "Error al revisar la inscripcion", error.message);
    }
}