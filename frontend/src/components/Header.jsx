import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { LogOut, UserCircle } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <header className="pl-72 sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Seccion del nombre de usuario */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Hola, <span className="text-purple-600">{user.username}</span>
          </h2>
        </div>

        {/* Sección del botón cerrar sesion */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex flex-row items-center border-2 px-3 py-1 gap-2 rounded-full font-medium border-gray-300 transition-all hover:bg-gray-50 hover:shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
