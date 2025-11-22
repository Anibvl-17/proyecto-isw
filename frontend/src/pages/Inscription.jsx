import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

const Inscription = () => {

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />

      <div className="ml-72 flex flex-col items-center justify-center p-4">
        {/* Contenido de la página */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
            Gestión de Inscripciones
          </h1>

          {/* Tabla de inscripciones */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">
                    Electivo
                  </th>
                  <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">
                    Opciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Fila de ejemplo (luego la vas a reemplazar con datos reales) */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-gray-600">1</td>
                  <td className="px-4 py-2 border-b text-gray-600">Programación</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        Inscribir
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            (Más adelante aquí se cargarán las inscripciones reales)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;