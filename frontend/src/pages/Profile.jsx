import { useAuth } from "@context/AuthContext";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { BookTextIcon, GraduationCap, IdCard, Mail, User, UserCog } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const isAlumno = user.role === "alumno";
  const isDocente = user.role === "docente";
  const isJefeCarrera = user.role === "jefe_carrera";
  const isAdmin = user.role === "administrador";

  /*const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
    });
  };*/

  const roleText = {
    alumno: "Alumno",
    docente: "Docente",
    administrador: "Administrador",
    jefe_carrera: "Jefe de Carrera"
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col p-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">
          <div className="flex flex-row flex-1 justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-2xl">Mi perfil</h1>
              <p className="text-gray-600">Revisa la información de tu perfil</p>
            </div>
          </div>

          <div className="flex flex-row gap-4 flex-wrap">
            {/* Información personal */}
            <div className="flex flex-col p-4 rounded-md border border-gray-300 shadow-sm flex-1 transition-all hover:shadow-md">
              <h3 className="font-medium text-xl mb-2">Información Personal</h3>
              {/* Nombre */}
              <div className="flex flex-row items-center gap-2 border-b border-b-gray-300 py-3">
                <span className="bg-purple-100 rounded-sm p-2">
                  <User className="text-purple-600 h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Nombre</span>
                  <span className="font-medium">{user.username}</span>
                </div>
              </div>

              {/* RUT */}
              <div className="flex flex-row items-center gap-2 border-b border-b-gray-300 py-3">
                <span className="bg-purple-100 rounded-sm p-2">
                  <IdCard className="text-purple-600 h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">RUT</span>
                  <span className="font-medium">{user.rut}</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-row items-center gap-2 border-b border-b-gray-300 py-3">
                <span className="bg-purple-100 rounded-sm p-2">
                  <Mail className="text-purple-600 h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
              </div>

              {/* Rol */}
              <div className="flex flex-row items-center gap-2 py-3">
                <span className="bg-purple-100 rounded-sm p-2">
                  <UserCog className="text-purple-600 h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Rol</span>
                  <span className="font-medium">{roleText[user.role]}</span>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="flex flex-col p-4 rounded-md border border-gray-300 shadow-sm flex-1 transition-all hover:shadow-md">
              <h3 className="font-medium text-xl mb-2">Información Académica</h3>
              {isAdmin && (
                <p className="text-gray-600 italic">
                  No disponible para administrador.
                </p>
              )}

              {/* Carrera solo alumno y jefe carrera */}
              {(isAlumno || isJefeCarrera) && (
                <div className="flex flex-row items-center gap-2 py-3">
                  <span className="bg-blue-100 rounded-sm p-2">
                    <BookTextIcon className="text-blue-600 h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Carrera</span>
                    <span className="font-medium">[carrera]</span>
                  </div>
                </div>
              )}

              {/* Electivos inscritos solo alumno*/}
              {isAlumno && (
                <div className="flex flex-row items-center gap-2 py-3 border-t border-t-gray-300 ">
                  <span className="bg-blue-100 rounded-sm p-2">
                    <GraduationCap className="text-blue-600 h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Electivos inscritos</span>
                    <span className="font-medium">X electivos</span>
                  </div>
                </div>
              )}

              {/* Electivos creados solo docente */}
              {isDocente && (
                <div className="flex flex-row items-center gap-2 py-3">
                  <span className="bg-blue-100 rounded-sm p-2">
                    <GraduationCap className="text-blue-600 h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Electivos creados</span>
                    <span className="font-medium">X electivos</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
