# Herbal Garden

A full-stack web application that identifies plants and displays their medicinal properties. Users can scan plants using their webcam or upload images to identify plants and learn about their medicinal uses.

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both client and server in development mode
npm run dev

# Client will run on http://localhost:5173
# Server will run on http://localhost:5000
```

## Features

- Capture images using webcam
- Upload images from device
- Plant identification using Plant.id API
- Display medicinal properties of identified plants
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React
- TailwindCSS
- Axios
- React Router

### Backend
- Node.js
- Express
- Multer for file handling
- Axios for API requests

## Project Structure

```
Herbal Garden/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── assets/      # Static assets
│   ├── public/          # Public files
│   └── ...
├── server/              # Node.js backend
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── data/            # Static data files
│   ├── utils/           # Utility functions
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd Herbal-Garden
```

2. Install frontend dependencies:
```
cd client
npm install
```

3. Install backend dependencies:
```
cd ../server
npm install
```

4. Create a `.env` file in the server directory:
```
PORT=5000
PLANT_ID_API_KEY=your_plant_id_api_key_here
```

Note: You can get a Plant.id API key by signing up at [https://web.plant.id/](https://web.plant.id/)

### Running the Application

1. Start the backend server:
```
cd server
npm run dev
```

2. Start the frontend development server:
```
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Frontend (Vercel)

1. Push your code to a GitHub repository
2. Sign up for a Vercel account at [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure the project:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add `VITE_API_URL` with your backend URL

### Backend (Render or Railway)

#### Render
1. Sign up for a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add `PORT` and `PLANT_ID_API_KEY`

#### Railway
1. Sign up for a Railway account at [railway.app](https://railway.app)
2. Create a new project
3. Add a service from GitHub
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add `PORT` and `PLANT_ID_API_KEY`

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Plant.id API](https://web.plant.id/) for plant identification
- [TailwindCSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework 