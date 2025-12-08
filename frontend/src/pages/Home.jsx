import { getInscription } from "@services/inscription.service";
import { getRequests } from "@services/request.service";
import { getElectives } from "@services/elective.service";
import { useAuth } from "@context/AuthContext";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";
import { Badge } from "@components/Badge";
import HomeCard from "@components/HomeCard";
import { FilePenLine, GraduationCap, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [electiveCounter, setElectiveCounter] = useState(0);
  const [inscriptionCounter, setInscriptionCounter] = useState(0);
  const [requestCounter, setRequestsCounter] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const inscriptionResult = await getInscription();
      const electiveResult = await getElectives();
      const requestsResult = await getRequests();

      if (inscriptionResult.success) setInscriptionCounter(inscriptionResult.data?.length || 0);
      if (requestsResult.success) setRequestsCounter(requestsResult.data?.length || 0);
      if (electiveResult.success) setElectiveCounter(electiveResult.data?.length || 0);
    } catch (error) {
      console.error("Error en Home => fetchData():", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col p-4">
        {/* Contenido de la página */}
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-6">
          {/* Título y descripción de Inicio */}
          <div className="flex flex-row flex-1 justify-between items-center">
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl">Inicio</h1>
              <p className="text-gray-600">
                Gestiona tus electivos, inscripciones y solicitudes desde aquí
              </p>
            </div>
          </div>

          {loading ? (
            <Badge text="Cargando..." />
          ) : (
            <>
              {/* Información del semestre */}
              <div className="flex flex-col gap-6 items-start border-2 border-gray-200 rounded-lg p-4 shadow-xs">
                <div>
                  <h2 className="font-semibold text-lg">Información del semestre</h2>
                  <p className="text-gray-500">
                    Encuentra información relevante en el período actual
                  </p>
                </div>
                <div className="flex flex-row gap-4 w-full">
                  <div className="rounded-lg bg-sky-100 p-4 flex-1">
                    <p className="text-md font-medium text-gray-700">Tu carrera</p>
                    <p className="text-lg font-semibold text-blue-700">
                      Ingeniería de Ejecución en Computación e Informática
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100/75 p-4 flex-1">
                    <p className="text-md font-medium text-gray-700">Período actual</p>
                    <p className="text-lg font-semibold text-blue-700">2025-2</p>
                  </div>
                  <div className="rounded-lg bg-purple-100/50 p-4 flex-1">
                    <p className="text-md font-medium text-gray-700">Fecha límite de inscripción</p>
                    <p className="text-lg font-semibold text-purple-700">15 de marzo</p>
                  </div>
                </div>
              </div>

              {/* Titulo y descripción de actividades */}
              <div>
                <h2 className="text-lg font-medium">Resumen de actividades</h2>
                <p className="text-gray-600">
                  Revisa el estado de tus solicitudes, electivos e inscripciones del periodo actual
                </p>
              </div>

              {/* Cards con actividades */}
              <div className="flex flex-row gap-6">
                {/* Actividades de alumno*/}
                {user.role === "alumno" && (
                  <>
                    <HomeCard
                      icon={MessageSquareText}
                      counter={requestCounter}
                      text={"solicitudes pendientes"}
                      color="sky"
                      btnText="Ir a solicitudes"
                      onClick={() => {
                        navigate("/requests");
                      }}
                    />
                    <HomeCard
                      icon={GraduationCap}
                      counter={electiveCounter}
                      text="electivos disponibles"
                      color="blue"
                      btnText="Ir a electivos"
                      onClick={() => {
                        navigate("/electives");
                      }}
                    />
                    <HomeCard
                      icon={FilePenLine}
                      counter={inscriptionCounter}
                      text="inscripciones activas"
                      color="purple"
                      btnText="Ir a inscripciones"
                      onClick={() => {
                        navigate("/inscription");
                      }}
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
