let addMap, addMarker, editMap, editMarker;

// --- UTILS ---

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInToast 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function logActivity(action, details) {
    let logs = JSON.parse(localStorage.getItem('getafe_admin_log')) || [];
    const now = new Date();
    logs.unshift({
        id: Date.now(),
        action: action,
        details: details,
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' - ' + now.toLocaleDateString()
    });
    // Keep only last 50 logs
    if(logs.length > 50) logs = logs.slice(0, 50);
    localStorage.setItem('getafe_admin_log', JSON.stringify(logs));
}

function compressImage(file, callback, maxWidth = 1200, quality = 0.72) {
    const reader = new FileReader();
    reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
}

// --- RENDER ---

function renderAdmin() {
    const inquiriesGrid = document.getElementById('inquiries-grid');
    const pendingGrid = document.getElementById('pending-grid');
    const approvedGrid = document.getElementById('approved-grid');
    
    const inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
    const communityPlaces = JSON.parse(localStorage.getItem('getafe_community_places')) || [];
    const allPlaces = JSON.parse(localStorage.getItem('getafe_all_places')) || [];
    const logs = JSON.parse(localStorage.getItem('getafe_admin_log')) || [];

    // Pending vs Approved
    const pending = communityPlaces.filter(p => p.status === 'pending');
    const approved = allPlaces.filter(p => p.status === 'approved');
    const unreadMsgs = inquiries.filter(i => !i.isRead).length;

    // Badges
    const badgePending = document.getElementById('badge-pending');
    if(pending.length > 0) { badgePending.style.display = 'inline-block'; badgePending.innerText = pending.length; } else badgePending.style.display = 'none';
    
    const badgeMsgs = document.getElementById('badge-messages');
    if(unreadMsgs > 0) { badgeMsgs.style.display = 'inline-block'; badgeMsgs.innerText = unreadMsgs; } else badgeMsgs.style.display = 'none';

    // Stats
    document.getElementById('stat-messages').innerText = inquiries.length;
    document.getElementById('stat-approved').innerText = approved.length;
    document.getElementById('stat-pending').innerText = pending.length;
    document.getElementById('stat-unread').innerText = unreadMsgs;

    // Overview Stats
    document.getElementById('overview-official').innerHTML = `Official Places: <strong>${allPlaces.filter(p => p.isOfficial).length}</strong>`;
    document.getElementById('overview-community').innerHTML = `Community Approved: <strong>${allPlaces.filter(p => !p.isOfficial).length}</strong>`;
    
    const cats = new Set(approved.map(p => p.category));
    document.getElementById('overview-categories').innerHTML = `Categories Active: <strong>${cats.size}</strong>`;
    
    document.getElementById('overview-total-msgs').innerHTML = `Total Inquiries: <strong>${inquiries.length}</strong>`;
    document.getElementById('overview-unread-msgs').innerHTML = `Unread: <strong style="color:#eab308;">${unreadMsgs}</strong>`;
    document.getElementById('overview-pending-sub').innerHTML = `Pending Submissions: <strong style="color:#f87171;">${pending.length}</strong>`;

    // Render Inquiries
    inquiriesGrid.innerHTML = inquiries.length ? inquiries.map(inq => `
        <div class="inq-card ${inq.isRead ? 'read' : ''}" id="msg-${inq.id}">
            <div class="inq-header">
                <div>
                    <span class="inq-badge ${inq.isRead ? 'badge-read' : 'badge-unread'}">${inq.isRead ? 'Read' : 'New'}</span>
                    <h4 style="margin:0.5rem 0 0.2rem 0; color:var(--text-main); font-size:1.1rem;">${inq.interest}</h4>
                    <p style="font-size:0.8rem; margin:0;">From: <strong>${inq.name}</strong> (${inq.email})</p>
                </div>
                <div class="inq-actions">
                    ${!inq.isRead ? `<button onclick="markRead(${inq.id})" class="btn-sm btn-export">Mark Read</button>` : ''}
                    <button onclick="toggleReply(${inq.id})" class="btn-sm btn-log">Reply</button>
                    <button onclick="deleteInquiry(${inq.id})" class="btn-sm btn-danger">Delete</button>
                </div>
            </div>
            <p style="margin-top:0.5rem; background:rgba(0,0,0,0.1); padding:1rem; border-radius:8px;">${inq.message}</p>
            <p style="font-size: 0.75rem; opacity: 0.5; margin-top:0.5rem;">${inq.date}</p>
            
            <div id="reply-box-${inq.id}" class="inq-reply-box">
                <textarea rows="3" placeholder="Type your reply here..."></textarea>
                <button onclick="sendReply(${inq.id})" class="reply-send-btn">Send Email Reply</button>
            </div>
        </div>
    `).join('') : '<p style="opacity: 0.5;">No messages yet.</p>';

    // Render Pending
    pendingGrid.innerHTML = pending.length ? pending.map(p => `
        <div class="data-card">
            <img src="${p.image}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
            <h4 style="color:var(--text-main);">${p.title}</h4>
            <p style="font-size:0.85rem; color:var(--primary);">${p.category}</p>
            <p style="font-size:0.9rem;">${p.description}</p>
            <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
                <button onclick="updatePlaceStatus(${p.id}, 'approved')" class="btn-sm btn-export" style="flex:1;">Approve</button>
                <button onclick="deletePlace(${p.id})" class="btn-sm btn-danger" style="flex:1;">Reject</button>
            </div>
        </div>
    `).join('') : '<p style="opacity: 0.5;">No pending submissions.</p>';

    // Render Log
    const logList = document.getElementById('log-list');
    if(logList) {
        logList.innerHTML = logs.length ? logs.map(l => `
            <div class="log-entry">
                <div class="log-icon">${l.action.includes('Approve') ? '✅' : l.action.includes('Delete') || l.action.includes('Reject') || l.action.includes('Remove') ? '❌' : l.action.includes('Add') ? '➕' : l.action.includes('Edit') ? '✏️' : l.action.includes('Clear') ? '🧹' : l.action.includes('Import') ? '⬆️' : '🔔'}</div>
                <div>
                    <strong style="font-size:0.95rem;">${l.action}</strong>
                    <div style="font-size:0.85rem; opacity:0.7; margin-top:2px;">${l.details}</div>
                    <div class="log-time">${l.time}</div>
                </div>
            </div>
        `).join('') : '<div class="log-empty">No activities logged yet.</div>';
    }

    // Render Live Places
    filterActivePlaces();
}

