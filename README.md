# Inspectra

Inspectra is a comprehensive vehicle inspection management platform designed to streamline the process of booking, conducting, and reviewing vehicle audits. It provides a complete workflow connecting customers, on-field inspectors, and administrators through a unified interface.

## Live Deployments

- Frontend Application: https://inspectra-enmj.vercel.app/
- Backend API: https://inspectra-s4hg.vercel.app/

## Core Features

The platform is divided into three primary user roles, each with distinct capabilities:

### For Customers
- Book new vehicle inspections by providing vehicle details and location.
- Track the real-time status of ongoing inspections.
- View and download final, digitally-signed PDF inspection certificates once approved.

### For Inspectors
- Accept or reject assigned inspection tasks.
- Complete detailed, multi-point diagnostic audits on site.
- Upload images as evidence for specific checklist items.
- Submit final findings for administrative review.

### For Administrators
- Manage and oversee all system bookings.
- Assign available inspectors to pending tasks.
- Review submitted inspection reports and approve them for final dispatch to the customer.

## Technology Stack

- Frontend: Built with React and Vite for a fast, responsive user interface.
- Backend: Powered by Node.js and Express to handle secure routing and API requests.
- Database: MongoDB for robust data storage.
- File Storage: Cloudinary integration for handling image uploads during inspections.
- Document Generation: PDFKit for generating lightweight, serverless-friendly inspection certificates.
- Deployment: Fully hosted on Vercel.

## Local Development

If you wish to run this project locally, you will need Node.js and MongoDB installed on your system.

### Backend Setup
1. Navigate to the backend directory.
2. Run npm install to install dependencies.
3. Create a .env file with your required environment variables (e.g., MongoDB URI, JWT Secret, Cloudinary credentials).
4. Run npm run dev to start the server.

### Frontend Setup
1. Navigate to the frontend directory.
2. Run npm install to install dependencies.
3. Create a .env file and set VITE_API_URL to your local backend address.
4. Run npm run dev to start the Vite development server.

## Architecture Notes

The application uses a serverless-friendly architecture. PDF generation relies on native Node.js tools rather than headless browsers to ensure reliable performance within serverless constraint limits on platforms like Vercel.
