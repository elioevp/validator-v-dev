import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// import directoryService from '../services/directoryService'; // Comentado: Reemplazado por mockDirectoryService para la compilación
// import { jwtDecode } from 'jwt-decode'; // Comentado: Reemplazado por mockJwtDecode para la compilación

// --- Mocks para permitir la compilación en un entorno sin dependencias ---
// NOTA: Para la funcionalidad real, deberás instalar 'jwt-decode' y asegurar
// que tu archivo 'directoryService.js' esté en la ruta correcta.

// Mock para jwtDecode: Simula la decodificación de un token JWT.
// En un entorno de producción, usarías la librería 'jwt-decode' real.
const mockJwtDecode = (token) => {
  console.log('Mock: Decodificando token JWT (simulado)...');
  // Devuelve un objeto de usuario simulado.
  return { username: 'UsuarioSimulado' };
};

// Mock para directoryService: Simula las operaciones del servicio de directorios.
// En un entorno de producción, importarías tu 'directoryService' real.
const mockDirectoryService = {
  getDirectories: async () => {
    console.log('Mock: Obteniendo directorios (simulado)...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un retraso de red
    return { data: ['directorio-ejemplo-1', 'directorio-ejemplo-2', 'directorio-ejemplo-3'] };
  },
  getFilesInDirectory: async (directoryName) => {
    console.log(`Mock: Obteniendo archivos en ${directoryName} (simulado)...`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un retraso de red
    if (directoryName === 'directorio-ejemplo-1') {
      return { data: [
        { name: 'imagen-1.jpg', url: 'https://placehold.co/600x400/FF0000/FFFFFF?text=Imagen+de+Ejemplo+1' },
        { name: 'documento.pdf', url: 'about:blank' } // URL en blanco para archivos no visualizables
      ] };
    } else if (directoryName === 'directorio-ejemplo-2') {
      return { data: [
        { name: 'imagen-2.png', url: 'https://placehold.co/600x400/00FF00/000000?text=Imagen+de+Ejemplo+2' }
      ] };
    }
    return { data: [] };
  },
  createDirectory: async ({ directoryName }) => {
    console.log(`Mock: Creando directorio ${directoryName} (simulado)...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    // Aquí, en una app real, podrías actualizar el estado o volver a obtener los directorios.
  },
  uploadFile: async (directoryName, formData) => {
    console.log(`Mock: Subiendo archivo a ${directoryName} (simulado):`, formData.get('file')?.name);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  deleteFile: async (directoryName, fileName) => {
    console.log(`Mock: Eliminando archivo ${fileName} de ${directoryName} (simulado)...`);
    await new Promise(resolve => setTimeout(resolve, 200));
  },
};
// --- Fin de los Mocks ---


const Dashboard = () => {
  const [directories, setDirectories] = useState([]);
  const [newDirectory, setNewDirectory] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filesInSelectedDirectory, setFilesInSelectedDirectory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Handler para cerrar sesión, limpia el token y navega a la página de inicio
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  // Obtiene la lista de directorios del servicio (mock o real)
  const fetchDirectories = useCallback(async () => {
    try {
      // Usando el mockDirectoryService para la compilación
      const { data } = await mockDirectoryService.getDirectories();
      setDirectories(data);
    } catch (error) {
      console.error('Error al obtener directorios:', error);
      // Opcionalmente, maneja el error visualmente, por ejemplo, mostrando un mensaje
    }
  }, []);

  // Hook de efecto para ejecutar al montar el componente y al cambiar las dependencias
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Usando mockJwtDecode para la compilación
        const decodedToken = mockJwtDecode(token);
        setUsername(decodedToken.username);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        handleLogout(); // Cierra sesión si el token es inválido o ha expirado
      }
    } else {
      // Si no hay token, redirige a la página de inicio de sesión
      navigate('/');
    }
    fetchDirectories(); // Obtiene los directorios al cargar
  }, [fetchDirectories, handleLogout, navigate]); // Añadir 'navigate' a las dependencias

  // Maneja la creación de un nuevo directorio
  const handleCreateDirectory = async () => {
    if (!newDirectory.trim()) {
      // Usa un modal o caja de mensajes personalizada en lugar de alert()
      console.log('Por favor, introduce un nombre para el directorio.'); // Para depuración
      return;
    }
    try {
      // Usando el mockDirectoryService para la compilación
      await mockDirectoryService.createDirectory({ directoryName: newDirectory });
      setNewDirectory(''); // Limpia el campo de entrada
      fetchDirectories(); // Refresca la lista de directorios
    } catch (error) {
      console.error('Error al crear directorio:', error);
      // Opcionalmente, muestra el error al usuario
    }
  };

  // Maneja el clic en un directorio para ver sus archivos
  const handleDirectoryClick = async (directoryName) => {
    setSelectedDirectory(directoryName);
    setSelectedFile(null); // Limpia el archivo seleccionado al cambiar de directorio
    try {
      // Usando el mockDirectoryService para la compilación
      const { data } = await mockDirectoryService.getFilesInDirectory(directoryName);
      setFilesInSelectedDirectory(data);
    } catch (error) {
      console.error('Error al obtener archivos en el directorio:', error);
      setFilesInSelectedDirectory([]); // Limpia los archivos en caso de error
    }
  };

  // Maneja el clic en un archivo para mostrar su contenido (ej. imagen)
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  // Maneja la subida de un archivo al directorio seleccionado
  const handleFileUpload = async (directoryName) => {
    if (!selectedFile) {
      // Usa un modal o caja de mensajes personalizada en lugar de alert()
      console.log('Por favor, selecciona un archivo para subir.'); // Para depuración
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      // Usando el mockDirectoryService para la compilación
      await mockDirectoryService.uploadFile(directoryName, formData);
      // Usa un modal o caja de mensajes personalizada en lugar de alert()
      console.log('¡Archivo subido exitosamente!'); // Para depuración
      // Refresca los archivos en el directorio actual después de la subida
      if (selectedDirectory) {
        handleDirectoryClick(selectedDirectory);
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      // Usa un modal o caja de mensajes personalizada en lugar de alert()
      console.log('¡Fallo al subir archivo!'); // Para depuración
    }
  };

  // Maneja la eliminación de un archivo del directorio seleccionado
  const handleDeleteFile = async (directoryName, fileName, event) => {
    event.stopPropagation(); // Evita que se dispare handleFileClick
    // Usa un modal personalizado para la confirmación en lugar de window.confirm()
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${fileName}?`)) { // Usando window.confirm temporalmente
      try {
        // Usando el mockDirectoryService para la compilación
        await mockDirectoryService.deleteFile(directoryName, fileName);
        // Usa un modal o caja de mensajes personalizada en lugar de alert()
        console.log('¡Archivo eliminado exitosamente!'); // Para depuración
        // Refresca los archivos en el directorio actual después de la eliminación
        if (selectedDirectory) {
          handleDirectoryClick(selectedDirectory);
        }
        setSelectedFile(null); // Limpia el archivo seleccionado si fue el eliminado
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        // Usa un modal o caja de mensajes personalizada en lugar de alert()
        console.log('¡Fallo al eliminar archivo!'); // Para depuración
      }
    }
  };

  return (
    // Contenedor principal para todo el dashboard
    <div className="flex min-h-screen flex-col bg-blue-100 font-sans">
      {/* Sección del encabezado */}
      <header className="text-center p-4 border-b border-gray-300 bg-white shadow-sm">
        <h1 className="text-4xl font-bold text-gray-800">validator-v</h1>
      </header>

      {/* Barra de información del Dashboard */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
        {username && <p className="text-red-600 text-xl font-bold">¡Bienvenido, {username}!</p>}
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Área de contenido principal: Tres paneles */}
      {/* Usando Flexbox con estilos en línea para minWidth y flex-grow/shrink */}
      <div className="flex flex-1 p-4 gap-4">
        {/* Panel Izquierdo: Directorios */}
        <div 
          className="flex-grow flex-shrink-0 border border-gray-300 rounded-lg p-4 bg-white shadow-md flex flex-col overflow-y-auto"
          style={{ minWidth: '200px' }} // Estilo en línea para minWidth
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Directorios</h3>
          <div className="mb-4">
            <input
              type="text"
              value={newDirectory}
              onChange={(e) => setNewDirectory(e.target.value)}
              placeholder="Nuevo nombre de directorio"
              className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateDirectory}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Crear
            </button>
          </div>
          <hr className="my-4 border-gray-200" />
          <div className="flex-1 overflow-y-auto">
            {directories.length > 0 ? (
              directories.map((dir) => (
                <div
                  key={dir}
                  onClick={() => handleDirectoryClick(dir)}
                  className={`cursor-pointer p-2 rounded-md mb-1 transition-colors duration-150
                    ${selectedDirectory === dir ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'}`}
                >
                  {dir}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No se encontraron directorios.</p>
            )}
          </div>
        </div>

        {/* Panel Central: Archivos en el directorio seleccionado */}
        <div 
          className="flex-grow border border-gray-300 rounded-lg p-4 bg-white shadow-md flex flex-col overflow-y-auto"
          style={{ minWidth: '300px' }} // Estilo en línea para minWidth
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Archivos {selectedDirectory && `en ${selectedDirectory}`}</h3>
          {selectedDirectory && (
            <div className="mb-4 p-2 border border-dashed border-gray-400 rounded-md bg-gray-50">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={() => handleFileUpload(selectedDirectory)}
                className="mt-2 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Subir a {selectedDirectory}
              </button>
            </div>
          )}
          <hr className="my-4 border-gray-200" />
          <div className="flex-1 overflow-y-auto">
            {filesInSelectedDirectory.length > 0 ? (
              filesInSelectedDirectory.map((file) => (
                <div
                  key={file.name}
                  onClick={() => handleFileClick(file)}
                  className={`flex justify-between items-center p-2 rounded-md mb-1 transition-colors duration-150 cursor-pointer
                    ${selectedFile === file ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'}`}
                >
                  <span
                    className="flex-grow truncate"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => handleDeleteFile(selectedDirectory, file.name, e)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                {selectedDirectory ? 'No hay archivos en este directorio.' : 'Selecciona un directorio para ver los archivos.'}
              </p>
            )}
          </div>
        </div>

        {/* Panel Derecho: Visor de Fotos / Contenido */}
        {/* Se asegura que la imagen escale y que el tamaño del panel sea consistente */}
        <div 
          className="flex-grow flex-shrink-0 border border-gray-300 rounded-lg p-4 bg-white shadow-md flex justify-center items-center overflow-hidden"
          style={{ minWidth: '400px' }} // Estilo en línea para minWidth
        >
          {selectedFile ? (
            // Verifica si el archivo es una imagen antes de intentar mostrarlo
            selectedFile.name.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain rounded-md shadow-lg"
              />
            ) : (
              <p className="text-gray-600 text-center">
                Vista previa no disponible para este tipo de archivo.<br/>
                Archivo: {selectedFile.name}
              </p>
            )
          ) : (
            <p className="text-gray-600 text-center">Haz clic en un archivo para ver su contenido.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación que envuelve Dashboard en un Router
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el Dashboard */}
        <Route path="/" element={<Dashboard />} />
        {/* Puedes añadir otras rutas aquí si las tienes, por ejemplo, para un login */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </Router>
  );
}