window.filterActivePlaces = () => {
    const q = (document.getElementById('search-active')?.value || '').toLowerCase();
    const allPlaces = JSON.parse(localStorage.getItem('getafe_all_places')) || [];
    const approved = allPlaces.filter(p => p.status === 'approved' && p.title.toLowerCase().includes(q));
    
    const approvedGrid = document.getElementById('approved-grid');
    if(!approvedGrid) return;
    
    approvedGrid.innerHTML = approved.length ? approved.map(p => `
        <div class="data-card">
            <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap:wrap;">
                <img src="${p.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink:0;">
                <div style="flex: 1; min-width:200px;">
                    <h4 style="margin:0; color:var(--text-main); font-size:1.1rem;">${p.title} ${p.isOfficial ? '<span style="font-size: 0.6rem; background: var(--primary); color: #000; padding: 2px 5px; border-radius: 4px; margin-left: 5px; vertical-align:middle;">OFFICIAL</span>' : '<span style="font-size: 0.6rem; background: var(--glass-border); color: var(--text-muted); padding: 2px 5px; border-radius: 4px; margin-left: 5px; vertical-align:middle;">COMMUNITY</span>'}</h4>
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-top:4px;">${p.category}</p>
                </div>
                <div style="display: flex; gap: 5px; flex-shrink:0;">
                    <button onclick="openEditModal(${p.id}, true)" class="btn-sm btn-import">Edit</button>
                    <button onclick="deleteActivePlace(${p.id})" class="btn-sm btn-danger">Remove</button>
                </div>
            </div>
        </div>
    `).join('') : '<p style="opacity: 0.5;">No active destinations found.</p>';
};


// --- TABS & NAVIGATION ---

window.switchTab = (tabId) => {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    const selected = document.getElementById(`section-${tabId}`);
    if(selected) selected.style.display = 'block';
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const t = document.getElementById(`tab-${tabId}`);
    if(t) t.classList.add('active');
    
    if (tabId === 'add') {
        setTimeout(initAddMap, 100);
    }
};

