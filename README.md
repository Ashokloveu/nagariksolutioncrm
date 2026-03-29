# Nagarik Solution Enterprise CRM

A comprehensive Customer Relationship Management (CRM) system for tracking local bodies, health posts, hospitals, and private organizations in Nepal. Built with pure HTML, CSS, and JavaScript.

## 🚀 Features

### Core Features
- **Complete Local Body Database**: All 753 municipalities of Nepal
- **Organization Types**: Health Posts, Nagar Hospitals, Private Organizations
- **Project Tracking**: 12+ software project types including eHMIS, HMS, DCS
- **Follow-up Management**: Track calls, visits, WhatsApp communications
- **Nepali Date (BS) Support**: Full Bikram Sambat calendar integration
- **Task Assignment**: Assign tasks to team members with transfer capability

### User Management
- **Role-Based Access**: Admin, Manager, User roles
- **User Registration**: Self-registration with email verification
- **Session Management**: Secure login/logout system
- **Activity Logging**: Complete audit trail of all actions

### Admin Panel
- **User Management**: Add, edit, delete users
- **Role Management**: Assign roles and permissions
- **Activity Monitoring**: View all user activities
- **Data Export**: Export CRM data and user lists to Excel

### Technical Features
- **Google Sheets Integration**: Cloud storage and synchronization
- **Local Storage Backup**: Offline data persistence
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Beautiful gradient design with animations

## 📋 Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Google Account (for Sheets integration)
- Git (for deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nagarik-solution-crm.git
cd nagarik-solution-crm
```

2. **Open the application**

```bash
# Using Python (if you have Python installed)
python -m http.server 8000

# Or use any local server like Live Server in VS Code
```

3. **Access the application**
Open your browser and navigate to `http://localhost:8000`

### Default Login Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@nagarik.com | admin123 |
| Manager | manager@nagarik.com | manager123 |
| User | user@nagarik.com | user123 |

## 🔌 Google Sheets Integration Setup

### Step 1: Create Google Sheet
1. Go to Google Sheets
2. Create a new spreadsheet named "Nagarik CRM Data"
3. Add headers in the first row:
```text
id, orgType, province, district, bodyName, projectType, contactPerson, designation, contactInfo, assignedTo, followupType, followupStatus, dealStatus, timeSpent, followedDateBS, nextFollowupDateBS, projectBudget, notes, createdAt, updatedAt
```

### Step 2: Create Google Apps Script
1. In your Google Sheet, go to Extensions → Apps Script
2. Delete any existing code and paste the Google Apps Script code from `google-sheets.js`
3. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID (found in the URL)
4. Save the project (name it "Nagarik CRM Integration")
5. Click Deploy → New Deployment
6. Choose Web app as deployment type
7. Set Execute as to "Me" and Who has access to "Anyone"
8. Click Deploy and copy the generated URL

### Step 3: Configure the Application
1. Open `config.js` in your project
2. Replace the `API_URL` with your Google Apps Script Web App URL

## 🚀 Deployment to GitHub Pages

### Option 1: Direct Upload
1. Go to GitHub and create a new repository
2. Name it `nagarik-solution-crm`
3. Push your files:
```bash
git init
git add .
git commit -m "Initial commit: Nagarik Solution CRM"
git branch -M main
git remote add origin https://github.com/yourusername/nagarik-solution-crm.git
git push -u origin main
```
4. Enable GitHub Pages in repository Settings → Pages, select `main` branch.

### Option 2: Using GitHub CLI
```bash
gh repo create nagarik-solution-crm --public --source=. --remote=origin --push
```

## 🔧 Configuration

### Environment Variables
Create a `config.local.js` file for local development:
```javascript
const LOCAL_CONFIG = {
    GOOGLE_SHEETS_API_URL: 'http://localhost:3000/api',
};
```

### Customizing Team Members
Edit `TEAM_MEMBERS` array in `config.js`:
```javascript
TEAM_MEMBERS: [
    'Your Name',
    'Colleague Name',
]
```

## 🛡️ Security Considerations
- **Authentication**: Session-based authentication using sessionStorage
- **Authorization**: Role-based access control
- **Data Validation**: Client-side validation for all inputs
- **XSS Prevention**: HTML escaping for user inputs
- **CSRF Protection**: Token validation for API calls

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors
Nagarik Solution - Initial work - Nagarik Solution

## 🙏 Acknowledgments
- All local bodies of Nepal for their service
- Team members at Nagarik Solution
- Open source community

## 📞 Support
For support, email info@nagariksolution.com or create an issue in the GitHub repository.

Built with ❤️ by Nagarik Solution | Empowering Nepal's Digital Transformation
