import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import { createInscriptionBodyValidation, updateStatusValidation } from "../validations/inscription.validation.js";
import { createInscriptionService, getInscriptionService, getInscriptionIdService, deleteInscriptionIdService, updateStatusService } from "../services/inscription.service.js";

export async function createInscription(req, res){
    try {
        const data = req.body;
        const { error } = createInscriptionBodyValidation.validate(data);

        if(error) return handleErrorClient(res, 400, "Parametros invalidos", error.message);

        const newInscription = await createInscriptionService(data);
        handleSuccess(res, 201, "Inscripcion creada exitosamente", newInscription);
    } catch (error) {
        handleErrorServer(res, 500, "Error al crear la solicitud", error.message);
    }
}

export async function getInscription(req, res){
    try {
        const inscription = await getInscriptionService();
        handleSuccess(res, 200, "Inscripciones obtenidas exitosamente", inscription);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener las solicitudes", error.message);
    }
}

export async function getInscriptionId(req, res){
    try {
        const { id } = req.params;
        const inscription = await getInscriptionIdService(id);

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