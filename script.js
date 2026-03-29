// Data Storage
let currentUser = null;
let records = [];
let users = [];
let activityLogs = [];
let currentTransferId = null;

const CRM_KEY = "nagarik_crm_data";
const USERS_KEY = "nagarik_crm_users";
const LOGS_KEY = "nagarik_crm_logs";

// Default users
const defaultUsers = [
    { id: "1", fullName: "Administrator", email: "admin@nagarik.com", password: "admin123", role: "admin", status: "active", createdAt: new Date().toISOString(), lastLogin: null },
    { id: "2", fullName: "Manager User", email: "manager@nagarik.com", password: "manager123", role: "manager", status: "active", createdAt: new Date().toISOString(), lastLogin: null },
    { id: "3", fullName: "Team Member", email: "user@nagarik.com", password: "user123", role: "user", status: "active", createdAt: new Date().toISOString(), lastLogin: null }
];

// Initialize data
function initData() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(LOGS_KEY)) {
        localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    }
    users = JSON.parse(localStorage.getItem(USERS_KEY));
    activityLogs = JSON.parse(localStorage.getItem(LOGS_KEY));
    
    // Load team members into assignedTo dropdown
    const teamMembers = users.filter(u => u.status === 'active').map(u => u.fullName);
    const assignedSelect = document.getElementById('assignedTo');
    assignedSelect.innerHTML = '<option value="">-- Select --</option>';
    teamMembers.forEach(m => { assignedSelect.innerHTML += `<option value="${m}">${m}</option>`; });
}

// Add activity log
function addLog(action, details) {
    const log = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        user: currentUser?.fullName || 'System',
        userEmail: currentUser?.email || 'system',
        action: action,
        details: details
    };
    activityLogs.unshift(log);
    if (activityLogs.length > 100) activityLogs.pop();
    localStorage.setItem(LOGS_KEY, JSON.stringify(activityLogs));
    if (document.getElementById('activityLogsBody')) renderActivityLogs();
}

// Authentication
function checkAuth() {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateLastLogin(currentUser.id);
        initData();
        showApp();
    } else {
        window.location.href = 'login.html';
    }
}

function updateLastLogin(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].lastLogin = new Date().toLocaleString();
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}

function showApp() {
    document.getElementById('navUserName').innerText = currentUser.fullName;
    document.getElementById('navUserRole').innerText = currentUser.role.toUpperCase();
    document.getElementById('navUserRole').className = `role-badge role-${currentUser.role}`;
    
    // Show/hide admin tab based on role
    if (currentUser.role !== 'admin') {
        document.getElementById('tabAdmin').style.display = 'none';
    } else {
        document.getElementById('tabAdmin').style.display = 'flex';
    }
    
    loadCRMData();
    loadUsersData();
    renderActivityLogs();
    switchTab('crm');
}