function initAddMap() {
    if (addMap) {
        addMap.invalidateSize();
        return;
    }
    const mapEl = document.getElementById('add-picker-map');
    if(!mapEl) return;
    
    addMap = L.map('add-picker-map').setView([10.15, 124.13], 13);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(addMap);
    
    addMarker = L.marker([10.15, 124.13], { draggable: true }).addTo(addMap);
    
    addMap.on('click', (e) => {
        addMarker.setLatLng(e.latlng);
        document.getElementById('adm-lat').value = e.latlng.lat;
        document.getElementById('adm-lng').value = e.latlng.lng;
    });
    
    addMarker.on('dragend', () => {
        const pos = addMarker.getLatLng();
        document.getElementById('adm-lat').value = pos.lat;
        document.getElementById('adm-lng').value = pos.lng;
    });
}

// --- DATA MANAGEMENT ---

window.updatePlaceStatus = (id, status) => {
    let communityPlaces = JSON.parse(localStorage.getItem('getafe_community_places')) || [];
    let allPlaces = JSON.parse(localStorage.getItem('getafe_all_places')) || [];
    
    const index = communityPlaces.findIndex(p => p.id === id);
    if (index !== -1) {
        communityPlaces[index].status = status;
        const placeName = communityPlaces[index].title;
        
        if (status === 'approved') {
            if (!allPlaces.find(p => p.id === id)) {
                allPlaces.push({...communityPlaces[index], status: 'approved'});
            }
            logActivity('Approved Place', `Approved community submission: ${placeName}`);
            showToast(`Approved "${placeName}"`);
        } else {
            logActivity('Updated Place Status', `Set ${placeName} to ${status}`);
        }
        
        localStorage.setItem('getafe_community_places', JSON.stringify(communityPlaces));
        localStorage.setItem('getafe_all_places', JSON.stringify(allPlaces));
        renderAdmin();
    }
};

window.deleteActivePlace = (id) => {
    if (!confirm('Are you sure you want to remove this destination from the website?')) return;
    let allPlaces = JSON.parse(localStorage.getItem('getafe_all_places')) || [];
    const place = allPlaces.find(p => String(p.id) === String(id));
    
    allPlaces = allPlaces.filter(p => String(p.id) !== String(id));
    localStorage.setItem('getafe_all_places', JSON.stringify(allPlaces));
    
    if(place) {
        logActivity('Removed Active Place', `Removed ${place.title} from live website`);
        showToast(`Removed "${place.title}"`, 'error');
    }
    
    // Check if it's a community place and remove it there too if needed
    let communityPlaces = JSON.parse(localStorage.getItem('getafe_community_places')) || [];
    communityPlaces = communityPlaces.filter(p => String(p.id) !== String(id));
    localStorage.setItem('getafe_community_places', JSON.stringify(communityPlaces));
    
    renderAdmin();
};

window.deletePlace = (id) => {
    if (!confirm('Are you sure you want to reject/delete this submission?')) return;
    let communityPlaces = JSON.parse(localStorage.getItem('getafe_community_places')) || [];
    const place = communityPlaces.find(p => String(p.id) === String(id));
    
    communityPlaces = communityPlaces.filter(p => String(p.id) !== String(id));
    localStorage.setItem('getafe_community_places', JSON.stringify(communityPlaces));
    
    if(place) {
        logActivity('Rejected Submission', `Rejected community submission: ${place.title}`);
        showToast(`Rejected "${place.title}"`, 'error');
    }
    renderAdmin();
};

window.deleteInquiry = (id) => {
    if (!confirm('Delete this message?')) return;
    let inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
    const inq = inquiries.find(i => i.id === id);
    inquiries = inquiries.filter(i => i.id !== id);
    localStorage.setItem('getafe_inquiries', JSON.stringify(inquiries));
    
    if(inq) logActivity('Deleted Message', `Deleted message from ${inq.name}`);
    showToast('Message deleted');
    renderAdmin();
};

window.deleteReadMessages = () => {
    let inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
    const beforeCount = inquiries.length;
    inquiries = inquiries.filter(i => !i.isRead);
    
    if (inquiries.length === beforeCount) {
        showToast('No read messages to delete.', 'error');
        return;
    }

    if(!confirm('Are you sure you want to delete all READ messages? Unread messages will be kept.')) return;
    
    localStorage.setItem('getafe_inquiries', JSON.stringify(inquiries));
    logActivity('Cleared Read Messages', `Deleted ${beforeCount - inquiries.length} read messages`);
    showToast(`Deleted ${beforeCount - inquiries.length} read messages`);
    renderAdmin();
}

