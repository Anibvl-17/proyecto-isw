import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import { createInscriptionBodyValidation, updateStatusValidation } from "../validations/inscription.validation.js";
import { createInscriptionService, getInscriptionService, getInscriptionIdService, deleteInscriptionIdService, updateStatusService } from "../services/inscription.service.js";

export async function createInscription(req, res){//Ver bien como implementar que e jefe de carrera peda inscribir a un alumno a electivo ya que se puede dar el alumno caso de que no pueda 
                                                    //Inscribirse porque estan los cupos llenos entonces el jede de carrera podria hacerlo
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

export async function getInscription(req, res){ //modificarlo para que el docente pueda ver todas las inscripcions de los estudiantes su electivo correspondiente
                                                //modificar para que el alumno pueda ver todas las inscripciones a las que ya se a inscrito
    try {
        const inscription = await getInscriptionService();

        if(inscription.length < 1) return handleSuccess(res, 404, "No se encontro ninguna inscripcion");

        handleSuccess(res, 200, "Inscripciones obtenidas exitosamente", inscription);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener las solicitudes", error.message);
    }
}

export async function getInscriptionId(req, res){ //modificar para que el alumno pueda ver una de las inscripciones a la que ya esta inscrito
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