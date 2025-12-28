"use strict";

import * as periodoService from "../services/periodo.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { periodoBodyValidation } from "../validations/periodo.validation.js";

// Crear período
export async function createPeriodo(req, res) {
  try {
    const { body } = req;
    const { error, value } = periodoBodyValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Parámetros inválidos", error.message);
    }

    const overlap = await periodoService.checkPeriodOverlapService(
        value.fechaInicio,
        value.fechaCierre,
        value.visibilidad
    );

    if (overlap) {
        return handleErrorClient(
            res, 
            400, 
            "Ya existe un periodo activo en esas fechas"
        );
    }

    const nuevoPeriodo = await periodoService.createPeriodoService(value);
    handleSuccess(res, 201, "Período creado exitosamente", nuevoPeriodo);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear el período", error.message);
  }
}

// Listar periodos
export async function getPeriodos(req, res) {
  try {
    const periodos = await periodoService.getPeriodosService();
    handleSuccess(res, 200, "Períodos obtenidos exitosamente", periodos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener los períodos", error.message);
  }
}

// Obtener periodos por ID
export async function getPeriodoById(req, res) {
  try {
    const { id } = req.params;
    const periodo = await periodoService.getPeriodoByIdService(id);
    handleSuccess(res, 200, "Período encontrado", periodo);
  } catch (error) {
    if (error.message === "Período no encontrado") {
      return handleErrorClient(res, 404, error.message);
    }
    handleErrorServer(res, 500, "Error al obtener el período", error.message);
  }
}

// Actualizar período
export async function updatePeriodo(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error, value } = periodoBodyValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros inválidos", error.message);
    }

    const overlap = await periodoService.checkPeriodOverlapService(
        value.fechaInicio,
        value.fechaCierre,
        value.visibilidad,
        id 
    );

    if (overlap) {
        return handleErrorClient(
            res, 
            400, 
            "Ya existe un periodo activo en esas fechas"
        );
    }

    const periodoActualizado = await periodoService.updatePeriodoService(id, value);
    handleSuccess(res, 200, "Período actualizado exitosamente", periodoActualizado);
  } catch (error) {
    if (error.message === "Período no encontrado") {
      return handleErrorClient(res, 404, error.message);
    }
    handleErrorServer(res, 500, "Error al actualizar el período", error.message);
  }
}

// Eliminar período
export async function deletePeriodo(req, res) {
  try {
    const { id } = req.params;
    const result = await periodoService.deletePeriodoService(id);
    handleSuccess(res, 200, result.message);
  } catch (error) {
    if (error.message === "Período no encontrado") {
      return handleErrorClient(res, 404, error.message);
    }
    handleErrorServer(res, 500, "Error al eliminar el período", error.message);
  }
}

// Obtener período activo según rol
export async function getActivePeriod(req, res) {
  try {
    const userRole = req.user.role;
    const activePeriod = await periodoService.getActivePeriodForRoleService(userRole);

    if (!activePeriod) {
      return handleSuccess(res, 200, "No hay período activo en este momento.", null);
    }

    handleSuccess(res, 200, "Período activo encontrado", activePeriod);
  } catch (error) {
    console.error("Error al obtener período activo:", error);
    handleErrorServer(res, 500, "Error al obtener el período activo", error.message);
  }
}