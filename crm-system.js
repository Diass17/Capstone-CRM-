// Data storage
let contacts = [];
let tasks = [];
let deals = [];
let currentContactId = 1;
let currentTaskId = 1;
let currentDealId = 1;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDashboard();
    updateContactsDisplay();
    updateTasksDisplay();
    updateDealsDisplay();
    updateAnalytics();
    populateContactSelects();
    
    // Load dark mode preference
    if (localStorage.getItem('crmDarkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// Tab management
function showTab(event, tabName) {
    // Hide all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Update displays when switching to certain tabs
    if (tabName === 'contacts') {
        updateContactsDisplay();
    } else if (tabName === 'tasks') {
        updateTasksDisplay();
    } else if (tabName === 'deals') {
        updateDealsDisplay();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Contact management
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const contact = {
        id: currentContactId++,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        company: document.getElementById('company').value,
        position: document.getElementById('position').value,
        status: document.getElementById('status').value,
        source: document.getElementById('source').value,
        tags: document.getElementById('tags').value,
        notes: document.getElementById('notes').value,
        dateAdded: new Date().toISOString(),
        lastInteraction: new Date().toISOString()
    };
    
    contacts.push(contact);
    saveData();
    updateDashboard();
    updateContactsDisplay();
    populateContactSelects();
    
    // Reset form and show success message
    this.reset();
    showNotification('Contact added successfully!', 'success');
    
    // Switch to contacts tab
    showTab({ target: document.querySelector('.nav-tab[onclick*="contacts"]') }, 'contacts');
});

// Task management
document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const task = {
        id: currentTaskId++,
        title: document.getElementById('task-title').value,
        contactId: document.getElementById('task-contact').value,
        dealId: document.getElementById('task-deal').value,
        type: document.getElementById('task-type').value,
        priority: document.getElementById('task-priority').value,
        dueDate: document.getElementById('task-due').value,
        description: document.getElementById('task-description').value,
        completed: false,
        dateCreated: new Date().toISOString()
    };
    
    tasks.push(task);
    saveData();
    updateDashboard();
    updateTasksDisplay();
    
    // Reset form and show success message
    this.reset();
    showNotification('Task added successfully!', 'success');
});

// Deal management
document.getElementById('deal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const deal = {
        id: currentDealId++,
        title: document.getElementById('deal-title').value,
        contactId: document.getElementById('deal-contact').value,
        value: parseFloat(document.getElementById('deal-value').value) || 0,
        stage: document.getElementById('deal-stage').value,
        probability: parseInt(document.getElementById('deal-probability').value) || 50,
        closeDate: document.getElementById('deal-close-date').value,
        description: document.getElementById('deal-description').value,
        dateCreated: new Date().toISOString()
    };
    
    deals.push(deal);
    saveData();
    updateDashboard();
    updateDealsDisplay();
    
    // Reset form and show success message
    this.reset();
    showNotification('Deal created successfully!', 'success');
});

// Data persistence
function saveData() {
    try {
        localStorage.setItem('crmContacts', JSON.stringify(contacts));
        localStorage.setItem('crmTasks', JSON.stringify(tasks));
        localStorage.setItem('crmDeals', JSON.stringify(deals));
        localStorage.setItem('crmContactId', currentContactId.toString());
        localStorage.setItem('crmTaskId', currentTaskId.toString());
        localStorage.setItem('crmDealId', currentDealId.toString());
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Error saving data. Storage may be full.', 'error');
    }
}

function loadData() {
    try {
        contacts = JSON.parse(localStorage.getItem('crmContacts') || '[]');
        tasks = JSON.parse(localStorage.getItem('crmTasks') || '[]');
        deals = JSON.parse(localStorage.getItem('crmDeals') || '[]');
        currentContactId = parseInt(localStorage.getItem('crmContactId') || '1');
        currentTaskId = parseInt(localStorage.getItem('crmTaskId') || '1');
        currentDealId = parseInt(localStorage.getItem('crmDealId') || '1');
    } catch (error) {
        console.error('Error loading data:', error);
        contacts = [];
        tasks = [];
        deals = [];
        currentContactId = 1;
        currentTaskId = 1;
        currentDealId = 1;
    }
}

