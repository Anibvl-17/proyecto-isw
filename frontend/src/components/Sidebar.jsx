import { useAuth } from "@context/AuthContext";

// Buscar iconos en -> https://lucide.dev/icons/
import { GraduationCap, House, MessageSquareText, User, Users, FilePenLine, Bolt, IdCardLanyard, UserCog } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Inicio",
    icon: House,
    route: "/home",
    roles: ["alumno", "administrador", "docente", "jefe_carrera"],
  },
  {
    title: "Solicitudes",
    icon: MessageSquareText,
    route: "/requests",
    roles: ["alumno", "jefe_carrera"],
  },
  {
    title: "Usuarios",
    icon: Users,
    route: "/users",
    roles: ["administrador"],
  },
  {
    title: "Mis Inscripciones",
    icon: FilePenLine,
    route: "/inscription",
    roles: ["alumno", "jefe_carrera"],
  },
];

export function Sidebar() {
  // useLocation().pathname permite obtener la ruta actual
  const location = useLocation().pathname;

  const { user } = useAuth();
  const roleText = {
    administrador: "Administrador",
    jefe_carrera: "Jefe de Carrera",
    docente: "Docente",
    alumno: "Alumno",
  };

  let Icon;
  if (user.role === "administrador") {
    Icon = Bolt;
  } else if (user.role === "alumno") {
    Icon = GraduationCap;
  } else if (user.role === "docente") {
    Icon = IdCardLanyard;
  } else if (user.role === "jefe_carrera") {
    Icon = UserCog;
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-blue-600">
        <div className="flex h-full flex-col">
          {/* Logo superior */}
          <div className="flex items-center gap-3 border-b border-blue-700 px-6 py-5">
            {/* Icono */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            {/* Texto debajo del icono */}
            <div>
              <h1 className="text-lg font-bold text-white">Portal</h1>
              <p className="text-xs text-blue-200">{roleText[user.role]}</p>
            </div>
          </div>

          {/* Menu de navegación */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {/* Crea los items según menuItems */}
            {menuItems.map((item) => {
              // Verifica si la ruta incluye al rol del usuario
              if (!item.roles.includes(user.role)) return;

              const Icon = item.icon;
              const isActive = location === item.route;

              return (
                <NavLink
                  key={item.route}
                  to={item.route}
                  className={
                    isActive
                      ? "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-blue-700 text-white"
                      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-700/50 hover:text-white"
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              );
            })}
          </nav>

          {/* Item de perfil */}
          <div className="space-y-1 px-3 py-4">
          <NavLink
            key="/profile"
            to="/profile"
            className={
              location === "/profile"
                ? "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-blue-700 text-white"
                : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-700/50 hover:text-white"
            }
          >
            <User className="h-5 w-5" />
            Mi perfil
          </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
