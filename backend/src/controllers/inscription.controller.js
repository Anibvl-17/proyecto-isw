import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import { createInscriptionBodyValidation, updateStatusValidation } from "../validations/inscription.validation.js";
import { createInscriptionService, getInscriptionService, getInscriptionIdService, deleteInscriptionIdService, updateStatusService, hasInscriptionToElectiveService, getElectivesByPrerequisitesService } from "../services/inscription.service.js";
import { getElectivesService } from "../services/elective.service.js";
import jwt from "jsonwebtoken";
// 1. IMPORTAMOS LA VALIDACIÓN DEL PERIODO
import { checkInscriptionPeriod } from "../services/periodo.service.js";
import { getIO } from "../socket.js";

export async function createInscription(req, res){
    try {
        // 2. VALIDACIÓN NUEVA: Verificar si hay periodo activo para alumnos
        // Si no hay periodo, bloqueamos la inscripción con error 403
        const isPeriodActive = await checkInscriptionPeriod();
        if (!isPeriodActive) {
            return handleErrorClient(res, 403, "El proceso de inscripción no está disponible para alumnos en este momento.");
        }

        const authHeader = req.headers["authorization"];
        if (!authHeader) return handleErrorClient(res, 401, "No autorizado", "No se proporcionó token");

        const token = authHeader.split(" ")[1];
        const payload = jwt.decode(token, process.env.JWT_SECRET);

        const data = {...req.body, userId: payload.id};
        
        const { error } = createInscriptionBodyValidation.validate(data);

        if(error) return handleErrorClient(res, 400, "Parametros invalidos", error.message);

        const hasInscription = await hasInscriptionToElectiveService(payload.id, data.electiveId);
        if(hasInscription) return handleErrorClient(res, 409, "Ya existe una solicitud al electivo indicado");

        const newInscription = await createInscriptionService(data);

        // Emitir evento en tiempo real
        const io = getIO();
        io.emit("elective-quota-updated", {
            electiveId: data.electiveId
        });

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

        // 3. VALIDACIÓN NUEVA: Verificar periodo al eliminar
        // Si el periodo cerró, el alumno no puede borrar su inscripción
        const isPeriodActive = await checkInscriptionPeriod();
        if (!isPeriodActive) {
            return handleErrorClient(res, 403, "El periodo ha cerrado. No puedes anular inscripciones.");
        }

        const inscription = await deleteInscriptionIdService(id);

        if(!inscription) return handleErrorClient(res, 404, "Inscripción no encontrada");

        handleSuccess(res, 200, "Inscripcion eliminada exitosamente", inscription); 
    } catch (error) {
        handleErrorServer(res, 500, "Error al eliminar la inscripcion", error.message);
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

export async function getElectivesByPrerequisites(req, res){
    try {
        let electives = await getElectivesByPrerequisitesService();

        if (!electives) {
            return handleErrorClient(res, 404, "No se encontraron electivos sin requisitos previos.");
        }

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];
        const payload = jwt.decode(token, process.env.JWT_SECRET);

        if(payload.role === "alumno"){
            electives = electives.filter(e => e.status === "Aprobado");

            if (!electives) {
            return handleErrorClient(res, 404, "No se encontraron electivos sin requisitos previos.");
            }

        }

        return handleSuccess(res, 200, "Electivos sin requisitos obtenidos exitosamente", electives);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener los electivos", error.message);
    }
}

export async function getInscriptionsByElective(req, res){
    try {
        const { id } = req.params;

        const electiveId = parseInt(id);
        if (isNaN(electiveId)) {
            return handleErrorClient(res, 400, "ID de electivo inválido");
        }

        let inscriptions = await getInscriptionService();

        inscriptions = inscriptions.filter(
            (inscription) => inscription.electiveId === electiveId
        );

        return handleSuccess(
            res,
            200,
            inscriptions.length === 0
            ? "No hay inscripciones para este electivo"
            : "Inscripciones encontradas",
            inscriptions
        );
    } catch (error) {
        return handleErrorServer(
            res,
            500,
            "Error al obtener las inscripciones",
            error.message
        );
    }
}
