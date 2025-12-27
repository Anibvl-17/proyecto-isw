import { AppDataSource } from "../config/configDb.js";
import { Inscription } from "../entities/inscription.entity.js";
import { ElectiveEntity } from "../entities/elective.entity.js";
import { IsNull, Not } from "typeorm";

export async function createInscriptionService(data){
    const { userId, electiveId } = data;
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);

    const elective = await electiveRepository.findOne({ where: { id: data.electiveId }});

    if(!elective) throw new Error("Electivo no encontrado");

    if(elective.quotas <= 0) throw new Error("No hay cupos disponibles para este electivo");

    const inscription = await inscriptionRepository.findOne({ where: { userId, elective: { id: elective.id }}});

    if (inscription) {
    throw new Error("Ya tienes una inscripción para este electivo");
    }

    elective.quotas -= 1;
    await electiveRepository.save(elective);

    const newInscription = inscriptionRepository.create({userId, electiveId, estado: "pendiente"});

    return await inscriptionRepository.save(newInscription);
}

export async function hasInscriptionToElectiveService(userId, electiveId){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const inscription = await inscriptionRepository.find({ where: [{userId, electiveId, estado: "pendiente"}, {userId, electiveId, estado: "aprobado"}]});

    if(inscription.length === 0) return false;

    return true;
}

export async function getInscriptionService(){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);

    return await inscriptionRepository.find();
}

export async function getInscriptionIdService(id){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const inscription = await inscriptionRepository.findOneBy({ id: parseInt(id) });

    if (!inscription) throw new Error("Inscripcion no encontrada");
    
    return inscription;
}

export async function deleteInscriptionIdService(id){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const inscription = await inscriptionRepository.findOneBy({ id });

    if(!inscription) return false;

    if(inscription.estado === "aprobado") throw new Error("No se puede eliminar ina inscripcion aprobada");

    if (inscription.estado === "pendiente") {
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        const elective = await electiveRepository.findOne({ where: { id: inscription.electiveId } });
        
        if (elective) {
            elective.quotas += 1;
            await electiveRepository.save(elective);
        }
    }

    await inscriptionRepository.remove(inscription);
    return true;
}

export async function updateStatusService(id, data){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const inscription = await getInscriptionIdService(id);

    if (!inscription) throw new Error("Inscripción no encontrada");

    const Status = inscription.estado;
    inscription.estado = data.estado;
    inscription.reviewedAt = new Date();

    if (data.estado === "rechazado") inscription.motivo_rechazo = data.motivo_rechazo;

    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    const elective = await electiveRepository.findOne({ where: { id: inscription.electiveId } });
    
    if (elective) {
        if ((Status === "pendiente" || Status === "aprobado") && data.estado === "rechazado") {
            elective.quotas += 1;
            await electiveRepository.save(elective);
        }
    }

    return await inscriptionRepository.save(inscription);
}

export async function getElectivesByPrerequisitesService() {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);

    const electives = await electiveRepository.find({
        where: [
            { prerrequisites: IsNull() }, 
            { prerrequisites: "" }         
        ]
    });

    return electives.length > 0 ? electives : null;
}