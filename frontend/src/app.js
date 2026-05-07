// ==================== CONFIGURATION ====================
const API_BASE = 'http://localhost/TravelAI/backend/api';
let map;
let currentItinerary = null;
let locations = [];
let selectedLocation = null;
let markers = {};
let krpanoDots = [];
const krpanoSceneMarkers = [
    {
        lat: 13.77,
        lng: 109.23,
        scene: 'scene_1',
        title: 'Bình minh Gành Đá Đĩa'
    },
    {
        lat: 13.775,
        lng: 109.235,
        scene: 'scene_2',
        title: 'Gành Đá Đĩa 2'
    },
    {
        lat: 13.78,
        lng: 109.24,
        scene: 'scene_thanhpho360',
        title: 'Thành phố 360°'
    }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadLocations();
});

function initializeApp() {
    // Initialize map
    map = L.map('map').setView([13.77, 109.23], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    addKrpanoSceneDots();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', e => switchSection(e.target.closest('.nav-item').dataset.section));
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => switchTab(e.target.dataset.tab));
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', e => {
        filterLocations(e.target.value);
    });
    
    // Filters
    document.querySelectorAll('.category-filter input').forEach(checkbox => {
        checkbox.addEventListener('change', () => applyFilters());
    });
    
    // Itinerary
    document.getElementById('createItineraryBtn').addEventListener('click', () => openItineraryModal());
    document.getElementById('itineraryForm').addEventListener('submit', e => createItinerary(e));
    
    // Chat
    document.getElementById('sendChatBtn').addEventListener('click', () => sendChatMessage());
    document.getElementById('chatInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const modal = e.target.closest('.modal');
            // Remove active state; don't rely on inline display to avoid "only works once"
            modal.classList.remove('active');
            modal.style.display = '';
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.classList.remove('active');
                modal.style.display = '';
            }
        });
    });
}

// ==================== LOCATION MANAGEMENT ====================
async function loadLocations() {
    try {
        const response = await axios.get(`${API_BASE}/locations.php`);
        if (response.data.success) {
            locations = response.data.data;
            displayLocations();
            updateCategoryFilter();
            // Ensure krpano scene dots are always clickable on top of location markers.
            addKrpanoSceneDots();
        }
    } catch (error) {
        console.error('Error loading locations:', error);
        showNotification('Lỗi tải địa điểm', 'error');
    }
}

function displayLocations() {
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};
    
    locations.forEach(location => {
        const marker = L.circleMarker([location.latitude, location.longitude], {
            radius: 8,
            fillColor: getColorByCategory(location.category),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        marker.bindPopup(`
            <div class="popup-content">
                <h3>${location.name}</h3>
                <p>⭐ ${location.rating} (${location.review_count} đánh giá)</p>
                <p>${location.category}</p>
            </div>
        `);
        
        marker.on('click', () => showLocationDetails(location));
        markers[location.id] = marker;
    });
}

function getColorByCategory(category) {
    const colors = {
        'beach': '#00BFFF',
        'temple': '#FFD700',
        'mountain': '#8B7355',
        'city': '#FF6B6B'
    };
    return colors[category] || '#007AFF';
}

function updateCategoryFilter() {
    const categories = [...new Set(locations.map(l => l.category))];
    const filterContainer = document.querySelector('.category-filter');
    filterContainer.innerHTML = '';
    
    categories.forEach(cat => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
        filterContainer.appendChild(label);
        
        label.querySelector('input').addEventListener('change', () => applyFilters());
    });
}

function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter input:checked')).map(el => el.value);
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = locations.filter(loc => {
        const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(loc.category);
        const matchSearch = !searchTerm || loc.name.toLowerCase().includes(searchTerm);
        return matchCategory && matchSearch;
    });
    
    // Update markers
    Object.entries(markers).forEach(([id, marker]) => {
        const loc = locations.find(l => l.id == id);
        marker.setOpacity(filtered.includes(loc) ? 1 : 0.3);
    });
}

function filterLocations(searchTerm) {
    const filtered = locations.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    Object.entries(markers).forEach(([id, marker]) => {
        const loc = locations.find(l => l.id == id);
        marker.setOpacity(filtered.includes(loc) ? 1 : 0.3);
    });
}

