import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import directoryService from '../services/directoryService';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [directories, setDirectories] = useState([]);
  const [newDirectory, setNewDirectory] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filesInSelectedDirectory, setFilesInSelectedDirectory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Handler for logging out, clears token and navigates to home
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  // Fetches the list of directories from the service
  const fetchDirectories = useCallback(async () => {
    try {
      const { data } = await directoryService.getDirectories();
      setDirectories(data);
    } catch (error) {
      console.error('Error fetching directories:', error);
      // Optionally handle error visually, e.g., show a toast message
    }
  }, []);

  // Effect hook to run on component mount and dependencies change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get username
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout(); // Log out if token is invalid or expired
      }
    } else {
      handleLogout(); // If no token, log out
    }
    fetchDirectories(); // Fetch directories on load
  }, [fetchDirectories, handleLogout]);

  // Handles creating a new directory
  const handleCreateDirectory = async () => {
    if (!newDirectory.trim()) {
      // Use a custom modal or message box instead of alert()
      console.log('Please enter a directory name.'); // For debugging
      return;
    }
    try {
      await directoryService.createDirectory({ directoryName: newDirectory });
      setNewDirectory(''); // Clear input field
      fetchDirectories(); // Refresh directory list
    } catch (error) {
      console.error('Error creating directory:', error);
      // Optionally show error to user
    }
  };

  // Handles clicking on a directory to view its files
  const handleDirectoryClick = async (directoryName) => {
    setSelectedDirectory(directoryName);
    setSelectedFile(null); // Clear selected file when changing directory
    try {
      const { data } = await directoryService.getFilesInDirectory(directoryName);
      setFilesInSelectedDirectory(data);
    } catch (error) {
      console.error('Error fetching files in directory:', error);
      setFilesInSelectedDirectory([]); // Clear files on error
    }
  };

  // Handles clicking on a file to display its content (e.g., image)
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  // Handles uploading a file to the selected directory
  const handleFileUpload = async (directoryName) => {
    if (!selectedFile) {
      // Use a custom modal or message box instead of alert()
      console.log('Please select a file to upload.'); // For debugging
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await directoryService.uploadFile(directoryName, formData);
      // Use a custom modal or message box instead of alert()
      console.log('File uploaded successfully!'); // For debugging
      // Refresh files in the current directory after upload
      if (selectedDirectory) {
        handleDirectoryClick(selectedDirectory);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Use a custom modal or message box instead of alert()
      console.log('File upload failed!'); // For debugging
    }
  };

  // Handles deleting a file from the selected directory
  const handleDeleteFile = async (directoryName, fileName, event) => {
    event.stopPropagation(); // Prevent triggering handleFileClick
    // Use a custom modal for confirmation instead of window.confirm()
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) { // Temporarily using window.confirm
      try {
        await directoryService.deleteFile(directoryName, fileName);
        // Use a custom modal or message box instead of alert()
        console.log('File deleted successfully!'); // For debugging
        // Refresh files in the current directory after deletion
        if (selectedDirectory) {
          handleDirectoryClick(selectedDirectory);
        }
        setSelectedFile(null); // Clear selected file if it was the one deleted
      } catch (error) {
        console.error('Error deleting file:', error);
        // Use a custom modal or message box instead of alert()
        console.log('File deletion failed!'); // For debugging
      }
    }
  };

  return (
    // Main container for the entire dashboard
    <div className="flex min-h-screen flex-col bg-blue-100 font-sans">
      {/* Header Section */}
      <header className="text-center p-4 border-b border-gray-300 bg-white shadow-sm">
        <h1 className="text-4xl font-bold text-gray-800">validator-v</h1>
      </header>

      {/* Dashboard Info Bar */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
        {username && <p className="text-red-600 text-xl font-bold">Welcome, {username}!</p>}
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area: Three Panels */}
      {/* This is the key change: using grid-cols-3 and specific widths/flex-grow */}
      <div className="flex flex-1 p-4 gap-4"> {/* flex-1 makes it take remaining vertical space */}
        {/* Left Panel: Directories */}
        <div className="w-1/5 min-w-[200px] border border-gray-300 rounded-lg p-4 bg-white shadow-md flex flex-col overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Directories</h3>
          <div className="mb-4">
            <input
              type="text"
              value={newDirectory}
              onChange={(e) => setNewDirectory(e.target.value)}
              placeholder="New directory name"
              className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateDirectory}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Create
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
              <p className="text-gray-500">No directories found.</p>
            )}
          </div>
        </div>

        {/* Middle Panel: Files in Selected Directory */}
        <div className="flex-grow border border-gray-300 rounded-lg p-4 bg-white shadow-md flex flex-col overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Files {selectedDirectory && `in ${selectedDirectory}`}</h3>
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
                Upload to {selectedDirectory}
              </button>
            </div>
          )}
          <hr className="my-4 border-gray-200" />
          <div className="flex-1 overflow-y-auto">
            {filesInSelectedDirectory.length > 0 ? (
              filesInSelectedDirectory.map((file) => (
                <div
                  key={file.name}
                  className={`flex justify-between items-center p-2 rounded-md mb-1 transition-colors duration-150
                    ${selectedFile === file ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'}`}
                >
                  <span
                    onClick={() => handleFileClick(file)}
                    className="cursor-pointer flex-grow truncate"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => handleDeleteFile(selectedDirectory, file.name, e)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                {selectedDirectory ? 'No files in this directory.' : 'Select a directory to view files.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Panel: Photo Viewer / Content Display */}
        {/* Key change: Added min-w-[400px] and flex-1 to ensure it always takes space */}
        <div className="flex-1 min-w-[400px] border border-gray-300 rounded-lg p-4 bg-white shadow-md flex justify-center items-center overflow-hidden">
          {selectedFile ? (
            // Check if the file is an image before trying to display it as such
            selectedFile.name.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain rounded-md shadow-lg"
              />
            ) : (
              <p className="text-gray-600 text-center">
                Preview not available for this file type.<br/>
                File: {selectedFile.name}
              </p>
            )
          ) : (
            <p className="text-gray-600 text-center">Click on a file to view its content.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;