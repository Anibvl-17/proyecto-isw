import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  deleteUserService,
  getUserByIdService,
  getUsersService,
  editUserService,
} from "../services/user.service.js";
import { editUserBodyValidation } from "../validations/user.validation.js";

export async function getUsers(req, res) {
  try {
    const users = await getUsersService();

    // En teoria, siempre existira al menos un usuario para realizar la consulta (admin)
    if (users < 1) {
      handleSuccess(res, 200, "No hay usuarios registrados");
    }

    handleSuccess(res, 200, "Usuarios obtenidos exitosamente", users);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener usuarios", error.message);
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    handleSuccess(res, 200, "Usuario encontrado", user);
  } catch (error) {
    if (error.message === "Usuario no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al obtener el usuario", error.message);
    }
  }
}

export async function editUser(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    if (!body) return handleErrorClient(res, 400, "Debe especificar al menos 1 parámetro");

    const { error } = editUserBodyValidation.validate(body);

    if (error) return handleErrorClient(res, 400, "Parámetros inválidos", error.message);

    const updatedUser = await editUserService(id, body);

    handleSuccess(res, 200, "Usuario actualizadeo exitosamente", updatedUser);
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail?.includes("email")) {
        return handleErrorClient(res, 409, "El email ya está registrado");
      }
      if (error.detail?.includes("rut")) {
        return handleErrorClient(res, 409, "El RUT ya está registrado");
      }
      return handleErrorClient(res, 409, "Ya existe un usuario con estos datos");
    } else {
      return handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteUserService(id);

    if (!result) return handleErrorClient(res, 404, "Usuario no encontrado");

    handleSuccess(res, 200, "Usuario eliminado exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, "Error al eliminar usuario", error.message);
  }
}
