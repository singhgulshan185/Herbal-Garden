import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('Home component loaded');
console.log('API URL in Home:', API_URL);

function Home() {
  const [activeTab, setActiveTab] = useState('webcam');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Start webcam stream
  const startWebcam = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('Error accessing webcam. Please ensure you have granted camera permissions.');
      console.error('Error accessing webcam:', err);
    }
  };
  
  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
      setIsCapturing(false);
    }
  };
  
  // Capture image from webcam
  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    stopWebcam();
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError(null);
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Reset everything
  const handleReset = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  };
  
  // Switch between tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    handleReset();
    stopWebcam();
  };
  
  // Identify plant from image
  const identifyPlant = async (imageData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/identify/base64`, {
        image: imageData
      });
      
      setResult(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError('Error identifying plant. Please try again.');
      console.error('Error identifying plant:', err);
    }
  };
  
  // Add debugging log for component mount
  useEffect(() => {
    console.log('Home component mounted');
    return () => {
      console.log('Home component unmounted');
      stopWebcam();
    };
  }, []);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex mb-6 border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'webcam' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-500'}`}
            onClick={() => switchTab('webcam')}
          >
            Use Webcam
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'upload' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-500'}`}
            onClick={() => switchTab('upload')}
          >
            Upload Image
          </button>
        </div>
        
        {/* Webcam Tab */}
        {activeTab === 'webcam' && (
          <div>
            {!capturedImage ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md h-80 bg-black rounded-lg overflow-hidden mb-4">
                  {isCapturing ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                </div>
                
                {isCapturing ? (
                  <button 
                    onClick={captureImage}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                  >
                    Capture Photo
                  </button>
                ) : (
                  <button 
                    onClick={startWebcam}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                  >
                    Start Camera
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md h-80 bg-black rounded-lg overflow-hidden mb-4">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={handleReset}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={() => identifyPlant(capturedImage)}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Identifying...' : 'Identify Plant'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            {!uploadedImage ? (
              <div className="flex flex-col items-center">
                <div 
                  className="w-full max-w-md h-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <div className="text-center p-6 cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => document.getElementById('file-upload').click()}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  Select Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md h-80 bg-black rounded-lg overflow-hidden mb-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={handleReset}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    Choose Another
                  </button>
                  <button 
                    onClick={() => identifyPlant(uploadedImage)}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Identifying...' : 'Identify Plant'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && <LoadingSpinner />}
        
        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Identification Results</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Plant Name</h3>
            <p className="text-xl">{result.plantName}</p>
            {result.scientificName && (
              <p className="text-gray-600 italic">{result.scientificName}</p>
            )}
            {result.confidence && (
              <p className="text-sm text-gray-500 mt-1">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            )}
          </div>
          
          {/* Reference Images */}
          {result.images && result.images.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Reference Images</h3>
              <div className="flex flex-wrap gap-2">
                {result.images.map((image, index) => (
                  <div key={index} className="w-24 h-24 overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Medicinal Properties</h3>
            {result.medicinalProperties && result.medicinalProperties.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {result.medicinalProperties.map((property, index) => (
                  <li key={index} className="text-gray-700">{property}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No medicinal properties found for this plant.</p>
            )}
          </div>
          
          {result.note && (
            <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">
              <p>{result.note}</p>
            </div>
          )}
          
          <div className="mt-6">
            <button 
              onClick={handleReset}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
            >
              Scan Another Plant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home; 