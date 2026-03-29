// Google Sheets Integration Module
class GoogleSheetsAPI {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.isConnected = false;
    }
    
    // Test connection to Google Sheets
    async testConnection() {
        if (!this.apiUrl) {
            console.warn('Google Sheets API URL not configured');
            return false;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}?action=test`);
            const data = await response.json();
            this.isConnected = data.success;
            return this.isConnected;
        } catch (error) {
            console.error('Google Sheets connection failed:', error);
            return false;
        }
    }
    
    // Fetch all records from Google Sheets
    async fetchRecords() {
        if (!this.apiUrl) return null;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=fetch`);
            const data = await response.json();
            if (data.success && data.records) {
                return data.records;
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch records:', error);
            return null;
        }
    }
    
    // Add new record to Google Sheets
    async addRecord(record) {
        if (!this.apiUrl) return false;
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    record: record
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Failed to add record:', error);
            return false;
        }
    }
    
    // Update existing record
    async updateRecord(record) {
        if (!this.apiUrl) return false;
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    record: record
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Failed to update record:', error);
            return false;
        }
    }
    
    // Delete record
    async deleteRecord(recordId) {
        if (!this.apiUrl) return false;
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    id: recordId
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Failed to delete record:', error);
            return false;
        }
    }
    
    // Bulk sync local data to Google Sheets
    async bulkSync(records) {
        if (!this.apiUrl || !records || records.length === 0) return false;
        
        let successCount = 0;
        for (const record of records) {
            const success = await this.addRecord(record);
            if (success) successCount++;
        }
        
        return { success: true, synced: successCount, total: records.length };
    }
}

// Google Apps Script Code (Copy this to your Google Sheets Script Editor)
/*
// Google Apps Script for Google Sheets Integration
// Deploy as Web App with access: "Anyone" or "Anyone with link"

const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'CRM_Data';

function doGet(e) {
    const action = e.parameter.action || '';
    
    if (action === 'fetch') {
        return fetchRecords();
    } else if (action === 'test') {
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'create') {
        return createRecord(data.record);
    } else if (action === 'update') {
        return updateRecord(data.record);
    } else if (action === 'delete') {
        return deleteRecord(data.id);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function fetchRecords() {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' }));
        
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const records = [];
        
        for (let i = 1; i < data.length; i++) {
            const record = {};
            for (let j = 0; j < headers.length; j++) {
                record[headers[j]] = data[i][j];
            }
            records.push(record);
        }
        
        return ContentService.createTextOutput(JSON.stringify({ success: true, records: records }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function createRecord(record) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        if (!sheet) return { success: false, error: 'Sheet not found' };
        
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const newRow = headers.map(header => record[header] || '');
        sheet.appendRow(newRow);
        
        return { success: true, id: record.id };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function updateRecord(record) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        if (!sheet) return { success: false, error: 'Sheet not found' };
        
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const idColumn = headers.indexOf('id');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][idColumn] === record.id) {
                for (let j = 0; j < headers.length; j++) {
                    sheet.getRange(i + 1, j + 1).setValue(record[headers[j]] || '');
                }
                break;
            }
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function deleteRecord(id) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        if (!sheet) return { success: false, error: 'Sheet not found' };
        
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const idColumn = headers.indexOf('id');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][idColumn] === id) {
                sheet.deleteRow(i + 1);
                break;
            }
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}
*/