// Dashboard updates
function updateDashboard() {
    document.getElementById('total-contacts').textContent = contacts.length;
    document.getElementById('total-leads').textContent = contacts.filter(c => c.status === 'lead').length;
    document.getElementById('total-customers').textContent = contacts.filter(c => c.status === 'customer').length;
    document.getElementById('total-tasks').textContent = tasks.filter(t => !t.completed).length;
    document.getElementById('total-deals').textContent = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length;
    
    const totalValue = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
        .reduce((sum, deal) => sum + deal.value, 0);
    document.getElementById('total-deal-value').textContent = '$' + totalValue.toLocaleString();
    
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    const recentItems = [];
    
    // Recent contacts
    const recentContacts = contacts.slice(-3).reverse();
    recentContacts.forEach(contact => {
        recentItems.push({
            type: 'contact',
            text: `New contact added: ${contact.firstName} ${contact.lastName}`,
            date: contact.dateAdded
        });
    });
    
    // Recent tasks
    const recentTasks = tasks.slice(-3).reverse();
    recentTasks.forEach(task => {
        recentItems.push({
            type: 'task',
            text: `Task created: ${task.title}`,
            date: task.dateCreated
        });
    });
    
    // Recent deals
    const recentDeals = deals.slice(-3).reverse();
    recentDeals.forEach(deal => {
        recentItems.push({
            type: 'deal',
            text: `Deal created: ${deal.title}`,
            date: deal.dateCreated
        });
    });
    
    // Sort by date and take top 5
    recentItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topItems = recentItems.slice(0, 5);
    
    if (topItems.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <h3>No recent activity</h3>
                <p>Start by adding some contacts or creating tasks!</p>
            </div>
        `;
        return;
    }
    
    activityContainer.innerHTML = topItems.map(item => `
        <div class="task-item">
            <div class="task-content">
                <div class="task-title">${item.text}</div>
                <div class="task-meta">${new Date(item.date).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

// Contact display and filtering
function updateContactsDisplay() {
    const grid = document.getElementById('contacts-grid');
    let displayContacts = [...contacts];
    
    // Apply filters
    const searchTerm = document.getElementById('search-contacts')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    
    if (searchTerm) {
        displayContacts = displayContacts.filter(contact => 
            contact.firstName.toLowerCase().includes(searchTerm) ||
            contact.lastName.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm) ||
            (contact.company && contact.company.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter) {
        displayContacts = displayContacts.filter(contact => contact.status === statusFilter);
    }
    
    if (displayContacts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No contacts found</h3>
                <p>Try adjusting your search or filters</p>
                <button class="btn" onclick="showTab(event, 'add-contact')">Add Contact</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = displayContacts.map(contact => `
        <div class="contact-card">
            <h4>${contact.firstName} ${contact.lastName}</h4>
            <div class="contact-info"><strong>Email:</strong> ${contact.email}</div>
            <div class="contact-info"><strong>Phone:</strong> ${contact.phone || 'N/A'}</div>
            <div class="contact-info"><strong>Company:</strong> ${contact.company || 'N/A'}</div>
            <div class="contact-info"><strong>Position:</strong> ${contact.position || 'N/A'}</div>
            <div class="contact-info"><strong>Status:</strong> <span style="text-transform: capitalize">${contact.status}</span></div>
            ${contact.tags ? `<div class="contact-info"><strong>Tags:</strong> ${contact.tags}</div>` : ''}
            ${contact.notes ? `<div class="contact-info"><strong>Notes:</strong> ${contact.notes}</div>` : ''}
            <div class="contact-actions">
                <button class="btn btn-secondary" onclick="editContact(${contact.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteContact(${contact.id})">Delete</button>
                <button class="btn btn-success" onclick="createTaskForContact(${contact.id})">Add Task</button>
            </div>
        </div>
    `).join('');
}

function filterContacts() {
    updateContactsDisplay();
}

function sortContacts() {
    const sortBy = document.getElementById('sort-contacts').value;
    
    switch(sortBy) {
        case 'name':
            contacts.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
            break;
        case 'company':
            contacts.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
            break;
        case 'date':
            contacts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'status':
            contacts.sort((a, b) => a.status.localeCompare(b.status));
            break;
    }
    
    updateContactsDisplay();
}

// Task display and filtering
function updateTasksDisplay() {
    const tasksList = document.getElementById('tasks-list');
    let displayTasks = [...tasks];
    
    // Apply filters
    const filter = document.getElementById('task-filter')?.value || 'all';
    const today = new Date().toDateString();
    
    switch(filter) {
        case 'pending':
            displayTasks = displayTasks.filter(task => !task.completed);
            break;
        case 'completed':
            displayTasks = displayTasks.filter(task => task.completed);
            break;
        case 'overdue':
            displayTasks = displayTasks.filter(task => 
                !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
            );
            break;
        case 'today':
            displayTasks = displayTasks.filter(task => 
                task.dueDate && new Date(task.dueDate).toDateString() === today
            );
            break;
    }
    
    if (displayTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Create your first task to stay organized!</p>
            </div>
        `;
        return;
    }
    
    // Sort by due date and priority
    displayTasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
    });
    
    tasksList.innerHTML = displayTasks.map(task => {
        const contact = contacts.find(c => c.id == task.contactId);
        const deal = deals.find(d => d.id == task.dealId);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        return `
            <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${task.type.charAt(0).toUpperCase() + task.type.slice(1)} • 
                        Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        ${task.dueDate ? ` • Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                        ${contact ? ` • Contact: ${contact.firstName} ${contact.lastName}` : ''}
                        ${deal ? ` • Deal: ${deal.title}` : ''}
                    </div>
                    ${task.description ? `<div style="margin-top: 5px; font-size: 0.9em;">${task.description}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn ${task.completed ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleTask(${task.id})">
                        ${task.completed ? 'Reopen' : 'Complete'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterTasks() {
    updateTasksDisplay();
}

// Deal display
function updateDealsDisplay() {
    const dealsList = document.getElementById('deals-list');
    
    if (deals.length === 0) {
        dealsList.innerHTML = `
            <div class="empty-state">
                <h3>No deals yet</h3>
                <p>Create your first deal to track your sales pipeline!</p>
            </div>
        `;
        return;
    }
    
    // Sort by stage and date
    const sortedDeals = [...deals].sort((a, b) => {
        const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
        return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    });
    
    dealsList.innerHTML = sortedDeals.map(deal => {
        const contact = contacts.find(c => c.id == deal.contactId);
        
        return `
            <div class="deal-card">
                <div class="deal-stage stage-${deal.stage}">${deal.stage.replace('-', ' ').toUpperCase()}</div>
                <h4>${deal.title}</h4>
                <div style="margin-bottom: 10px;">
                    <strong>Value:</strong> $${deal.value.toLocaleString()} • 
                    <strong>Probability:</strong> ${deal.probability}%
                </div>
                ${contact ? `<div><strong>Contact:</strong> ${contact.firstName} ${contact.lastName}</div>` : ''}
                ${deal.closeDate ? `<div><strong>Expected Close:</strong> ${new Date(deal.closeDate).toLocaleDateString()}</div>` : ''}
                ${deal.description ? `<div style="margin-top: 10px;">${deal.description}</div>` : ''}
                <div style="margin-top: 15px;">
                    <button class="btn btn-secondary" onclick="editDeal(${deal.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDeal(${deal.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Analytics
function updateAnalytics() {
    // Conversion rate
    const leads = contacts.filter(c => c.status === 'lead').length;
    const customers = contacts.filter(c => c.status === 'customer').length;
    const conversionRate = leads > 0 ? ((customers / (leads + customers)) * 100).toFixed(1) : 0;
    document.getElementById('conversion-rate').textContent = conversionRate + '%';
    
    // Average deal value
    const avgDealValue = deals.length > 0 ? 
        deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0;
    document.getElementById('avg-deal-value').textContent = '$' + Math.round(avgDealValue).toLocaleString();
    
    // Tasks completion rate
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskCompletionRate = tasks.length > 0 ? 
        ((completedTasks / tasks.length) * 100).toFixed(1) : 0;
    document.getElementById('tasks-completed').textContent = taskCompletionRate + '%';
    
    // Deal win rate
    const closedDeals = deals.filter(d => ['closed-won', 'closed-lost'].includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'closed-won').length;
    const winRate = closedDeals.length > 0 ? 
        ((wonDeals / closedDeals.length) * 100).toFixed(1) : 0;
    document.getElementById('deals-won').textContent = winRate + '%';
}

// Utility functions
function populateContactSelects() {
    const taskContactSelect = document.getElementById('task-contact');
    const dealContactSelect = document.getElementById('deal-contact');
    
    if (taskContactSelect) {
        taskContactSelect.innerHTML = '<option value="">Select Contact</option>' +
            contacts.map(contact => 
                `<option value="${contact.id}">${contact.firstName} ${contact.lastName}</option>`
            ).join('');
    }
    
    if (dealContactSelect) {
        dealContactSelect.innerHTML = '<option value="">Select Contact</option>' +
            contacts.map(contact => 
                `<option value="${contact.id}">${contact.firstName} ${contact.lastName}</option>`
            ).join('');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Action functions
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    
    // Pre-fill form with contact data
    document.getElementById('firstName').value = contact.firstName;
    document.getElementById('lastName').value = contact.lastName;
    document.getElementById('email').value = contact.email;
    document.getElementById('phone').value = contact.phone || '';
    document.getElementById('linkedin').value = contact.linkedin || '';
    document.getElementById('company').value = contact.company || '';
    document.getElementById('position').value = contact.position || '';
    document.getElementById('status').value = contact.status;
    document.getElementById('source').value = contact.source || '';
    document.getElementById('tags').value = contact.tags || '';
    document.getElementById('notes').value = contact.notes || '';
    
    // Remove the contact from array (will be re-added when form is submitted)
    contacts = contacts.filter(c => c.id !== id);
    saveData();
    
    // Switch to add contact tab
    showTab({ target: document.querySelector('.nav-tab[onclick*="add-contact"]') }, 'add-contact');
    showNotification('Contact loaded for editing', 'success');
}

function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts = contacts.filter(c => c.id !== id);
        saveData();
        updateDashboard();
        updateContactsDisplay();
        populateContactSelects();
        showNotification('Contact deleted successfully', 'success');
    }
}

function createTaskForContact(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    // Pre-select the contact in task form
    showTab({ target: document.querySelector('.nav-tab[onclick*="tasks"]') }, 'tasks');
    setTimeout(() => {
        document.getElementById('task-contact').value = contactId;
        document.getElementById('task-title').value = `Follow up with ${contact.firstName} ${contact.lastName}`;
    }, 100);
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        updateDashboard();
        updateTasksDisplay();
        showNotification(task.completed ? 'Task completed!' : 'Task reopened!', 'success');
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveData();
        updateDashboard();
        updateTasksDisplay();
        showNotification('Task deleted successfully', 'success');
    }
}

function editDeal(id) {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    
    // Pre-fill form with deal data
    document.getElementById('deal-title').value = deal.title;
    document.getElementById('deal-contact').value = deal.contactId;
    document.getElementById('deal-value').value = deal.value;
    document.getElementById('deal-stage').value = deal.stage;
    document.getElementById('deal-probability').value = deal.probability;
    document.getElementById('deal-close-date').value = deal.closeDate || '';
    document.getElementById('deal-description').value = deal.description || '';
    
    // Remove the deal from array (will be re-added when form is submitted)
    deals = deals.filter(d => d.id !== id);
    saveData();
    
    showNotification('Deal loaded for editing', 'success');
}

function deleteDeal(id) {
    if (confirm('Are you sure you want to delete this deal?')) {
        deals = deals.filter(d => d.id !== id);
        saveData();
        updateDashboard();
        updateDealsDisplay();
        showNotification('Deal deleted successfully', 'success');
    }
}

function exportContacts() {
    if (contacts.length === 0) {
        showNotification('No contacts to export', 'error');
        return;
    }
    
    const csvContent = [
        ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Source', 'Tags', 'Notes', 'Date Added'],
        ...contacts.map(contact => [
            contact.firstName,
            contact.lastName,
            contact.email,
            contact.phone || '',
            contact.company || '',
            contact.position || '',
            contact.status,
            contact.source || '',
            contact.tags || '',
            contact.notes || '',
            new Date(contact.dateAdded).toLocaleDateString()
        ])
    ].map(row => row.join(',')).join('\n');
    
    downloadCSV(csvContent, 'contacts.csv');
    showNotification('Contacts exported successfully!', 'success');
}

function exportData() {
    const data = {
        contacts,
        tasks,
        deals,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully!', 'success');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('crmDarkMode', isDark);
    showNotification(`${isDark ? 'Dark' : 'Light'} mode enabled!`, 'success');
}
