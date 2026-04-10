# Mobile Bio Lab

A comprehensive web-based platform for managing mobile biological laboratory operations, including sample collection, analysis, reporting, and resource scheduling.

##  Features

### Core Functionality
- **Sample Management**: Submit, track, and analyze biological samples
- **Protocol Library**: Access and manage standardized testing procedures
- **Report Generation**: Create detailed analysis reports with visualizations
- **Mobile Lab Scheduling**: Book mobile lab visits and equipment usage
- **Sample Sharing**: Securely share sample data with collaborators via email or links
- **User Management**: Role-based access (Student, Researcher, Technician, Admin)
- **Real-time Notifications**: Stay updated on sample status and lab activities

### Technical Features
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Email Integration**: Automated notifications via Brevo SMTP service
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Authentication**: Secure session-based authentication system
- **API**: RESTful API with comprehensive error handling

##  Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile-bio-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgres://username:password@localhost:5432/mobile_bio_lab
   
   # Session Secret
   SESSION_SECRET=your-secret-key
   
   # Email (Brevo SMTP)
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-email@smtp-brevo.com
   SMTP_PASS=your-brevo-api-key
   SMTP_FROM=your-email@gmail.com
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb mobile_bio_lab
   
   # Run migrations (if applicable)
   npm run db:migrate
   ```

### Running the Application

1. **Development mode**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000`

2. **Production mode**
   ```bash
   npm run build
   npm start
   ```

##  Project Structure

```
mobile-bio-lab/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
│   └── public/           # Static assets
├── server/               # Backend Node.js application
│   ├── routes/        # API endpoints
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   └── auth/           # Authentication logic
├── shared/               # Shared TypeScript definitions
└── docs/                # Documentation
```

## 🔧 Configuration

### Database Setup
The application uses PostgreSQL with the following main tables:
- `users` - User accounts and roles
- `samples` - Biological sample records
- `protocols` - Testing procedures
- `reports` - Analysis reports
- `slot_reservations` - Mobile lab bookings
- `sample_shares` - Sample sharing records
- `notifications` - User notifications

### Email Configuration
The system integrates with Brevo SMTP for sending:
- Sample sharing notifications
- Lab reservation confirmations
- System alerts and updates

### User Roles
- **Student**: Submit samples, view reports, book lab slots
- **Researcher**: Manage protocols, analyze samples, generate reports
- **Technician**: Process samples, manage lab operations
- **Admin**: Full system access and user management

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Samples
- `GET /api/samples` - List samples (with filtering)
- `POST /api/samples` - Create new sample
- `GET /api/samples/:id` - Get sample details
- `PUT /api/samples/:id` - Update sample
- `DELETE /api/samples/:id` - Delete sample

### Protocols
- `GET /api/protocols` - List protocols
- `POST /api/protocols` - Create protocol (Admin only)
- `GET /api/protocols/:id` - Get protocol details
- `PUT /api/protocols/:id` - Update protocol (Admin only)
- `DELETE /api/protocols/:id` - Delete protocol (Admin only)

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Generate new report

### Lab Scheduling
- `GET /api/slot-reservations` - List reservations
- `POST /api/slot-reservations` - Book lab slot
- `PUT /api/slot-reservations/:id` - Update reservation
- `DELETE /api/slot-reservations/:id` - Cancel reservation

### Sample Sharing
- `GET /api/sample-shares` - List shared samples
- `POST /api/sample-shares` - Share sample via email/link
- `GET /api/sample-shares/token/:token` - Access shared sample
- `DELETE /api/sample-shares/:id` - Revoke share

## 🧪 Sample Workflow

1. **Sample Collection**
   - User submits sample with metadata (type, location, collection date)
   - System assigns unique sample ID and timestamps
   - Notification sent to relevant users

2. **Lab Processing**
   - Technician processes sample using standardized protocols
   - Sensor data collected and stored
   - Status updates tracked in real-time

3. **Analysis & Reporting**
   - Researcher analyzes processed samples
   - Generate comprehensive reports with visualizations
   - Reports linked to original sample records

4. **Data Sharing**
   - Secure sharing via email or generated links
   - Access control with expiration and usage limits
   - Professional email notifications with sample details


### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Building for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```


## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added sample sharing and email notifications
- **v1.2.0** - Enhanced mobile lab scheduling system
- **v1.3.0** - Improved UI/UX and added reporting features

---

