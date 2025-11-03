import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = cookies.get("jwt-auth");
    const storedUser = sessionStorage.getItem("usuario");

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
        } else {
          cookies.remove("jwt-auth");
          sessionStorage.removeItem("usuario");
        }
      } catch (error) {
        console.error("Error al decodificar datos:", error);
        cookies.remove("jwt-auth");
        sessionStorage.removeItem("usuario");
      }
    }
    setLoading(false);
  }, []);

    const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // para enviar cookies
      });

      const data = await response.json();

      if (response.ok && data?.token) {
        cookies.set("jwt-auth", data.token, { expires: 1 });
        sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
        setUser(data.usuario);

        return { success: true };
      } else {
        return { success: false, message: data.message || "Credenciales inválidas" };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: "Error al conectar con el servidor" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);