window.markRead = (id) => {
    let inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
    const index = inquiries.findIndex(i => i.id === id);
    if(index !== -1) {
        inquiries[index].isRead = true;
        localStorage.setItem('getafe_inquiries', JSON.stringify(inquiries));
        renderAdmin();
    }
};

window.markAllRead = () => {
    let inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
    let count = 0;
    inquiries.forEach(i => { if(!i.isRead) { i.isRead = true; count++; } });
    if(count > 0) {
        localStorage.setItem('getafe_inquiries', JSON.stringify(inquiries));
        logActivity('Marked Messages Read', `Marked ${count} messages as read`);
        showToast(`Marked ${count} messages as read`);
        renderAdmin();
    } else {
        showToast('No unread messages');
    }
};

window.toggleReply = (id) => {
    const box = document.getElementById(`reply-box-${id}`);
    if(box) box.style.display = box.style.display === 'block' ? 'none' : 'block';
};

window.sendReply = (id) => {
    const box = document.getElementById(`reply-box-${id}`);
    const textarea = box.querySelector('textarea');
    if(!textarea.value.trim()) {
        alert('Please enter a reply message.');
        return;
    }
    
    // Simulate sending email
    showToast('Reply sent successfully via email interface!');
    textarea.value = '';
    box.style.display = 'none';
    markRead(id); // auto mark read
    
    let inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
    const inq = inquiries.find(i => i.id === id);
    if(inq) logActivity('Replied to Message', `Sent reply to ${inq.name}`);
};

window.clearLog = () => {
    if(confirm('Clear activity log?')) {
        localStorage.removeItem('getafe_admin_log');
        renderAdmin();
        showToast('Activity log cleared');
    }
}

// clearData removed for safety

// --- IMPORT / EXPORT ---

