import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import { Inscripcion } from "../entities/inscripcion.entity.js";
import { reviewRequestService } from "./request.service.js";

export async function crearInscripcionService(data){
    const inscripcionRepository = AppDataSource.getRepository(Inscripcion);

    const newInscripcion = inscripcionRepository.create(data);
    return await inscripcionRepository.save(newInscripcion);
}

export async function obtenerInscripcionService(){
    const inscripcionRepository = AppDataSource.getRepository(Inscripcion);

    return await inscripcionRepository.find();
}

export async function obtenerInscripcionIdService(id){
    const inscripcionRepository = AppDataSource.getRepository(Inscripcion);
    const inscripcion = await inscripcionRepository.findOneBy({ id: parseInt(id) });

    if (!inscripcion) throw new Error("Inscripcion no encontrada");
    
    return inscripcion;
}

export async function eliminarInscripcionService(id){
    const inscripcionRepository = AppDataSource.getRepository(Inscripcion);
    const inscripcion = await inscripcionRepository.findOneBy({ id });

    if(!inscripcion) return false;

    await inscripcionRepository.delete(inscripcion);
    return true;
}

export async function actualizarEstadoService(id, data){
    const inscripcionRepository = AppDataSource.getRepository(Inscripcion);
    const inscripcion = await obtenerInscripcionServiceId(id);

    inscripcionRepository.merge(inscripcion, data);

    return await inscripcionRepository.save(inscripcion);
}