const fs = require('fs');
const path = require('path');

// Arrays of plant names, scientific names, and medicinal properties
const commonPlants = [
  // Existing plants from our database
  { name: "Tulsi (Holy Basil)", scientificName: "Ocimum sanctum" },
  { name: "Aloe Vera", scientificName: "Aloe barbadensis miller" },
  { name: "Turmeric", scientificName: "Curcuma longa" },
  { name: "Ginger", scientificName: "Zingiber officinale" },
  { name: "Mint", scientificName: "Mentha" },
  { name: "Lavender", scientificName: "Lavandula" },
  { name: "Chamomile", scientificName: "Matricaria chamomilla" },
  { name: "Neem", scientificName: "Azadirachta indica" },
  { name: "Eucalyptus", scientificName: "Eucalyptus globulus" },
  { name: "Dandelion", scientificName: "Taraxacum officinale" },
  { name: "Echinacea", scientificName: "Echinacea purpurea" },
  { name: "Rosemary", scientificName: "Rosmarinus officinalis" },
  { name: "Thyme", scientificName: "Thymus vulgaris" },
  { name: "Sage", scientificName: "Salvia officinalis" },
  { name: "Lemon Balm", scientificName: "Melissa officinalis" },
  { name: "St. John's Wort", scientificName: "Hypericum perforatum" },
  
  // Additional common medicinal plants
  { name: "Garlic", scientificName: "Allium sativum" },
  { name: "Cinnamon", scientificName: "Cinnamomum verum" },
  { name: "Ginseng", scientificName: "Panax ginseng" },
  { name: "Valerian", scientificName: "Valeriana officinalis" },
  { name: "Feverfew", scientificName: "Tanacetum parthenium" },
  { name: "Milk Thistle", scientificName: "Silybum marianum" },
  { name: "Ashwagandha", scientificName: "Withania somnifera" },
  { name: "Calendula", scientificName: "Calendula officinalis" },
  { name: "Ginkgo", scientificName: "Ginkgo biloba" },
  { name: "Black Cohosh", scientificName: "Actaea racemosa" },
  { name: "Licorice Root", scientificName: "Glycyrrhiza glabra" },
  { name: "Peppermint", scientificName: "Mentha piperita" },
  { name: "Fennel", scientificName: "Foeniculum vulgare" },
  { name: "Clove", scientificName: "Syzygium aromaticum" },
  { name: "Yarrow", scientificName: "Achillea millefolium" },
  { name: "Elderberry", scientificName: "Sambucus nigra" },
  { name: "Goldenseal", scientificName: "Hydrastis canadensis" },
  { name: "Comfrey", scientificName: "Symphytum officinale" },
  { name: "Marshmallow", scientificName: "Althaea officinalis" },
  { name: "Plantain", scientificName: "Plantago major" },
  { name: "Burdock", scientificName: "Arctium lappa" },
  { name: "Nettle", scientificName: "Urtica dioica" },
  { name: "Hawthorn", scientificName: "Crataegus" },
  { name: "Red Clover", scientificName: "Trifolium pratense" },
  { name: "Passionflower", scientificName: "Passiflora incarnata" },
  { name: "Kava Kava", scientificName: "Piper methysticum" },
  { name: "Astragalus", scientificName: "Astragalus membranaceus" },
  { name: "Saw Palmetto", scientificName: "Serenoa repens" },
  { name: "Lemongrass", scientificName: "Cymbopogon" },
  { name: "Oregano", scientificName: "Origanum vulgare" },
  { name: "Basil", scientificName: "Ocimum basilicum" },
  { name: "Cayenne", scientificName: "Capsicum annuum" },
  { name: "Cardamom", scientificName: "Elettaria cardamomum" },
  { name: "Cumin", scientificName: "Cuminum cyminum" },
  { name: "Fenugreek", scientificName: "Trigonella foenum-graecum" },
  { name: "Black Pepper", scientificName: "Piper nigrum" },
  { name: "Coriander", scientificName: "Coriandrum sativum" },
  { name: "Dill", scientificName: "Anethum graveolens" },
  { name: "Parsley", scientificName: "Petroselinum crispum" },
  { name: "Cilantro", scientificName: "Coriandrum sativum" },
  { name: "Chives", scientificName: "Allium schoenoprasum" },
  { name: "Marjoram", scientificName: "Origanum majorana" },
  { name: "Bay Leaf", scientificName: "Laurus nobilis" },
  { name: "Juniper", scientificName: "Juniperus communis" },
  { name: "Saffron", scientificName: "Crocus sativus" },
  { name: "Horseradish", scientificName: "Armoracia rusticana" },
  { name: "Wasabi", scientificName: "Wasabia japonica" },
  { name: "Mustard", scientificName: "Brassica" },
  { name: "Tarragon", scientificName: "Artemisia dracunculus" }
];