window.exportData = () => {
    const data = {
        allPlaces: JSON.parse(localStorage.getItem('getafe_all_places')) || [],
        communityPlaces: JSON.parse(localStorage.getItem('getafe_community_places')) || []
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `getafe_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    logActivity('Exported Data', 'Exported places database backup');
    showToast('Backup exported successfully');
};

window.importData = (event) => {
    const file = event.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if(data.allPlaces) localStorage.setItem('getafe_all_places', JSON.stringify(data.allPlaces));
            if(data.communityPlaces) localStorage.setItem('getafe_community_places', JSON.stringify(data.communityPlaces));
            
            logActivity('Imported Data', `Restored backup: ${file.name}`);
            showToast('Database restored successfully');
            renderAdmin();
        } catch(err) {
            alert('Invalid backup file');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // reset
};


// --- EDIT MODAL ---

window.openEditModal = (id, isActive = false) => {
    let source = isActive ? 'getafe_all_places' : 'getafe_community_places';
    const places = JSON.parse(localStorage.getItem(source)) || [];
    const place = places.find(p => String(p.id) === String(id));
    if (place) {
        document.getElementById('edit-id').value = place.id;
        document.getElementById('edit-title').value = place.title;
        document.getElementById('edit-category').value = place.category;
        document.getElementById('edit-description').value = place.description;
        document.getElementById('edit-history').value = place.history || "";
        
        document.getElementById('edit-phone').value = place.phone || "";
        document.getElementById('edit-email').value = place.email || "";
        document.getElementById('edit-essentials').value = (place.famous || []).join(', ');
        document.getElementById('edit-bestTime').value = place.bestTime || "";

        // Map setup
        const coords = place.coords || [10.15, 124.13];
        document.getElementById('edit-lat').value = coords[0];
        document.getElementById('edit-lng').value = coords[1];

        document.getElementById('edit-modal').setAttribute('data-source', source);
        document.getElementById('edit-modal').style.display = 'flex';

        // Init Edit Map after modal shows
        setTimeout(() => {
            if (!editMap) {
                editMap = L.map('edit-picker-map').setView(coords, 14);
                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(editMap);
                editMarker = L.marker(coords, { draggable: true }).addTo(editMap);
                
                editMap.on('click', (e) => {
                    editMarker.setLatLng(e.latlng);
                    document.getElementById('edit-lat').value = e.latlng.lat;
                    document.getElementById('edit-lng').value = e.latlng.lng;
                });
                editMarker.on('dragend', () => {
                    const pos = editMarker.getLatLng();
                    document.getElementById('edit-lat').value = pos.lat;
                    document.getElementById('edit-lng').value = pos.lng;
                });
            } else {
                editMap.invalidateSize();
                editMap.setView(coords, 14);
                editMarker.setLatLng(coords);
            }
        }, 300);
    }
};

window.closeEditModal = () => {
    document.getElementById('edit-modal').style.display = 'none';
};

// --- AUTH & SETTINGS ---

window.checkAdminPass = () => {
    const passInput = document.getElementById('admin-pass-input');
    const errorMsg = document.getElementById('login-error');
    
    // Get custom pass or default
    const expectedPass = sessionStorage.getItem('admin_custom_pass') || 'admin123';
    
    if (passInput.value === expectedPass) {
        sessionStorage.setItem('admin_auth', 'true');
        document.getElementById('admin-login-overlay').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        
        logActivity('Admin Login', 'Administrator signed in');
        renderAdmin();
    } else {
        errorMsg.style.display = 'block';
        passInput.value = '';
    }
};

window.adminLogout = () => {
    sessionStorage.removeItem('admin_auth');
    document.getElementById('admin-content').style.display = 'none';
    document.getElementById('admin-login-overlay').style.display = 'flex';
    document.getElementById('admin-pass-input').value = '';
    logActivity('Admin Logout', 'Administrator signed out');
};

window.changePassword = () => {
    const oldPass = document.getElementById('settings-old-pass').value;
    const newPass = document.getElementById('settings-new-pass').value;
    const confirmPass = document.getElementById('settings-confirm-pass').value;
    const msg = document.getElementById('settings-msg');
    
    const expectedPass = sessionStorage.getItem('admin_custom_pass') || 'admin123';
    
    if(oldPass !== expectedPass) {
        msg.innerText = 'Current password incorrect';
        msg.style.color = '#ef4444';
        return;
    }
    if(newPass.length < 5) {
        msg.innerText = 'New password must be at least 5 characters';
        msg.style.color = '#ef4444';
        return;
    }
    if(newPass !== confirmPass) {
        msg.innerText = 'New passwords do not match';
        msg.style.color = '#ef4444';
        return;
    }
    
    sessionStorage.setItem('admin_custom_pass', newPass);
    
    document.getElementById('settings-old-pass').value = '';
    document.getElementById('settings-new-pass').value = '';
    document.getElementById('settings-confirm-pass').value = '';
    
    msg.innerText = 'Password updated for this session!';
    msg.style.color = 'var(--primary)';
    
    logActivity('Security', 'Admin password changed');
    showToast('Password updated');
}


window.calculateStorage = () => {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        totalBytes += localStorage.getItem(key).length;
    }
    // Convert to MB (using roughly 5MB as standard limit)
    let totalMB = (totalBytes / 1024 / 1024).toFixed(2);
    let limitMB = 5.0; // Most browsers give 5MB
    let percentage = Math.min((totalMB / limitMB) * 100, 100).toFixed(1);
    
    const usageText = document.getElementById('storage-usage-text');
    const progressBar = document.getElementById('storage-progress');
    
    if (usageText && progressBar) {
        usageText.innerText = `${totalMB}MB / ~${limitMB}MB (${percentage}%)`;
        progressBar.style.width = `${percentage}%`;
        
        if (percentage > 90) {
            progressBar.style.background = '#ef4444'; // Red
            usageText.style.color = '#ef4444';
        } else if (percentage > 70) {
            progressBar.style.background = '#eab308'; // Yellow
            usageText.style.color = '#eab308';
        } else {
            progressBar.style.background = 'var(--primary)'; // Normal
            usageText.style.color = 'var(--primary)';
        }
    }
};

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (sessionStorage.getItem('admin_auth') === 'true') {
        document.getElementById('admin-login-overlay').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        renderAdmin();
        if(window.calculateStorage) window.calculateStorage();
    }

    // --- Live Clock ---
    function updateClock() {
        const clockEl = document.getElementById('live-clock');
        if (!clockEl) return;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        clockEl.innerText = `${dateStr} | ${timeStr}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
    
    // --- Image Preview for Add Form ---
    const addImgInput = document.getElementById('adm-image');
    if(addImgInput) {
        addImgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const previewContainer = document.getElementById('adm-image-preview');
                    const previewImg = document.getElementById('adm-preview-img');
                    previewImg.src = evt.target.result;
                    previewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Admin Add Place Form ---
    const adminAddForm = document.getElementById('admin-add-place');
    if (adminAddForm) {
        adminAddForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('adm-image');
            
            const doSave = (imageDataUrl) => {
                const title = document.getElementById('adm-title').value;
                const newPlace = {
                    id: Date.now(),
                    title: title,
                    category: document.getElementById('adm-category').value,
                    image: imageDataUrl,
                    description: document.getElementById('adm-description').value,
                    history: document.getElementById('adm-history').value || "No history provided.",
                    phone: document.getElementById('adm-phone').value,
                    email: document.getElementById('adm-email').value,
                    famous: document.getElementById('adm-essentials').value.split(',').map(s => s.trim()).filter(s => s),
                    bestTime: document.getElementById('adm-bestTime').value || "Always open",
                    type: "normal",
                    coords: [
                        parseFloat(document.getElementById('adm-lat').value),
                        parseFloat(document.getElementById('adm-lng').value)
                    ],
                    tags: document.getElementById('adm-tags').value.split(',').map(t => t.trim()),
                    status: "approved",
                    isOfficial: true
                };
                try {
                    let allPlaces = JSON.parse(localStorage.getItem('getafe_all_places')) || [];
                    allPlaces.push(newPlace);
                    localStorage.setItem('getafe_all_places', JSON.stringify(allPlaces));
                    adminAddForm.reset();
                    document.getElementById('adm-image-preview').style.display = 'none';
                    
                    logActivity('Added New Place', `Created official place: ${title}`);
                    showToast(`Added "${title}" to website`);
                    
                    renderAdmin();
                    switchTab('stats');
                } catch(err) {
                    alert('Storage full! Try using a smaller image.');
                }
            };

            if (fileInput.files[0]) {
                compressImage(fileInput.files[0], doSave);
            } else {
                alert('Please select an image.');
            }
        });
    }

    // --- Edit Place Form ---
    const editForm = document.getElementById('edit-place-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value; 
            const source = document.getElementById('edit-modal').getAttribute('data-source');
            const fileInput = document.getElementById('edit-image');
            
            const saveChanges = (imageData = null) => {
                let places = JSON.parse(localStorage.getItem(source)) || [];
                const index = places.findIndex(p => String(p.id) === String(id));
                
                if (index !== -1) {
                    const oldTitle = places[index].title;
                    places[index].title = document.getElementById('edit-title').value;
                    places[index].category = document.getElementById('edit-category').value;
                    places[index].description = document.getElementById('edit-description').value;
                    places[index].history = document.getElementById('edit-history').value;
                    places[index].phone = document.getElementById('edit-phone').value;
                    places[index].email = document.getElementById('edit-email').value;
                    places[index].famous = document.getElementById('edit-essentials').value.split(',').map(s => s.trim()).filter(s => s);
                    places[index].bestTime = document.getElementById('edit-bestTime').value;

                    const lat = parseFloat(document.getElementById('edit-lat').value);
                    const lng = parseFloat(document.getElementById('edit-lng').value);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        places[index].coords = [lat, lng];
                    }
                    
                    if (imageData) places[index].image = imageData;
                    
                    localStorage.setItem(source, JSON.stringify(places));

                    // Sync if needed
                    if (source === 'getafe_all_places') {
                        let community = JSON.parse(localStorage.getItem('getafe_community_places')) || [];
                        const ci = community.findIndex(p => String(p.id) === String(id));
                        if (ci !== -1) {
                            community[ci] = { ...community[ci], ...places[index] };
                            localStorage.setItem('getafe_community_places', JSON.stringify(community));
                        }
                    }

                    logActivity('Edited Place', `Updated details for ${places[index].title}`);
                    showToast('Changes saved successfully!');
                    closeEditModal();
                    renderAdmin();
                } else {
                    alert('Error: Could not find this place to update.');
                }
            };

            if (fileInput.files[0]) {
                compressImage(fileInput.files[0], (compressed) => saveChanges(compressed));
            } else {
                saveChanges();
            }
        });
    }
});