// ==================== LOCATION DETAILS ====================
function showLocationDetails(location) {
    selectedLocation = location;
    
    const detailsHTML = `
        <img src="${location.image_url}" alt="${location.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
        
        <div class="detail-section">
            <h2>${location.name}</h2>
            <p style="color: var(--light-text); margin-top: 5px;">⭐ ${location.rating} <span style="font-size: 12px;">(${location.review_count} đánh giá)</span></p>
            <span class="location-card-category">${location.category}</span>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">Mô Tả</div>
            <div class="detail-value">${location.description}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">Địa Chỉ</div>
            <div class="detail-value">${location.address || 'Chưa cập nhật'}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">Số Điện Thoại</div>
            <div class="detail-value">${location.phone || 'Chưa cập nhật'}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">Giờ Mở Cửa</div>
            <div class="detail-value">${location.opening_hours || 'Chưa cập nhật'}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">Thời Gian Khuyên Nghị</div>
            <div class="detail-value">${location.duration_hours} giờ</div>
        </div>
        
        <div class="location-actions">
            <button class="btn btn-primary" onclick="viewVR360(${location.id}, '${location.name}', '${location.vr360_url}')">
                <i class="fas fa-vr-cardboard"></i> Xem 360°
            </button>
            <button class="btn btn-secondary" onclick="addToItinerary(${location.id})">
                <i class="fas fa-plus"></i> Thêm Lịch
            </button>
            <button class="btn btn-secondary" onclick="toggleFavorite(${location.id})">
                <i class="fas fa-heart"></i> Yêu Thích
            </button>
        </div>
    `;
    
    document.getElementById('locationDetails').innerHTML = detailsHTML;
    switchTab('details');
}

// ==================== VR360 VIEWER ====================
function viewVR360(locationId, locationName, vrUrl) {
    document.getElementById('vrTitle').textContent = locationName;
    const modal = document.getElementById('vr360Modal');
    // Clear inline display from previous closes
    modal.style.display = '';
    modal.classList.add('active');
    
    // Simple VR viewer using iframe
    const vrContainer = document.getElementById('vrContainer');
    vrContainer.innerHTML = `<iframe src="${vrUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
}

function openKrpanoScene(sceneName, sceneTitle) {
    const modal = document.getElementById('vr360Modal');
    const vrTitle = document.getElementById('vrTitle');
    const vrContainer = document.getElementById('vrContainer');

    if (!modal || !vrTitle || !vrContainer) return;

    vrTitle.textContent = sceneTitle || 'Trải nghiệm 360°';
    // Clear inline display from previous closes so clicking hotspots works repeatedly
    modal.style.display = '';
    modal.classList.add('active');

    const iframeUrl = `../vtour/tour.html?startscene=${encodeURIComponent(sceneName)}`;
    vrContainer.innerHTML = `<iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
}

function addKrpanoSceneDots() {
    if (!map) return;

    // Avoid duplicates if we re-add after async loading/filter changes.
    krpanoDots.forEach(dot => map.removeLayer(dot));
    krpanoDots = [];

    function pulseDot(marker) {
        // Simple 2-step pulse (fast + reliable for SVG markers)
        marker.setStyle({ fillOpacity: 1 });
        marker.setRadius(12);
        setTimeout(() => {
            marker.setStyle({ fillOpacity: 0.9 });
            marker.setRadius(8);
        }, 180);
    }

    function rippleAt(lat, lng) {
        // Ripple feedback on click
        const ripple = L.circle([lat, lng], {
            radius: 2,
            color: '#ff4757',
            weight: 2,
            fill: false,
            opacity: 0.55
        }).addTo(map);

        const start = performance.now();
        const duration = 520;

        function step(now) {
            const t = now - start;
            const progress = Math.min(1, t / duration);
            const radius = 2 + progress * 28;
            ripple.setRadius(radius);
            ripple.setStyle({ opacity: 0.55 * (1 - progress) });

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                map.removeLayer(ripple);
            }
        }

        requestAnimationFrame(step);
    }

    krpanoSceneMarkers.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 8,
            fillColor: '#ff4757',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
            zIndexOffset: 9999
        }).addTo(map);

        marker.bindTooltip(point.title, { direction: 'top', offset: [0, -8] });
        marker.on('mouseover', () => pulseDot(marker));
        marker.on('mouseout', () => {
            marker.setRadius(8);
            marker.setStyle({ fillOpacity: 0.9 });
        });
        marker.on('click', () => {
            rippleAt(point.lat, point.lng);
            openKrpanoScene(point.scene, point.title);
        });
        marker.bringToFront();
        krpanoDots.push(marker);
    });
}

// ==================== ITINERARY MANAGEMENT ====================
function openItineraryModal() {
    // Populate categories in modal
    const categories = [...new Set(locations.map(l => l.category))];
    const prioritiesDiv = document.getElementById('prioritiesCheckbox');
    prioritiesDiv.innerHTML = '';
    
    categories.forEach(cat => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
        prioritiesDiv.appendChild(label);
    });
    
    const modal = document.getElementById('itineraryModal');
    modal.style.display = '';
    modal.classList.add('active');
}

