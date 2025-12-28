import { getInscription } from "@services/inscription.service";
import { getRequests } from "@services/request.service";
import { getElectives } from "@services/elective.service";
import { getActivePeriod } from "@services/periodo.service";
import { useAuth } from "@context/AuthContext";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Badge } from "@components/Badge";
import HomeCard from "@components/HomeCard";
import {
  CalendarRangeIcon,
  FilePenLine,
  GraduationCap,
  MessageSquareText,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUsers } from "@services/user.service";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAlumno = user.role === "alumno";
  const isDocente = user.role === "docente";
  const isAdmin = user.role === "administrador";
  const isJefeCarrera = user.role === "jefe_carrera";

  const [loading, setLoading] = useState(false);
  const [electiveCounter, setElectiveCounter] = useState(0);
  const [inscriptionCounter, setInscriptionCounter] = useState(0);
  const [requestCounter, setRequestsCounter] = useState(0);
  const [userCounter, setUserCounter] = useState(0);

  // AHORA ES ARRAY
  const [activePeriods, setActivePeriods] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const inscriptionResult = isAlumno || isDocente ? await getInscription() : null;
      const electiveResult = await getElectives();
      const requestsResult = isAlumno || isJefeCarrera ? await getRequests() : null;
      const activePeriodsResult = await getActivePeriod();
      const usersResult = isAdmin ? await getUsers() : null;

      if (inscriptionResult != null && inscriptionResult.success) {
        setInscriptionCounter(inscriptionResult.data?.length || 0);
      }
      
      if (requestsResult != null && requestsResult.success) {
        setRequestsCounter(requestsResult.data?.length || 0);
      }

      if (electiveResult.success) {
        setElectiveCounter(electiveResult.data?.length || 0);
      }

      if (usersResult != null && usersResult.success) {
        setUserCounter(usersResult.data?.length || 0);
      }

      // Siempre array
      setActivePeriods(activePeriodsResult || []);
    } catch (error) {
      console.error("Error en Home => fetchData():", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
    });
  };

  const getDescriptionText = () => {
    if (isAlumno) {
      return "Gestiona tus inscripciones y solicitudes desde aquí";
    } else if (isDocente) {
      return "Gestiona tus electivos y las solicitudes de estudiantes desde aquí";
    } else if (isJefeCarrera) {
      return "Gestiona los períodos, las solicitudes excepcionales y los electivos desde aquí";
    } else if (isAdmin) {
      return "Gestiona los períodos y los usuarios del sistema desde aquí";
    }
  };

  const getSummaryText = () => {
    if (isAlumno) {
      return "Revisa el estado de tus solicitudes, electivos e inscripciones";
    } else if (isDocente) {
      return "Revisa los electivos y solicitudes de estudiantes";
    } else if (isJefeCarrera) {
      return "Revisa los períodos, las solicitudes excepcionales y los electivos";
    } else if (isAdmin) {
      return "Revisa los usuarios sistema";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col p-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">
          <div className="flex flex-row flex-1 justify-between items-center">
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl">Inicio</h1>
              <p className="text-gray-600">{getDescriptionText()}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-4">
              <Badge text="Cargando..." />
            </div>
          ) : (
            <>
              {/* Información del semestre */}
              <div className="flex flex-col gap-6 items-start border-2 border-gray-200 rounded-lg p-4 shadow-xs">
                <div>
                  <h2 className="font-semibold text-lg">Información del semestre</h2>
                  <p className="text-gray-500">
                    Encuentra información relevante en el periodo actual
                  </p>
                </div>

                <div className="flex flex-row gap-4 w-full flex-wrap">
                  {/* Card periodo */}
                  <div className="rounded-lg bg-blue-100/75 p-4 flex-1">
                    <p className="text-md font-medium text-gray-700">Periodo actual</p>
                    <p className="text-lg font-semibold text-blue-700">2025-2</p>
                  </div>

                  {/* Card fechas periodo*/}
                  <div className="rounded-lg bg-purple-100/50 p-4 flex-1">
                    {activePeriods.length > 0 ? (
                      activePeriods.map((periodo) => (
                        <div key={periodo.id} className="mb-2 last:mb-0">
                          <p className="text-md font-medium text-gray-700 truncate">
                            Fechas del período
                          </p>
                          <p className="text-lg font-semibold text-purple-700 leading-tight">
                            {formatDate(periodo.fechaInicio)} - {formatDate(periodo.fechaCierre)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <>
                        <p className="text-md font-medium text-gray-700">Estado</p>
                        <p className="text-lg font-semibold text-gray-500 italic">
                          Sin periodos activos
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div>
                <h2 className="text-lg font-medium">Resumen de actividades</h2>
                <p className="text-gray-600">{getSummaryText()}</p>
              </div>

              {/* Cards */}
              <div className="flex flex-row gap-6 flex-wrap">
                {isAlumno && (
                  <>
                    <HomeCard
                      icon={MessageSquareText}
                      counter={requestCounter}
                      text={
                        requestCounter === 1 ? "solicitud disponible" : "solicitudes disponibles"
                      }
                      color="sky"
                      btnText="Ir a solicitudes"
                      onClick={() => navigate("/requests")}
                    />
                    <HomeCard
                      icon={GraduationCap}
                      counter={electiveCounter}
                      text={electiveCounter === 1 ? "electivo disponible" : "electivos disponibles"}
                      color="blue"
                      btnText="Ir a electivos"
                      onClick={() => navigate("/electives")}
                    />
                    <HomeCard
                      icon={FilePenLine}
                      counter={inscriptionCounter}
                      text={
                        inscriptionCounter === 1
                          ? "inscripción disponible"
                          : "inscripciones disponibles"
                      }
                      color="purple"
                      btnText="Ir a inscripciones"
                      onClick={() => navigate("/inscription")}
                    />
                  </>
                )}

                {isDocente && (
                  <>
                    <HomeCard
                      icon={GraduationCap}
                      counter={electiveCounter}
                      text={electiveCounter === 1 ? "electivo disponible" : "electivos disponibles"}
                      color="purple"
                      btnText="Ir a electivos"
                      onClick={() => navigate("/electives")}
                    />
                    <HomeCard
                      icon={FilePenLine}
                      counter={inscriptionCounter}
                      text={
                        inscriptionCounter === 1
                          ? "inscripción solicitada"
                          : "inscripciones solicitadas"
                      }
                      color="blue"
                      btnText="Ir a inscripciones"
                      onClick={() => navigate("/inscription")}
                    />
                  </>
                )}

                {isJefeCarrera && (
                  <>
                    <HomeCard
                      icon={CalendarRangeIcon}
                      counter={activePeriods.length}
                      text={requestCounter === 1 ? "período activo" : "períodos activos"}
                      color="sky"
                      btnText="Ir a períodos"
                      onClick={() => navigate("/periodos")}
                    />
                    <HomeCard
                      icon={MessageSquareText}
                      counter={requestCounter}
                      text={
                        requestCounter === 1 ? "solicitud disponible" : "solicitudes disponibles"
                      }
                      color="blue"
                      btnText="Ir a solicitudes"
                      onClick={() => navigate("/requests")}
                    />
                    <HomeCard
                      icon={GraduationCap}
                      counter={electiveCounter}
                      text={electiveCounter === 1 ? "electivo disponible" : "electivos disponibles"}
                      color="purple"
                      btnText="Ir a electivos"
                      onClick={() => navigate("/electives")}
                    />
                  </>
                )}

                {isAdmin && (
                  <>
                    <HomeCard
                      icon={Users}
                      counter={userCounter}
                      text={userCounter === 1 ? "usuario registrado" : "usuarios registrados"}
                      color="sky"
                      btnText="Ir a usuarios"
                      onClick={() => navigate("/users")}
                      flexOne={false} // Como es solo un card, se usa sin flex-1 para que no se extienda completa
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
