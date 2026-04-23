const rootPath = window.location.pathname.includes('/frontend/')
  ? window.location.pathname.split('/frontend/')[0]
  : '';
const apiBase = `${rootPath}/backend/api`;

const map = L.map('map').setView([13.782, 109.219], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap',
}).addTo(map);

const state = {
  places: [],
  markers: [],
  selectedPlace: null,
  selectedCategory: '',
  selectedRegion: '',
  routeLayer: null,
  sessionId: getSessionId(),
};

const categoryButtons = document.getElementById('categoryButtons');
const regionButtons = document.getElementById('regionButtons');
const placeCard = document.getElementById('placeCard');
const routeInfo = document.getElementById('routeInfo');
const searchInput = document.getElementById('searchInput');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const daysInput = document.getElementById('daysInput');
const sendBtn = document.getElementById('sendBtn');
const itineraryList = document.getElementById('itineraryList');
const vrModal = document.getElementById('vrModal');
const vrFrame = document.getElementById('vrFrame');
const closeVrBtn = document.getElementById('closeVrBtn');

init();

async function init() {
  await loadPlaces();
  await loadSavedItinerary();
  addMessage('ai', 'Xin chào, mình có thể tạo lịch trình tự động theo sở thích của bạn.');
}

function getSessionId() {
  const key = 'travel_ai_session_id';
  let value = localStorage.getItem(key);
  if (!value) {
    value = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, value);
  }
  return value;
}

async function loadPlaces() {
  const query = new URLSearchParams();
  if (state.selectedCategory) query.set('category', state.selectedCategory);
  if (state.selectedRegion) query.set('region', state.selectedRegion);

  const response = await fetch(`${apiBase}/places.php?${query.toString()}`);
  const data = await response.json();
  state.places = data.places || [];

  renderFilterButtons(categoryButtons, ['Tất cả', ...(data.categories || [])], 'category');
  renderFilterButtons(regionButtons, ['Tất cả', ...(data.regions || [])], 'region');
  renderMarkers();
}

function renderFilterButtons(container, values, type) {
  container.innerHTML = '';
  values.forEach((value) => {
    const button = document.createElement('button');
    button.textContent = value;
    const current = type === 'category' ? state.selectedCategory : state.selectedRegion;
    if ((value === 'Tất cả' && current === '') || value === current) {
      button.classList.add('active');
    }

    button.addEventListener('click', async () => {
      if (type === 'category') state.selectedCategory = value === 'Tất cả' ? '' : value;
      if (type === 'region') state.selectedRegion = value === 'Tất cả' ? '' : value;
      await loadPlaces();
    });

    container.appendChild(button);
  });
}

function renderMarkers() {
  state.markers.forEach((marker) => map.removeLayer(marker));
  state.markers = [];

  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = state.places.filter((p) => p.name.toLowerCase().includes(keyword));

  filtered.forEach((place) => {
    const marker = L.marker([place.latitude, place.longitude]).addTo(map);
    marker.bindPopup(`<b>${place.name}</b><br>${place.category}`);
    marker.on('click', () => onSelectPlace(place));
    state.markers.push(marker);
  });
}

function onSelectPlace(place) {
  state.selectedPlace = place;
  renderPlaceCard(place);
  drawRouteToPlace(place);
}

function renderPlaceCard(place) {
  placeCard.classList.remove('hidden');
  placeCard.innerHTML = `
    <img src="${place.image_url}" alt="${place.name}">
    <h3>${place.name}</h3>
    <p>${place.description}</p>
    <small>⭐ ${place.rating} | ${Number(place.ticket_price).toLocaleString('vi-VN')}đ</small>
    <div class="row" style="margin-top:10px">
      <button class="outline" id="openVrBtn">Xem VR360</button>
      <button class="primary" id="addToPlanBtn">Thêm vào lịch trình</button>
    </div>
  `;

  document.getElementById('openVrBtn').onclick = () => openVr(place);
  document.getElementById('addToPlanBtn').onclick = () => addToItinerary(place.id);
}

