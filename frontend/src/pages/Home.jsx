import { useState} from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { user } = useAuth(); 
    const navigate = useNavigate();
    const [loading] = useState(false);

    const handleLogout = () => {
        navigate("/logout");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">
                ¡Login Exitoso!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                Llegaste a la ruta protegida.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                Usuario: <strong className="text-purple-600">{user?.email}</strong>
                </p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-300"
                        disabled={loading}
                    >
                        Cerrar Sesión
                    </button>
                </div>
                <p className="text-sm text-gray-500">
                (falta implementar el resto de esta página).
                </p>
            </div>
        </div>
    );
};

export default Home;