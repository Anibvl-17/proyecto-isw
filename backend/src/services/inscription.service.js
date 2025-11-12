import { AppDataSource } from "../config/configDb.js";
import { Inscription } from "../entities/inscription.entity.js";

export async function createInscriptionService(data){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);

    const newInscription = inscriptionRepository.create(data);
    return await inscriptionRepository.save(newInscription);
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

    await inscriptionRepository.delete(inscription);
    return true;
}

export async function updateStatusService(id, data){
    const inscriptionRepository = AppDataSource.getRepository(Inscription);
    const inscription = await getInscriptionIdService(id);

    if (!inscription) throw new Error("Inscripción no encontrada");

    //inscriptionRepository.merge(inscription, data);
    inscription.estado = data.estado;

    if (data.estado === "rechazado") inscription.motivo_rechazo = data.motivo_rechazo;

    return await inscriptionRepository.save(inscription);
}