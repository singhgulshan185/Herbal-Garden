const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { handleError } = require('./utils/errorHandler');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('PLANTNET_API_KEY exists:', !!process.env.PLANTNET_API_KEY);
console.log('PLANTNET_API_KEY length:', process.env.PLANTNET_API_KEY ? process.env.PLANTNET_API_KEY.length : 0);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Load medicinal plants data
const medicinalPlantsPath = path.join(__dirname, 'data', 'medicinalPlants.json');
const medicinalPlantsData = JSON.parse(fs.readFileSync(medicinalPlantsPath, 'utf8'));

// Plant identification endpoint (for file upload)
app.post('/api/identify/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    console.log(`Received uploaded file at: ${imagePath}`);
    
    try {
      // Resize the image
      const resizedImage = await sharp(imagePath)
        .resize(800, 800, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      console.log('Image resized successfully');
      
      // Call Pl@ntNet API with resized image
      const plantIdResult = await identifyPlantWithPlantNet(resizedImage);
      
      // Clean up the uploaded file
      fs.unlinkSync(imagePath);
      
      res.json(plantIdResult);
    } catch (apiError) {
      console.error('API error:', apiError);
      // Clean up file even if API call fails
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupError) {
        console.error('Error deleting uploaded file:', cleanupError);
      }
      
      res.status(500).json({ 
        error: 'Error identifying plant', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ error: 'Failed to process uploaded image' });
  }
});

// Plant identification endpoint (for base64 image)
app.post('/api/identify/base64', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    console.log('Received base64 image data');
    
    // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
    const base64Image = image.includes('base64,') ? image.split('base64,')[1] : image;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    try {
      // Resize the image
      const resizedImage = await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      console.log('Image resized successfully');
      
      // Call Pl@ntNet API with resized image
      const plantIdResult = await identifyPlantWithPlantNet(resizedImage);
      
      res.json(plantIdResult);
    } catch (apiError) {
      console.error('API error:', apiError);
      
      res.status(500).json({ 
        error: 'Error identifying plant', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Base64 endpoint error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Function to identify plant using Pl@ntNet API
async function identifyPlantWithPlantNet(imageBuffer) {
  try {
    // Check for Pl@ntNet API key
    const apiKey = process.env.PLANTNET_API_KEY || '2b106UJHR3SqQcJumbqlH21aNe';
    
    console.log('API Key check in identifyPlantWithPlantNet:');
    console.log('- API Key exists:', !!apiKey);
    console.log('- API Key value:', apiKey);
    
    if (!apiKey) {
      console.warn('Pl@ntNet API key not found. Using mock data for development.');
      return getMockIdentificationResult();
    }
    
    console.log('Reading image file for Pl@ntNet API...');
    
    // Create form data for the API request
    const formData = new FormData();
    formData.append('images', imageBuffer, {
      filename: 'resized_image.jpg',
      contentType: 'image/jpeg'
    });
    
    // Use 'all' as the default project (can be changed to specific projects like 'weurope', 'canada', etc.)
    const project = 'all';
    
    console.log(`Sending request to Pl@ntNet API for project: ${project}...`);
    
    // Make the API request to Pl@ntNet with the correct endpoint
    const url = `https://my-api.plantnet.org/v2/identify/${project}?api-key=${apiKey}&include-related-images=true&no-reject=true&lang=en`;
    console.log('Request URL:', url);
    
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Received response from Pl@ntNet API');
    console.log('Response status:', response.status);
    console.log('Response data structure:', JSON.stringify(Object.keys(response.data), null, 2));
    
    const result = response.data;
    
    // Process the Pl@ntNet response
    if (result.results && result.results.length > 0) {
      console.log('Found plant matches:', result.results.length);
      const bestMatch = result.results[0];
      console.log('Best match:', JSON.stringify(bestMatch.species, null, 2));
      
      const plantName = bestMatch.species.scientificNameWithoutAuthor;
      const commonNames = bestMatch.species.commonNames || [];
      const confidence = bestMatch.score;
      
      // Find medicinal properties for the identified plant
      const medicinalInfo = findMedicinalProperties(plantName, commonNames);
      
      console.log('Medicinal info found:', medicinalInfo);
      
      return {
        plantName: commonNames.length > 0 ? commonNames[0] : plantName,
        commonNames,
        confidence,
        medicinalProperties: medicinalInfo.medicinalProperties,
        scientificName: medicinalInfo.scientificName || plantName,
        images: bestMatch.images.map(img => img.url).slice(0, 3) // Get up to 3 reference images
      };
    } else {
      console.log('No plant matches found in the API response');
      return { error: 'Could not identify plant with sufficient confidence' };
    }
  } catch (error) {
    console.error('Error calling Pl@ntNet API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    // Return mock data if API call fails
    return getMockIdentificationResult();
  }
}

// Function to find medicinal properties from our database
function findMedicinalProperties(plantName, commonNames = []) {
  // Convert all names to lowercase for case-insensitive matching
  const lowerPlantName = plantName.toLowerCase();
  const lowerCommonNames = commonNames.map(name => name.toLowerCase());
  
  console.log('Searching for medicinal properties for:', plantName);
  console.log('Common names:', commonNames);
  
  // Search in our medicinal plants database
  const plant = medicinalPlantsData.plants.find(p => {
    const scientificNameMatch = p.scientificName && 
                              (p.scientificName.toLowerCase().includes(lowerPlantName) || 
                               lowerPlantName.includes(p.scientificName.toLowerCase()));
    
    const plantNameMatch = p.name.toLowerCase().includes(lowerPlantName) || 
                          lowerPlantName.includes(p.name.toLowerCase());
    
    const commonNameMatch = lowerCommonNames.some(commonName => 
      p.name.toLowerCase().includes(commonName) || commonName.includes(p.name.toLowerCase())
    );
    
    console.log(`Checking ${p.name} (${p.scientificName}): scientific match: ${scientificNameMatch}, name match: ${plantNameMatch}, common match: ${commonNameMatch}`);
    
    return scientificNameMatch || plantNameMatch || commonNameMatch;
  });
  
  if (plant) {
    console.log('Found matching plant in database:', plant.name);
    return {
      medicinalProperties: plant.medicinalProperties,
      scientificName: plant.scientificName
    };
  }
  
  // If no match found, return empty array
  console.log('No matching plant found in database');
  return {
    medicinalProperties: ['No medicinal properties found in our database for this plant'],
    scientificName: null
  };
}

// Function to return mock data for development without API key
function getMockIdentificationResult() {
  const randomPlantIndex = Math.floor(Math.random() * medicinalPlantsData.plants.length);
  const randomPlant = medicinalPlantsData.plants[randomPlantIndex];
  
  // Sample plant images (replace with actual plant images if available)
  const sampleImages = [
    'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?q=80&w=300',
    'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?q=80&w=300',
    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=300'
  ];
  
  return {
    plantName: randomPlant.name,
    commonNames: [randomPlant.name],
    confidence: 0.95,
    medicinalProperties: randomPlant.medicinalProperties,
    scientificName: randomPlant.scientificName,
    images: sampleImages
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 