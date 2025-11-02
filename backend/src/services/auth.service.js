import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";

export async function loginService(data) {
  const { email, password } = data;
  
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ email });

  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  console.log(user);
  

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // No mantener la contraseña por seguridad
  delete user.password;

  return { user, token };
}

export async function registerService(data) {
  const { email, password } = data;

  const userRepository = AppDataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    email: email,
    password: hashedPassword,
    role: "alumno",
  });

  return await userRepository.save(newUser);
}
