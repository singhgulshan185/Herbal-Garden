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
  
  // If no exact match found, try to determine plant family and provide general information
  const plantFamily = determinePlantFamily(plantName);
  if (plantFamily) {
    console.log('No exact match found, but determined plant family:', plantFamily.family);
    return {
      medicinalProperties: plantFamily.properties,
      scientificName: null,
      note: "Based on plant family characteristics. Consult with a specialist for specific medicinal uses."
    };
  }
  
  // If no match found, return general information
  console.log('No matching plant found in database');
  return {
    medicinalProperties: ['This plant is not in our medicinal database. Many plants have potential medicinal properties that are yet to be fully documented. Please consult with a herbalist or botanical expert for more information.'],
    scientificName: null,
    note: "This plant was not found in our medicinal database. Always consult with experts before using any plant for medicinal purposes."
  };
}

// Function to determine plant family based on scientific name
function determinePlantFamily(scientificName) {
  // Common plant families and their general medicinal properties
  const plantFamilies = [
    {
      family: "Lamiaceae (Mint family)",
      keywords: ["mentha", "lavandula", "salvia", "thymus", "rosmarinus", "ocimum", "origanum", "melissa"],
      properties: [
        "Many plants in the mint family contain essential oils",
        "Often have aromatic properties",
        "Commonly used for digestive issues",
        "May have calming or soothing effects",
        "Often used in respiratory treatments"
      ]
    },
    {
      family: "Asteraceae (Sunflower family)",
      keywords: ["helianthus", "echinacea", "calendula", "chamomilla", "artemisia", "taraxacum", "achillea"],
      properties: [
        "Many have anti-inflammatory properties",
        "Often used to support immune function",
        "Some may have detoxifying effects",
        "Commonly used for skin conditions",
        "May help with digestive issues"
      ]
    },
    {
      family: "Rosaceae (Rose family)",
      keywords: ["rosa", "rubus", "fragaria", "malus", "prunus", "crataegus"],
      properties: [
        "Often rich in antioxidants",
        "Many have astringent properties",
        "Some support cardiovascular health",
        "May have anti-inflammatory effects",
        "Often used for digestive issues"
      ]
    },
    {
      family: "Apiaceae (Carrot family)",
      keywords: ["daucus", "anethum", "coriandrum", "cuminum", "foeniculum", "apium"],
      properties: [
        "Many support digestive function",
        "Often have carminative properties (reduce gas)",
        "Some have antispasmodic effects",
        "May support kidney and urinary tract health",
        "Often used for respiratory conditions"
      ]
    },
    {
      family: "Fabaceae (Legume family)",
      keywords: ["glycyrrhiza", "astragalus", "trigonella", "cassia", "acacia", "trifolium"],
      properties: [
        "Many have adaptogenic properties",
        "Often support immune function",
        "Some have anti-inflammatory effects",
        "May help balance hormones",
        "Often used for respiratory support"
      ]
    },
    {
      family: "Zingiberaceae (Ginger family)",
      keywords: ["zingiber", "curcuma", "alpinia", "elettaria"],
      properties: [
        "Many have anti-inflammatory properties",
        "Often support digestive health",
        "Some have warming effects",
        "May help with nausea and motion sickness",
        "Often used for joint health"
      ]
    }
  ];

  // Convert scientific name to lowercase for matching
  const lowerName = scientificName.toLowerCase();
  
  // Check if the scientific name contains any family keywords
  for (const family of plantFamilies) {
    if (family.keywords.some(keyword => lowerName.includes(keyword))) {
      return family;
    }
  }
  
  return null;
}

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
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      
      console.log('Received response from Pl@ntNet API');
      console.log('Response status:', response.status);
      console.log('Response data structure:', JSON.stringify(Object.keys(response.data), null, 2));
      
      const result = response.data;
      
      // Process the Pl@ntNet API response
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
          images: bestMatch.images.map(img => img.url).slice(0, 3), // Get up to 3 reference images
          note: medicinalInfo.note
        };
      } else {
        console.log('No plant matches found in the API response');
        return { 
          error: 'Could not identify plant with sufficient confidence',
          medicinalProperties: ['Unable to identify this plant. Please try a clearer image or a different angle.']
        };
      }
    } catch (apiError) {
      console.error('API error:', apiError);
      if (apiError.response) {
        console.error('Response status:', apiError.response.status);
        console.error('Response data:', JSON.stringify(apiError.response.data, null, 2));
      }
      
      // Try fallback to plant.id API if available or return mock data
      return getMockIdentificationResult();
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