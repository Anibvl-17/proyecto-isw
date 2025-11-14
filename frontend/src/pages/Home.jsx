import { useAuth } from "@context/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col items-center justify-center p-4">
        {/* Contenido de la página */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">¡Login Exitoso!</h1>
          <p className="text-lg text-gray-600 mb-6">Llegaste a la ruta protegida.</p>
          <p className="text-lg text-gray-600 mb-6">
            Usuario: <strong className="text-purple-600">{user?.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            (falta implementar el resto de esta página).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