// Medicinal properties
const medicinalProperties = [
  "Anti-inflammatory",
  "Antibacterial",
  "Antiviral",
  "Antifungal",
  "Antioxidant",
  "Digestive aid",
  "Immune system booster",
  "Pain relief",
  "Wound healing",
  "Skin treatment",
  "Respiratory relief",
  "Sleep aid",
  "Anxiety relief",
  "Stress reduction",
  "Memory enhancement",
  "Energy boost",
  "Blood purifier",
  "Heart health",
  "Liver support",
  "Kidney support",
  "Blood sugar regulation",
  "Blood pressure regulation",
  "Anti-cancer properties",
  "Anti-aging",
  "Hair health",
  "Bone strength",
  "Joint health",
  "Muscle relaxant",
  "Fever reducer",
  "Detoxification",
  "Allergy relief",
  "Hormone balance",
  "Reproductive health",
  "Urinary tract health",
  "Eye health",
  "Brain function",
  "Nerve health",
  "Circulation improvement",
  "Weight management",
  "Metabolism boost",
  "Cholesterol reduction",
  "Anti-parasitic",
  "Anti-nausea",
  "Diuretic",
  "Expectorant",
  "Aphrodisiac",
  "Menopause relief",
  "PMS relief",
  "Headache relief",
  "Dental health"
];

// Generate a large database of plants
function generatePlantDatabase(count = 1000) {
  // Start with our common plants
  let plants = [...commonPlants];
  
  // Generate additional plants if needed
  if (count > plants.length) {
    const additionalCount = count - plants.length;
    
    // Generate plant families and genera for scientific names
    const plantFamilies = [
      "Lamiaceae", "Asteraceae", "Apiaceae", "Rosaceae", "Fabaceae", 
      "Solanaceae", "Brassicaceae", "Poaceae", "Rutaceae", "Liliaceae",
      "Malvaceae", "Euphorbiaceae", "Ranunculaceae", "Orchidaceae", "Zingiberaceae"
    ];
    
    const plantGenera = [
      "Acacia", "Acer", "Achillea", "Aconitum", "Adansonia", "Adiantum", "Aesculus",
      "Agave", "Alchemilla", "Allium", "Aloe", "Alpinia", "Amaranthus", "Ananas",
      "Anemone", "Angelica", "Annona", "Anthriscus", "Apium", "Aquilegia", "Aralia",
      "Arctium", "Arnica", "Artemisia", "Asarum", "Asclepias", "Asparagus", "Astragalus",
      "Atropa", "Avena", "Bellis", "Berberis", "Beta", "Betula", "Borago",
      "Brassica", "Bryonia", "Calendula", "Camellia", "Cannabis", "Capsella", "Capsicum",
      "Cardamine", "Carica", "Carthamus", "Carum", "Cassia", "Castanea", "Catharanthus",
      "Centaurea", "Centella", "Cetraria", "Chamaemelum", "Chelidonium", "Chrysanthemum", "Cichorium",
      "Cinchona", "Cinnamomum", "Cirsium", "Citrus", "Cnicus", "Coffea", "Colchicum",
      "Commiphora", "Convallaria", "Coriandrum", "Crataegus", "Crocus", "Cucurbita", "Cuminum",
      "Curcuma", "Cynara", "Datura", "Daucus", "Digitalis", "Dioscorea", "Echinacea",
      "Eleutherococcus", "Ephedra", "Equisetum", "Erigeron", "Eriodictyon", "Erythroxylum", "Eucalyptus",
      "Euphrasia", "Ferula", "Filipendula", "Foeniculum", "Fragaria", "Fumaria", "Galega",
      "Gaultheria", "Gentiana", "Geranium", "Ginkgo", "Glycyrrhiza", "Gossypium", "Hamamelis",
      "Harpagophytum", "Hedera", "Helianthus", "Hibiscus", "Humulus", "Hydrastis", "Hyoscyamus",
      "Hypericum", "Hyssopus", "Ilex", "Illicium", "Inula", "Iris", "Jasminum"
    ];
    
    // Generate additional plants
    for (let i = 0; i < additionalCount; i++) {
      const genus = plantGenera[Math.floor(Math.random() * plantGenera.length)];
      const species = genus.toLowerCase() + ["um", "us", "a", "is", "ens", "atum", "oides", "iana", "icum"][Math.floor(Math.random() * 9)];
      const commonName = genus + " " + ["Herb", "Plant", "Root", "Flower", "Leaf", "Berry", "Bark", "Seed", "Fruit"][Math.floor(Math.random() * 9)];
      
      plants.push({
        name: commonName,
        scientificName: genus + " " + species
      });
    }
  }
  
  // Add medicinal properties to each plant
  const plantDatabase = plants.map(plant => {
    // Shuffle and select 3-7 properties for each plant
    const shuffledProperties = [...medicinalProperties].sort(() => 0.5 - Math.random());
    const numProperties = Math.floor(Math.random() * 5) + 3; // 3 to 7 properties
    
    return {
      name: plant.name,
      scientificName: plant.scientificName,
      medicinalProperties: shuffledProperties.slice(0, numProperties)
    };
  });
  
  return plantDatabase;
}

// Generate plants and save to file
const plants = generatePlantDatabase(1000);
const plantData = { plants };

// Write to file
const outputPath = path.join(__dirname, '..', 'data', 'medicinalPlants.json');
fs.writeFileSync(outputPath, JSON.stringify(plantData, null, 2));

console.log(`Generated ${plants.length} plants and saved to ${outputPath}`); 