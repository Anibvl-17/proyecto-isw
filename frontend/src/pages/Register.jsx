import { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import useRegister from '@hooks/useRegister';
import { register }  from '@services/auth.service';

const Register = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { errorEmail, errorPassword, errorData, handleInputChange } = useRegister();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        handleInputChange();

        try {
            const result = await register(email, password);

            if (result.success) {
                navigate('/auth'); 
            } else {
                errorData(result.message || "Credenciales incorrectas");
            }
        } catch (err) {
            console.error('Register error:', err);
            errorData("Error inesperado al registrarse");
        }
        setLoading(false);
    };

    const handleLogin = () => {
      navigate("/auth");
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md transform transition-all hover:scale-105">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-blue-600 mb-8">
                        Registrarse
                    </h1>

                    {errorEmail && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                            {errorEmail}
                        </div>
                    )}
                    {errorPassword && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                            {errorPassword}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                handleInputChange();
                            }}
                            placeholder="usuario@ejemplo.com"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                handleInputChange();
                            }}
                            placeholder="**********"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50"
                    >
                        {loading ? "Cargando..." : "Registrarse"}
                    </button>

                    <button
                      type="button"
                      className="w-full bg-transparent border-2 border-transparent text-purple-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-110 hover:underline focus:scale-100"
                      onClick={handleLogin}
                    >
                      ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;