function openVr(place) {
  const url = resolveVrTourUrl(place);
  vrFrame.src = url;
  vrModal.classList.remove('hidden');
}

function resolveVrTourUrl(place) {
  if (place.vr_url && place.vr_url.trim() !== '') {
    return place.vr_url;
  }

  const scene = (place.vr_scene || 'scene_1').trim();
  return `${rootPath}/vtour/index.html?startscene=${encodeURIComponent(scene)}`;
}

closeVrBtn.addEventListener('click', () => {
  vrModal.classList.add('hidden');
  vrFrame.src = '';
});

vrModal.addEventListener('click', (event) => {
  if (event.target === vrModal) {
    vrModal.classList.add('hidden');
    vrFrame.src = '';
  }
});

async function drawRouteToPlace(place) {
  const from = map.getCenter();
  const query = new URLSearchParams({
    from_lat: from.lat,
    from_lng: from.lng,
    to_lat: place.latitude,
    to_lng: place.longitude,
  });

  const response = await fetch(`${apiBase}/route.php?${query.toString()}`);
  const data = await response.json();
  if (!data.geometry) return;

  if (state.routeLayer) {
    map.removeLayer(state.routeLayer);
  }

  state.routeLayer = L.geoJSON(data.geometry, { style: { color: '#1d75ff', weight: 5 } }).addTo(map);
  map.fitBounds(state.routeLayer.getBounds(), { padding: [50, 50] });

  routeInfo.classList.remove('hidden');
  routeInfo.innerHTML = `
    <b>Tuyến đường đến ${place.name}</b><br>
    Khoảng cách: ${(data.distance_m / 1000).toFixed(1)} km<br>
    Thời gian: ${Math.round(data.duration_s / 60)} phút
  `;
}

async function addToItinerary(placeId) {
  const dayNumber = prompt('Thêm vào ngày thứ mấy?', '1');
  const response = await fetch(`${apiBase}/itinerary.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: state.sessionId,
      place_id: placeId,
      day_number: Number(dayNumber) || 1,
    }),
  });
  const data = await response.json();
  addMessage('ai', data.message || 'Đã thêm vào lịch trình.');
  await loadSavedItinerary();
}

async function loadSavedItinerary() {
  const response = await fetch(`${apiBase}/itinerary.php?session_id=${encodeURIComponent(state.sessionId)}`);
  const data = await response.json();
  renderItinerary(data.items || []);
}

function renderItinerary(items) {
  if (items.length === 0) {
    itineraryList.innerHTML = '<p>Chưa có địa điểm nào được thêm.</p>';
    return;
  }

  const grouped = items.reduce((acc, item) => {
    const key = `Ngày ${item.day_number}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  itineraryList.innerHTML = Object.entries(grouped)
    .map(([day, entries]) => `
      <div class="itinerary-day">
        <b>${day}</b>
        <ul>
          ${entries.map((entry) => `<li>${entry.name} (${entry.category})</li>`).join('')}
        </ul>
      </div>
    `).join('');
}

sendBtn.addEventListener('click', async () => {
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage('user', message);
  chatInput.value = '';

  const response = await fetch(`${apiBase}/chat.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      days: Number(daysInput.value) || 3,
      priorities: state.selectedCategory ? [state.selectedCategory] : [],
    }),
  });
  const data = await response.json();
  addMessage('ai', data.assistant_reply || 'Mình chưa thể tạo lịch trình lúc này.');
  if (data.itinerary) {
    renderAIGeneratedPlan(data.itinerary);
  }
});

function renderAIGeneratedPlan(days) {
  itineraryList.innerHTML = days.map((day) => `
    <div class="itinerary-day">
      <b>Ngày ${day.day}</b>
      <ul>
        ${day.places.map((place) => `<li data-place-id="${place.id}">${place.name} (${place.category})</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function addMessage(type, text) {
  const div = document.createElement('div');
  div.className = `bubble ${type}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

searchInput.addEventListener('input', renderMarkers);
