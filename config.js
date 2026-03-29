// Nagarik Solution CRM Configuration
const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        // IMPORTANT: Replace with your Google Apps Script Web App URL after deployment
        API_URL: '', // Example: 'https://script.google.com/macros/s/XXXXXXXX/exec'
        SHEET_ID: '1rEU27LpAQCf6VxYSrYCE1o_C1JXt7NT_yJcg6Kbxvsk', // Your Google Sheet ID
        SHEET_NAME: 'CRM_Data'
    },
    
    // Application Settings
    APP: {
        NAME: 'Nagarik Solution CRM',
        VERSION: '2.0.0',
        COMPANY: 'Nagarik Solution',
        CONTACT_EMAIL: 'info@nagariksolution.com'
    },
    
    // Default Team Members
    TEAM_MEMBERS: [
        'Bikram Shrestha',
        'Sarita KC',
        'Rajesh Hamal',
        'Anita Thapa',
        'Suman Adhikari',
        'Priya Sharma'
    ],
    
    // Organization Types
    ORG_TYPES: [
        'Health Post',
        'Nagar Hospital',
        'Private Organization'
    ],
    
    // Project Types
    PROJECT_TYPES: [
        'Health Post eHMIS',
        'Nagar Hospital eHMIS',
        'Data Collection System (DCS)',
        'Lab Registration System',
        'Hospital Management System',
        'Clinic Management System',
        'Lab Management System',
        'Pharmacy Management System',
        'eCommerce Website',
        'Online Repair Management System',
        'Other customized System'
    ],
    
    // Follow-up Types
    FOLLOWUP_TYPES: [
        'Call Follow Up',
        'Visit',
        'WhatsApp',
        'Email',
        'Meeting'
    ],
    
    // Deal Status Options
    DEAL_STATUS: [
        'Pipeline',
        'Negotiation',
        'Won',
        'Lost'
    ],
    
    // Follow-up Status Options
    FOLLOWUP_STATUS: [
        'Not Started',
        'Initial Contact',
        'Meeting Scheduled',
        'Proposal Sent',
        'Negotiation',
        'Follow-up Done'
    ],
    
    // Province Data
    PROVINCES: {
        'Province 1 (Koshi)': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Morang', 'Sunsari', 'Taplejung'],
        'Province 2 (Madhesh)': ['Bara', 'Parsa', 'Rautahat', 'Saptari', 'Siraha', 'Dhanusha'],
        'Bagmati Province': ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Makwanpur', 'Kavrepalanchok'],
        'Gandaki Province': ['Kaski', 'Gorkha', 'Lamjung', 'Syangja', 'Tanahun'],
        'Lumbini Province': ['Rupandehi', 'Banke', 'Bardiya', 'Dang', 'Kapilvastu'],
        'Karnali Province': ['Surkhet', 'Dailekh', 'Jumla', 'Kalikot'],
        'Sudurpaschim Province': ['Kailali', 'Kanchanpur', 'Dadeldhura', 'Baitadi']
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        USERS: 'nagarik_crm_users',
        CRM_DATA: 'nagarik_crm_data',
        ACTIVITY_LOGS: 'nagarik_crm_logs'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