function logout() {
    addLog('Logout', `${currentUser.fullName} logged out`);
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Tab switching
function switchTab(tab) {
    if (tab === 'crm') {
        document.getElementById('crmContainer').style.display = 'block';
        document.getElementById('adminContainer').style.display = 'none';
        document.getElementById('tabCRM').classList.add('active');
        document.getElementById('tabAdmin').classList.remove('active');
        loadCRMData();
    } else if (tab === 'admin' && currentUser.role === 'admin') {
        document.getElementById('crmContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        document.getElementById('tabAdmin').classList.add('active');
        document.getElementById('tabCRM').classList.remove('active');
        loadUsersData();
        renderActivityLogs();
    }
}

// CRM Functions
function loadCRMData() {
    const stored = localStorage.getItem(CRM_KEY);
    records = stored ? JSON.parse(stored) : [];
    applyFilters();
}

function getCurrentBSDate() { const d = new Date(); return `${d.getFullYear()+57}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
document.getElementById('followedDateBS').value = getCurrentBSDate();

const districtData = {
    "Province 1 (Koshi)": ["Bhojpur", "Jhapa", "Morang", "Sunsari"],
    "Province 2 (Madhesh)": ["Bara", "Parsa", "Saptari"],
    "Bagmati Province": ["Kathmandu", "Lalitpur", "Bhaktapur", "Chitwan"],
    "Gandaki Province": ["Kaski", "Gorkha"],
    "Lumbini Province": ["Rupandehi", "Banke"],
    "Karnali Province": ["Surkhet"],
    "Sudurpaschim Province": ["Kailali", "Kanchanpur"]
};

function populateDistricts(province, targetId, includeAll = false) {
    const target = document.getElementById(targetId);
    target.innerHTML = '<option value="">' + (includeAll ? 'All Districts' : '-- Select --') + '</option>';
    if (province && districtData[province]) {
        districtData[province].forEach(d => { target.innerHTML += `<option value="${d}">${d}</option>`; });
    }
}

document.getElementById('province').addEventListener('change', function() { populateDistricts(this.value, 'district', false); });
document.getElementById('filterProvince').addEventListener('change', function() { populateDistricts(this.value, 'filterDistrict', true); applyFilters(); });

Object.keys(districtData).forEach(p => { document.getElementById('filterProvince').innerHTML += `<option value="${p}">${p}</option>`; });
['Health Post', 'Nagar Hospital', 'Private Organization'].forEach(t => { document.getElementById('filterOrgType').innerHTML += `<option value="${t}">${t}</option>`; });
['Health Post eHMIS', 'Nagar Hospital eHMIS', 'Data Collection System (DCS)', 'Hospital Management System', 'eCommerce Website', 'Other customized System'].forEach(p => { document.getElementById('filterProjectType').innerHTML += `<option value="${p}">${p}</option>`; });

function applyFilters() {
    let filtered = [...records];
    const fOrg = document.getElementById('filterOrgType').value;
    const fProj = document.getElementById('filterProjectType').value;
    const fProv = document.getElementById('filterProvince').value;
    const fDist = document.getElementById('filterDistrict').value;
    const fAssigned = document.getElementById('filterAssignedTo').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    if (fOrg) filtered = filtered.filter(r => r.orgType === fOrg);
    if (fProj) filtered = filtered.filter(r => r.projectType === fProj);
    if (fProv) filtered = filtered.filter(r => r.province === fProv);
    if (fDist) filtered = filtered.filter(r => r.district === fDist);
    if (fAssigned) filtered = filtered.filter(r => r.assignedTo === fAssigned);
    if (search) filtered = filtered.filter(r => r.bodyName.toLowerCase().includes(search) || (r.contactPerson && r.contactPerson.toLowerCase().includes(search)));
    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;">No records found</td></tr>'; updateStats(); return; }
    tbody.innerHTML = data.map(r => `<tr>
        <td><span class="org-badge org-${r.orgType === 'Health Post' ? 'healthpost' : r.orgType === 'Nagar Hospital' ? 'hospital' : 'private'}">${r.orgType}</span></td>
        <td><strong>${escapeHtml(r.bodyName)}</strong><br><small>${r.district}</small></td>
        <td>${r.projectType}</td>
        <td>${escapeHtml(r.contactPerson)}<br><small>${r.designation || ''}</small></td>
        <td><i class="fas fa-user"></i> ${r.assignedTo}</td>
        <td><span class="status-badge">${r.followupStatus}</span></td>
        <td><span class="status-badge status-${r.dealStatus.toLowerCase()}">${r.dealStatus}</span></td>
        <td>${r.timeSpent || 0}h</td>
        <td>${r.followedDateBS}</td>
        <td>${r.nextFollowupDateBS || '-'}</td>
        <td>${r.projectBudget ? 'रू ' + Number(r.projectBudget).toLocaleString() : '-'}</td>
        <td>${currentUser?.role === 'admin' ? `<button class="edit-btn" data-id="${r.id}"><i class="fas fa-edit"></i></button><button class="transfer-btn" data-id="${r.id}"><i class="fas fa-exchange-alt"></i></button><button class="delete-btn" data-id="${r.id}"><i class="fas fa-trash"></i></button>` : '<span style="color:gray;">View only</span>'}</td>
    </tr>`).join('');
    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', () => loadRecordForEdit(b.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', () => deleteRecord(b.dataset.id)));
    document.querySelectorAll('.transfer-btn').forEach(b => b.addEventListener('click', () => openTransferModal(b.dataset.id)));
    updateStats();
}

function updateStats() {
    document.getElementById('totalCount').innerText = records.length;
    document.getElementById('activeProjects').innerText = records.filter(r => r.dealStatus !== 'Won' && r.dealStatus !== 'Lost').length;
    document.getElementById('wonDeals').innerText = records.filter(r => r.dealStatus === 'Won').length;
    const today = getCurrentBSDate();
    document.getElementById('pendingFollowups').innerText = records.filter(r => r.nextFollowupDateBS && r.nextFollowupDateBS < today && r.dealStatus !== 'Won').length;
}

function escapeHtml(s) { if(!s) return ''; return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

document.getElementById('crmForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') { alert('Only administrators can add/edit records!'); return; }
    const record = {
        id: document.getElementById('editRowId').value || Date.now().toString(),
        orgType: document.getElementById('orgType').value,
        province: document.getElementById('province').value,
        district: document.getElementById('district').value,
        bodyName: document.getElementById('bodyName').value,
        projectType: document.getElementById('projectType').value,
        contactPerson: document.getElementById('contactPerson').value,
        designation: document.getElementById('designation').value,
        contactInfo: document.getElementById('contactInfo').value,
        assignedTo: document.getElementById('assignedTo').value,
        followupType: document.getElementById('followupType').value,
        followupStatus: document.getElementById('followupStatus').value,
        dealStatus: document.getElementById('dealStatus').value,
        timeSpent: parseFloat(document.getElementById('timeSpent').value) || 0,
        followedDateBS: document.getElementById('followedDateBS').value,
        nextFollowupDateBS: document.getElementById('nextFollowupDateBS').value,
        projectBudget: document.getElementById('projectBudget').value ? parseFloat(document.getElementById('projectBudget').value) : null,
        notes: document.getElementById('notes').value
    };
    const idx = records.findIndex(r => r.id === record.id);
    if (idx !== -1) records[idx] = record;
    else records.push(record);
    localStorage.setItem(CRM_KEY, JSON.stringify(records));
    addLog('CRM Update', `${currentUser.fullName} ${idx !== -1 ? 'updated' : 'added'} record: ${record.bodyName}`);
    document.getElementById('crmForm').reset();
    document.getElementById('editRowId').value = '';
    document.getElementById('followedDateBS').value = getCurrentBSDate();
    applyFilters();
    alert('Record saved successfully!');
});

function deleteRecord(id) { 
    if(confirm('Delete this record permanently?')) { 
        const record = records.find(r => r.id === id);
        records = records.filter(r => r.id !== id); 
        localStorage.setItem(CRM_KEY, JSON.stringify(records));
        addLog('Delete Record', `${currentUser.fullName} deleted record: ${record?.bodyName}`);
        applyFilters(); 
    } 
}

function loadRecordForEdit(id) { 
    if(currentUser?.role !== 'admin') return; 
    const r = records.find(r => r.id === id); 
    if(r) { 
        Object.keys(r).forEach(k => { const el = document.getElementById(k); if(el) el.value = r[k]; }); 
        document.getElementById('editRowId').value = id; 
    } 
}

function openTransferModal(id) { 
    if(currentUser?.role !== 'admin') return; 
    currentTransferId = id; 
    const r = records.find(r => r.id === id); 
    if(r) { 
        document.getElementById('transferRecordInfo').innerHTML = `<strong>${r.bodyName}</strong><br>Current: ${r.assignedTo}`;
        const teamMembers = users.filter(u => u.status === 'active').map(u => u.fullName);
        const select = document.getElementById('newAssignee');
        select.innerHTML = teamMembers.map(m => `<option value="${m}">${m}</option>`).join('');
        document.getElementById('transferModal').style.display = 'flex'; 
    } 
}

function closeTransferModal() { document.getElementById('transferModal').style.display = 'none'; currentTransferId = null; }

function confirmTransfer() { 
    const newAssignee = document.getElementById('newAssignee').value; 
    if(currentTransferId && newAssignee) { 
        const idx = records.findIndex(r => r.id === currentTransferId); 
        if(idx !== -1) { 
            const old = records[idx].assignedTo;
            records[idx].assignedTo = newAssignee; 
            localStorage.setItem(CRM_KEY, JSON.stringify(records)); 
            addLog('Task Transfer', `${currentUser.fullName} transferred task from ${old} to ${newAssignee}`);
            applyFilters(); 
            alert('Task transferred!'); 
            closeTransferModal(); 
        } 
    } 
}
function downloadSampleExcel() {
    const sampleData = [{
        "Org Type": "Health Post",
        "Province": "Bagmati Province",
        "District": "Kathmandu",
        "Organization": "Balaju Health Post",
        "Project": "Health Post eHMIS",
        "Contact": "Ram Bahadur",
        "Designation": "Health Officer (HO)",
        "Assigned To": "Team Member",
        "Status": "Not Started",
        "Deal": "Pipeline",
        "Time": 0,
        "Follow-up": getCurrentBSDate(),
        "Next": "",
        "Budget": 50000,
        "Notes": "Sample entry"
    }];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample_Data");
    XLSX.writeFile(wb, "Nagarik_CRM_Sample.xlsx");
}

function exportToExcel() { 
    const ws = XLSX.utils.json_to_sheet(records); 
    const wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws, 'CRM_Data'); 
    XLSX.writeFile(wb, `Nagarik_CRM_${new Date().toISOString()}.xlsx`);
    addLog('Export', `${currentUser.fullName} exported CRM data`);
}

// Admin Panel Functions
function loadUsersData() {
    users = JSON.parse(localStorage.getItem(USERS_KEY));
    renderUsersTable();
    updateUserStats();
}

function renderUsersTable() {
    let filtered = [...users];
    const roleFilter = document.getElementById('filterUserRole')?.value;
    const statusFilter = document.getElementById('filterUserStatus')?.value;
    const searchTerm = document.getElementById('searchUser')?.value.toLowerCase();
    
    if (roleFilter) filtered = filtered.filter(u => u.role === roleFilter);
    if (statusFilter) filtered = filtered.filter(u => u.status === statusFilter);
    if (searchTerm) filtered = filtered.filter(u => u.fullName.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm));
    
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = filtered.map(u => `<tr>
        <td><strong>${escapeHtml(u.fullName)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="role-badge role-${u.role}">${u.role.toUpperCase()}</span></td>
        <td class="status-${u.status}">${u.status === 'active' ? '✓ Active' : '✗ Inactive'}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
        <td>${u.lastLogin || '-'}</td>
        <td>
            <button class="btn-edit-user" data-id="${u.id}" style="background:none; border:none; color:var(--info); cursor:pointer;"><i class="fas fa-edit"></i></button>
            <button class="btn-delete-user" data-id="${u.id}" style="background:none; border:none; color:var(--danger); cursor:pointer;"><i class="fas fa-trash"></i></button>
        </td>
    </tr>`).join('');
    
    document.querySelectorAll('.btn-edit-user').forEach(b => b.addEventListener('click', () => loadUserForEdit(b.dataset.id)));
    document.querySelectorAll('.btn-delete-user').forEach(b => b.addEventListener('click', () => deleteUser(b.dataset.id)));
}

function updateUserStats() {
    document.getElementById('totalUsers').innerText = users.length;
    document.getElementById('adminCount').innerText = users.filter(u => u.role === 'admin').length;
    document.getElementById('managerCount').innerText = users.filter(u => u.role === 'manager').length;
    document.getElementById('userCount').innerText = users.filter(u => u.role === 'user').length;
}

function loadUserForEdit(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        document.getElementById('userFullName').value = user.fullName;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
        document.getElementById('userPassword').value = '';
        document.getElementById('editUserId').value = user.id;
    }
}

document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('editUserId').value;
    const userData = {
        id: userId || Date.now().toString(),
        fullName: document.getElementById('userFullName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        createdAt: userId ? users.find(u => u.id === userId)?.createdAt : new Date().toISOString(),
        lastLogin: userId ? users.find(u => u.id === userId)?.lastLogin : null
    };
    
    const password = document.getElementById('userPassword').value;
    if (password) userData.password = password;
    else if (userId) userData.password = users.find(u => u.id === userId)?.password;
    else userData.password = 'password123';
    
    if (userId) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) users[index] = userData;
        addLog('User Update', `${currentUser.fullName} updated user: ${userData.fullName}`);
    } else {
        if (users.find(u => u.email === userData.email)) {
            alert('Email already exists!');
            return;
        }
        users.push(userData);
        addLog('User Create', `${currentUser.fullName} created new user: ${userData.fullName}`);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    loadUsersData();
    document.getElementById('userForm').reset();
    document.getElementById('editUserId').value = '';
    alert('User saved successfully!');
});

function deleteUser(id) {
    const user = users.find(u => u.id === id);
    if (user && user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
        alert('Cannot delete the last administrator!');
        return;
    }
    if (confirm(`Delete user ${user?.fullName}?`)) {
        users = users.filter(u => u.id !== id);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        addLog('User Delete', `${currentUser.fullName} deleted user: ${user?.fullName}`);
        loadUsersData();
    }
}

function renderActivityLogs() {
    const tbody = document.getElementById('activityLogsBody');
    if (!tbody) return;
    const logs = activityLogs.slice(0, 50);
    tbody.innerHTML = logs.map(log => `<tr>
        <td style="white-space: nowrap;">${log.timestamp}</td>
        <td>${escapeHtml(log.user)}</td>
        <td><span class="status-badge">${log.action}</span></td>
        <td>${escapeHtml(log.details)}</td>
    </tr>`).join('');
}

document.getElementById('resetFormBtn')?.addEventListener('click', () => { document.getElementById('crmForm').reset(); document.getElementById('editRowId').value = ''; document.getElementById('followedDateBS').value = getCurrentBSDate(); });
document.getElementById('resetUserForm')?.addEventListener('click', () => { document.getElementById('userForm').reset(); document.getElementById('editUserId').value = ''; });
document.getElementById('exportExcelBtn')?.addEventListener('click', exportToExcel);
document.getElementById('exportUsersBtn')?.addEventListener('click', () => { const ws = XLSX.utils.json_to_sheet(users); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Users'); XLSX.writeFile(wb, `Users_${new Date().toISOString()}.xlsx`); addLog('Export', `${currentUser.fullName} exported users list`); });
document.getElementById('clearLogsBtn')?.addEventListener('click', () => { if(confirm('Clear all activity logs?')) { activityLogs = []; localStorage.setItem(LOGS_KEY, JSON.stringify(activityLogs)); renderActivityLogs(); addLog('Logs Cleared', `${currentUser.fullName} cleared activity logs`); } });
document.getElementById('filterUserRole')?.addEventListener('change', renderUsersTable);
document.getElementById('filterUserStatus')?.addEventListener('change', renderUsersTable);
document.getElementById('searchUser')?.addEventListener('input', renderUsersTable);
document.getElementById('filterAssignedTo')?.addEventListener('change', applyFilters);
document.getElementById('searchInput')?.addEventListener('input', applyFilters);

document.getElementById('importExcelInput')?.addEventListener('change', function(e) {
    if (currentUser?.role !== 'admin') { alert('Only administrators can import records!'); this.value = ''; return; }
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const importedData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (importedData.length === 0) { alert("Excel file is empty!"); return; }
            
            let addedCount = 0;
            importedData.forEach(row => {
                if (row.bodyName || row.Organization) { // Handle local db export or custom format
                    const newRecord = {
                        id: row.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        orgType: row.orgType || row['Org Type'] || '',
                        province: row.province || row.Province || '',
                        district: row.district || row.District || '',
                        bodyName: row.bodyName || row.Organization || '',
                        projectType: row.projectType || row.Project || '',
                        contactPerson: row.contactPerson || row.Contact || '',
                        designation: row.designation || row.Designation || '',
                        contactInfo: row.contactInfo || '',
                        assignedTo: row.assignedTo || row['Assigned To'] || '',
                        followupType: row.followupType || '',
                        followupStatus: row.followupStatus || row.Status || '',
                        dealStatus: row.dealStatus || row.Deal || 'Pipeline',
                        timeSpent: parseFloat(row.timeSpent || row.Time) || 0,
                        followedDateBS: row.followedDateBS || row['Follow-up'] || getCurrentBSDate(),
                        nextFollowupDateBS: row.nextFollowupDateBS || row.Next || '',
                        projectBudget: parseFloat(row.projectBudget || row.Budget) || null,
                        notes: row.notes || row.Notes || ''
                    };
                    
                    const existingIdx = records.findIndex(r => r.id === row.id);
                    if (existingIdx !== -1) { records[existingIdx] = newRecord; } 
                    else { records.push(newRecord); }
                    addedCount++;
                }
            });
            
            if (addedCount > 0) {
                localStorage.setItem(CRM_KEY, JSON.stringify(records));
                addLog('Import CRM Data', `${currentUser.fullName} imported ${addedCount} records from Excel`);
                applyFilters();
                alert(`Successfully imported ${addedCount} records!`);
            } else {
                alert("No valid records found to import. Ensure 'bodyName' or 'Organization' exists.");
            }
        } catch (err) {
            console.error(err);
            alert("Error reading Excel file. Ensure it is a valid format.");
        }
        document.getElementById('importExcelInput').value = '';
    };
    reader.readAsArrayBuffer(file);
});

checkAuth();