async function createItinerary(e) {
    e.preventDefault();
    
    const title = document.getElementById('itineraryTitle').value;
    const days = parseInt(document.getElementById('itineraryDays').value);
    const description = document.getElementById('itineraryDescription').value;
    
    try {
        const response = await axios.post(`${API_BASE}/itinerary.php`, {
            title,
            duration_days: days,
            description,
            user_id: 1
        });
        
        if (response.data.success) {
            currentItinerary = response.data.id;
            document.getElementById('itineraryModal').classList.remove('active');
            document.getElementById('itineraryForm').reset();
            showNotification('Lịch trình đã được tạo!', 'success');
            
            // Get AI suggestions
            const priorities = Array.from(document.querySelectorAll('#prioritiesCheckbox input:checked')).map(el => el.value);
            getAISuggestions(days, priorities);
        }
    } catch (error) {
        console.error('Error creating itinerary:', error);
        showNotification('Lỗi tạo lịch trình', 'error');
    }
}

async function addToItinerary(locationId) {
    if (!currentItinerary) {
        showNotification('Vui lòng tạo lịch trình trước', 'warning');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE}/places.php`, {
            itinerary_id: currentItinerary,
            location_id: locationId,
            day_number: 1
        });
        
        if (response.data.success) {
            showNotification('Đã thêm vào lịch trình', 'success');
        }
    } catch (error) {
        console.error('Error adding to itinerary:', error);
        showNotification('Lỗi thêm vào lịch trình', 'error');
    }
}

async function getAISuggestions(days, priorities) {
    try {
        const response = await axios.post(`${API_BASE}/chat.php`, {
            message: `Gợi ý lịch trình ${days} ngày`,
            days,
            priorities,
            user_id: 1,
            itinerary_id: currentItinerary
        });
        
        if (response.data.success) {
            addChatMessage('AI', response.data.assistant_reply);
            
            // Auto-add suggested locations to itinerary
            if (response.data.itinerary && response.data.itinerary.length > 0) {
                response.data.itinerary.forEach(day => {
                    day.places.forEach(place => {
                        addToItinerary(place.id);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
    }
}

// ==================== CHAT ====================
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    
    try {
        const response = await axios.post(`${API_BASE}/chat.php`, {
            message,
            user_id: 1,
            itinerary_id: currentItinerary
        });
        
        if (response.data.success) {
            addChatMessage('assistant', response.data.assistant_reply);
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
        addChatMessage('assistant', 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại.');
    }
}

function addChatMessage(sender, message) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    
    const avatarEl = document.createElement('div');
    avatarEl.className = `message-avatar ${sender}`;
    avatarEl.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const bubbleEl = document.createElement('div');
    bubbleEl.className = `message-bubble ${sender}`;
    bubbleEl.textContent = message;
    
    messageEl.appendChild(avatarEl);
    messageEl.appendChild(bubbleEl);
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ==================== FAVORITES ====================
function toggleFavorite(locationId) {
    const location = locations.find(l => l.id === locationId);
    if (location) {
        // Store in localStorage for simplicity
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(locationId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            showNotification('Đã xóa khỏi yêu thích', 'info');
        } else {
            favorites.push(locationId);
            showNotification('Đã thêm vào yêu thích', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteLocations = locations.filter(l => favorites.includes(l.id));
    
    const favoritesHtml = favoriteLocations.map(loc => `
        <div class="location-card">
            <img src="${loc.image_url}" alt="${loc.name}">
            <div class="location-card-content">
                <h3>${loc.name}</h3>
                <div class="location-card-rating">⭐ ${loc.rating}</div>
                <span class="location-card-category">${loc.category}</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('favoritesList').innerHTML = favoriteLocations.length > 0 
        ? favoritesHtml 
        : '<p class="empty-state">Chưa có địa điểm yêu thích</p>';
}

// ==================== NAVIGATION ====================
function switchSection(section) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    
    switch(section) {
        case 'explore':
            document.getElementById('explore-section').classList.add('active');
            break;
        case 'itinerary':
            document.getElementById('itinerary-section').classList.add('active');
            loadItineraries();
            break;
        case 'favorites':
            document.getElementById('favorites-section').classList.add('active');
            loadFavorites();
            break;
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// ==================== UTILITY ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

async function loadItineraries() {
    try {
        const response = await axios.get(`${API_BASE}/itinerary.php?user_id=1`);
        if (response.data.success) {
            const html = response.data.data.map(it => `
                <div class="location-card">
                    <div class="location-card-content">
                        <h3>${it.title}</h3>
                        <p style="color: var(--light-text); font-size: 12px;">
                            ${it.duration_days} ngày • ${it.start_date || 'Chưa xác định'}
                        </p>
                        <p style="margin-top: 10px; font-size: 13px;">${it.description || 'Không có mô tả'}</p>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('itinerariesList').innerHTML = html || '<p class="empty-state">Chưa có lịch trình nào</p>';
        }
    } catch (error) {
        console.error('Error loading itineraries:', error);
    }
}
