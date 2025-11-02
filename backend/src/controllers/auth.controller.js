import { loginService, registerService } from "../services/auth.service.js"
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { body } = req;

    // Validacion pendiente
    /*
    const { error } = userAuthBodyValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Parámetros inválidos", error.message);
    }
    */
    
    const data = await loginService(body);
    handleSuccess(res, 200, "Inicio de sesión exitoso", data);
  } catch (error) {
    return handleErrorClient(res, 401, error.message);
  }
}

export async function register(req, res) {
  try {
    const { body } = req;

    // Validacion pendiente
    /*
    const { error } = userAuthBodyValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Parámetros invalidos", error.message);
    }
    */

    const newUser = await registerService(body);
    delete newUser.password;
    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
    // Código de error de PostgreSQL, para violación de condición única (unique constraint)
    if (error.code === "23505") {
      handleErrorClient(res, 409, "El email ya está registrado");
    } else {
      handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt", { httpOnly: true });
    handleSuccess(res, 200, "Sesión cerrada exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}