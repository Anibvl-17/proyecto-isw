import { AppDataSource } from "../config/configDb.js";
import { Inscription } from "../entities/inscription.entity.js";
import { ElectiveEntity } from "../entities/elective.entity.js";
import { IsNull, Not } from "typeorm";

export async function createInscriptionService(data){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);

    const newInscription = inscriptionRepository.create(data);
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

    await inscriptionRepository.remove(inscription);
    return true;
}

export async function updateStatusService(id, data){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const inscription = await getInscriptionIdService(id);

    if (!inscription) throw new Error("Inscripción no encontrada");

    inscription.estado = data.estado;
    inscription.reviewedAt = new Date();

    if (data.estado === "rechazado") inscription.motivo_rechazo = data.motivo_rechazo;

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