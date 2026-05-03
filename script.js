const defaultPlaces = [
    {
        id: 1,
        title: "Pandanon Island Resort",
        category: "Resort",
        image: "img/pandanon_island.png",
        excerpt: "Famous for its powdery white sandbar and crystal clear waters, perfect for swimming and island hopping.",
        description: "Pandanon Island is one of Getafe's premier island destinations. It boasts a long, sweeping white sandbar that changes shape with the tide. The island has small resort facilities, cottages for rent, and pristine waters ideal for family picnics and swimming. It is a must-visit for anyone touring the Danajon Bank.",
        famous: ["Powdery White Sandbar", "Cottage Rentals", "Crystal Clear Waters", "Island Hopping"],
        history: "The island served as a refuge for locals from Cebu and Bohol during the Japanese occupation in World War II. Today, it is a thriving tourist spot.",
        bestTime: "March to June (Summer season) during low tide.",
        coords: [10.1764, 124.0858],
        type: "featured",
        tags: ["White Sand", "Island"]
    },
    {
        id: 2,
        title: "Banacon Mangrove Forest",
        category: "Hiking",
        image: "img/banacon_mangrove.png",
        excerpt: "The largest man-made mangrove forest in Asia, featuring a serene eco-trail for nature lovers.",
        description: "Banacon Island is home to an expansive, 400-hectare man-made mangrove forest, recognized as the largest in Asia. Visitors can hike through the bamboo boardwalks, enjoy the tranquil environment, and observe diverse marine life and bird species taking shelter in the bakauan trees.",
        famous: ["Largest man-made mangrove in Asia", "Eco-Trail Boardwalk", "Bird Watching", "Paden Pass"],
        history: "The reforestation was pioneered by local resident Eugenio 'Mang Denciong' Paden in 1957 to protect the community from strong typhoons and soil erosion.",
        bestTime: "Early morning or late afternoon for calm weather and bird watching.",
        coords: [10.1983, 124.1522],
        type: "wide",
        tags: ["Eco-Tourism", "Nature"]
    },
    {
        id: 3,
        title: "Pandao Island",
        category: "Beach",
        image: "img/pandao_island.png",
        excerpt: "A secluded and rustic white sand island offering a quiet, nature-focused beach experience.",
        description: "For those looking to escape the crowded tourist spots, Pandao Island offers a raw and rustic beach experience. It features beautiful white sands and untouched natural surroundings. There are no commercial resorts here, making it perfect for an authentic, peaceful island getaway.",
        famous: ["Secluded White Sand Beach", "Untouched Nature", "Peaceful Atmosphere", "Off-the-beaten-path"],
        history: "Pandao has remained relatively untouched by commercial tourism, preserving its natural state as a traditional fishing and foraging ground for locals.",
        bestTime: "Dry season (April to May); bring your own supplies.",
        coords: [10.1800, 124.1200],
        type: "normal",
        tags: ["Secluded", "Raw Nature"]
    },
    {
        id: 4,
        title: "Verador Hill",
        category: "Hiking",
        image: "img/verador_hill.png",
        excerpt: "A scenic vantage point offering panoramic views of Getafe and the distant city lights of Cebu.",
        description: "Verador Hill is a popular hiking destination in mainland Getafe. The trek is relatively easy and rewards hikers with breathtaking panoramic views of the surrounding islands, the Danajon Bank, and even the skyline of Metropolitan Cebu across the strait, especially beautiful at night.",
        famous: ["Panoramic Ocean Views", "Night City Lights View", "Beginner-friendly Trek", "Photography Spot"],
        history: "Used historically as a lookout point by locals to spot incoming storms or approaching vessels across the Bohol Strait.",
        bestTime: "Late afternoon for the sunset and evening lights.",
        coords: [10.1350, 124.1550],
        type: "normal",
        tags: ["Viewpoint", "Sunset"]
    },
    {
        id: 5,
        title: "Handumon Marine Sanctuary",
        category: "Heritage",
        image: "img/handumon_sanctuary.png",
        excerpt: "A globally recognized marine sanctuary famous for seahorse conservation and vibrant reefs.",
        description: "Located on Jandayan Island, Handumon is a shining example of community-led marine conservation. Once a hub for seahorse gathering, the community established a 50-hectare marine sanctuary. Snorkelers and divers can witness vibrant coral reefs and the protected seahorses in their natural habitat.",
        famous: ["Seahorse Conservation", "Vibrant Coral Reefs", "Snorkeling", "Community Eco-Tourism"],
        history: "Established in 1995 with the help of Project Seahorse, transforming the village from seahorse hunters to global conservation leaders.",
        bestTime: "May to July for the best underwater visibility.",
        coords: [10.1783, 124.1983],
        type: "normal",
        tags: ["Conservation", "Snorkeling"]
    },
    {
        id: 6,
        title: "Santo Niño Parish Church",
        category: "Heritage",
        image: "img/santo_nino_church.png",
        excerpt: "A historical landmark established in 1876, standing as the spiritual heart of Getafe.",
        description: "The Santo Niño Parish is the center of faith and history in mainland Getafe. Established in 1876, the church reflects the town's deep Spanish colonial influence. It's a peaceful place to visit with the family to appreciate local heritage and architecture.",
        famous: ["Neo-classical facade", "Annual Town Fiesta", "Religious artifacts", "Historical town center"],
        history: "Founded in the late 19th century during the Spanish colonial era when the town was officially organized and renamed after Getafe, Spain.",
        bestTime: "Last Saturday of January during the Town Fiesta.",
        coords: [10.1467, 124.1567],
        type: "normal",
        tags: ["Culture", "History"],
        phone: "+63 912 345 6789",
        email: "visit@getafebohol.gov.ph",
        locationLabel: "Municipal Tourism Office, Getafe"
    }
];

// Initialize storage with defaults if it's the first time
if (!localStorage.getItem('getafe_all_places')) {
    const initialPlaces = defaultPlaces.map(p => ({ ...p, status: 'approved', isOfficial: true }));
    localStorage.setItem('getafe_all_places', JSON.stringify(initialPlaces));
}

let allPlaces = JSON.parse(localStorage.getItem('getafe_all_places')) || [];
let communityPlaces = JSON.parse(localStorage.getItem('getafe_community_places')) || [];

// For the public grid, we show everything approved
let activePlaces = allPlaces.filter(p => p.status === 'approved');
let map;
let markers = [];
let mapInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('places-grid');

    const modal = document.getElementById('place-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('close-place-modal');
    const addModal = document.getElementById('add-place-modal');
    const openAddBtn = document.getElementById('open-add-modal');
    const closeAddBtn = document.getElementById('close-add-modal');
    const addForm = document.getElementById('add-place-form');
    const searchInput = document.getElementById('place-search');
    const suggestionBox = document.getElementById('search-suggestions');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const weatherWidget = document.getElementById('weather-widget');

    let currentFilter = 'all';

    // 💫 Splash Screen
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => splash.remove(), 800);
        }, 2000);
    }

    // 🔝 Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.id === 'impact') animateCounters();
            }
        });
    }, { threshold: 0.1 });

    // --- Helpers: Ratings & Favorites ---
    function getRatings() { return JSON.parse(localStorage.getItem('getafe_ratings')) || {}; }
    function getFavorites() { return JSON.parse(localStorage.getItem('getafe_favorites')) || []; }
    function isFavorite(id) { return getFavorites().includes(id); }
    function toggleFavorite(id) {
        let favs = getFavorites();
        if (favs.includes(id)) favs = favs.filter(f => f !== id);
        else favs.push(id);
        localStorage.setItem('getafe_favorites', JSON.stringify(favs));
    }
    function getStars(id) {
        const ratings = getRatings();
        return ratings[id] ? ratings[id].avg.toFixed(1) : null;
    }
    function renderStarDisplay(id) {
        const ratings = getRatings();
        const r = ratings[id];
        const avg = r ? r.avg : 0;
        const count = r ? r.count : 0;
        return `<div style="display:flex; align-items:center; gap:4px; margin-top: 8px;">
            ${[1,2,3,4,5].map(s => `<span style="font-size:1.1rem; color: ${s <= Math.round(avg) ? '#facc15' : 'rgba(255,255,255,0.2)'};">★</span>`).join('')}
            <span style="font-size:0.75rem; opacity:0.6;">${count > 0 ? avg.toFixed(1) + ' ('+count+')' : 'No ratings yet'}</span>
        </div>`;
    }

    // --- Editorial Grid Population ---
    function populateGrid(filteredPlaces) {
        if (!grid) return;
        grid.innerHTML = '';
        filteredPlaces.forEach((place, index) => {
            const card = document.createElement('div');
            let type = place.type || 'normal';
            // Make every 4th item "wide" for visual rhythm
            if (index % 4 === 0) type = 'featured';
            const fav = isFavorite(place.id);
            card.className = `place-card ${type} reveal`;
            card.innerHTML = `
                <div class="place-img">
                    <img src="${place.image}" alt="${place.title}" loading="lazy">
                    <button class="fav-btn ${fav ? 'active' : ''}" data-id="${place.id}" title="Save to Favorites">♥</button>
                </div>
                <div class="place-content">
                    <span class="place-category">${place.category}</span>
                    <h3>${place.title}</h3>
                    <p class="place-excerpt">${place.excerpt || place.description.substring(0, 120) + '...'}</p>
                    ${renderStarDisplay(place.id)}
                    <div class="read-more">Open Story <span>&rarr;</span></div>
                </div>
            `;
            card.querySelector('.fav-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(place.id);
                e.currentTarget.classList.toggle('active');
            });
            card.addEventListener('click', () => openModal(place));
            grid.appendChild(card);
            observer.observe(card);
        });

        if (filteredPlaces.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 5rem 0; color: var(--text-muted); font-size: 1.1rem;">No stories found in this category.</div>`;
        }
    }

    // --- Search Suggestions ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if (val.length < 2) {
            suggestionBox.classList.remove('active');
            return;
        }

        const matches = activePlaces.filter(p => 
            p.title.toLowerCase().includes(val) || 
            p.category.toLowerCase().includes(val)
        ).slice(0, 5);

        if (matches.length > 0) {
            suggestionBox.innerHTML = matches.map(p => `
                <div class="suggestion-item" onclick="window.selectSuggestion('${p.title}')">
                    <span>${p.title}</span>
                    <span class="category-tag">${p.category}</span>
                </div>
            `).join('');
            suggestionBox.classList.add('active');
        } else {
            suggestionBox.classList.remove('active');
        }
    });

    window.selectSuggestion = (title) => {
        searchInput.value = title;
        suggestionBox.classList.remove('active');
        filterPlaces();
    };

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) suggestionBox.classList.remove('active');
        });
    }

    function initMap() {
        if (!document.getElementById('map') || mapInitialized) return;
        
        // Check for coordinates in URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlLat = urlParams.get('lat');
        const urlLng = urlParams.get('lng');
        
        const initialCoords = (urlLat && urlLng) ? [parseFloat(urlLat), parseFloat(urlLng)] : [10.15, 124.15];
        const initialZoom = (urlLat && urlLng) ? 14 : 12;

        // Tile Layers
        const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap'
        });

        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        const baseMaps = {
            "Satellite 3D": satellite,
            "Night Mode": dark
        };

        map = L.map('map', {
            zoomControl: false,
            scrollWheelZoom: true,
            layers: [satellite]
        }).setView(initialCoords, initialZoom);
        
        // Layer Control
        L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        updateMarkers(activePlaces);
        mapInitialized = true;
    }

    function updateMarkers(placesToShow) {
        if (!map) return;
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        placesToShow.forEach(place => {
            if (place.coords) {
                const marker = L.marker(place.coords).addTo(map).bindPopup(`
                    <div style="font-family: 'Outfit', sans-serif; padding: 10px; min-width: 150px;">
                        <h4 style="margin: 0 0 10px 0; font-weight: 700; color: var(--primary);">${place.title}</h4>
                        <button onclick="window.openDetails(${place.id})" style="background: var(--accent); color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 0.75rem; width: 100%; font-weight: 600;">View Story</button>
                    </div>
                `);
                markers.push(marker);
            }
        });
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

    // --- Weather Widget ---
    function updateWeather() {
        weatherWidget.innerHTML = `
            <div class="weather-stat">
                <span class="value">31°C</span>
                <span class="label">Temp</span>
            </div>
            <div class="weather-stat">
                <span class="value">78%</span>
                <span class="label">Humidity</span>
            </div>
            <div class="weather-stat">
                <span class="value">12km/h</span>
                <span class="label">Wind</span>
            </div>
        `;
    }

    // --- Animated Counters (Optimized) ---
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentCount = Math.floor(progress * target);
                counter.innerText = currentCount;
                if (progress < 1) requestAnimationFrame(update);
                else counter.innerText = target;
            }
            requestAnimationFrame(update);
        });
    }

    // --- Modals & Filters ---
    window.openDetails = (id) => {
        const place = activePlaces.find(p => p.id === id);
        if (place) openModal(place);
    };

    function openModal(place) {
        const fav = isFavorite(place.id);
        const ratings = getRatings();
        const r = ratings[place.id];
        const currentAvg = r ? r.avg : 0;
        const currentCount = r ? r.count : 0;
        const coords = place.coords || [10.15, 124.15];
        const starsHtml = [1,2,3,4,5].map(s => `<span class="star-btn" data-val="${s}" style="color:${s <= Math.round(currentAvg) ? '#facc15' : 'rgba(255,255,255,0.2)'}; transition:0.2s; cursor:pointer;">&#9733;</span>`).join('');
        const essentialsHtml = (place.famous || ["Local Guide","Camera"]).map(e => `<li style="padding:0.5rem 0;border-bottom:1px solid rgba(0,0,0,0.05);font-size:0.9rem;color:var(--text-main);">&#10003; ${e}</li>`).join('');
        modalBody.innerHTML = `
            <div class="modal-cinematic-hero">
                <img src="${place.image}" alt="${place.title}">
                <div class="modal-hero-text">
                    <span class="place-category">${place.category}</span>
                    <h2>${place.title}</h2>
                    <div style="display:flex;align-items:center;gap:12px;margin-top:1rem;flex-wrap:wrap;">
                        <button id="modal-fav-btn" style="background:${fav ? '#ef4444' : 'rgba(255,255,255,0.15)'};border:none;color:white;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:0.9rem;transition:0.3s;">${fav ? '&#9829; Saved!' : '&#9825; Save'}</button>
                        <button id="modal-share-btn" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:0.9rem;">&#128279; Share</button>
                    </div>
                </div>
            </div>
            <div class="modal-editorial-body">
                <div class="editorial-column main">
                    <p>${place.description}</p><br>
                    <h4 style="color:var(--primary);margin-bottom:1rem;">History &amp; Heritage</h4>
                    <p style="color:var(--text-muted);">${place.history}</p>
                    <div style="margin-top:2rem;padding:1.5rem;background:rgba(212,175,55,0.05);border:1px solid var(--glass-border);border-radius:12px;">
                        <h5 style="color:var(--primary);margin-bottom:0.5rem;">&#11088; Rate This Place</h5>
                        <p id="rating-count" style="font-size:0.8rem;opacity:0.6;margin-bottom:1rem;">${currentCount > 0 ? 'Average: '+currentAvg.toFixed(1)+'/5 from '+currentCount+' rating'+(currentCount>1?'s':'') : 'Be the first to rate!'}</p>
                        <div id="star-rater" style="display:flex;gap:8px;font-size:2rem;">${starsHtml}</div>
                    </div>
                </div>
                <div class="editorial-column sidebar">
                    <div class="info-card-noir"><h5>Travel Essentials</h5><ul style="list-style:none;padding:0;">${essentialsHtml}</ul></div>
                    <div class="info-card-noir"><h5>Best Time to Visit</h5><p style="font-size:0.9rem;color:var(--text-main);">${place.bestTime}</p></div>
                    <div class="info-card-noir" style="border-top:1px solid var(--primary);padding-top:1.5rem;">
                        <h5 style="color:var(--accent);">Connect &amp; Locate</h5>
                        <p style="font-size:0.85rem;margin-bottom:10px;"><strong>&#128222; Phone:</strong> ${place.phone || '+63 38 518 0000'}</p>
                        <p style="font-size:0.85rem;margin-bottom:10px;"><strong>&#128231; Gmail:</strong> <a href="mailto:${place.email || 'tourism@getafebohol.gov.ph'}" style="color:var(--primary);">${place.email || 'tourism@getafebohol.gov.ph'}</a></p>
                        <a href="map.html?lat=${coords[0]}&lng=${coords[1]}" style="display:block;margin-top:15px;background:var(--primary);color:#000;text-align:center;padding:10px;border-radius:6px;font-weight:700;text-decoration:none;font-size:0.85rem;">&#128205; View on Map</a>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalBody.querySelectorAll('.star-btn').forEach(star => {
            star.addEventListener('mouseover', () => { const v=+star.dataset.val; modalBody.querySelectorAll('.star-btn').forEach(s => s.style.color=+s.dataset.val<=v?'#facc15':'rgba(255,255,255,0.2)'); });
            star.addEventListener('mouseleave', () => { const rD=getRatings()[place.id]; const a=rD?rD.avg:0; modalBody.querySelectorAll('.star-btn').forEach(s => s.style.color=+s.dataset.val<=Math.round(a)?'#facc15':'rgba(255,255,255,0.2)'); });
            star.addEventListener('click', () => {
                const val=+star.dataset.val, rData=getRatings(), cur=rData[place.id]||{total:0,count:0};
                cur.total+=val; cur.count+=1; cur.avg=cur.total/cur.count; rData[place.id]=cur;
                localStorage.setItem('getafe_ratings', JSON.stringify(rData));
                modalBody.querySelectorAll('.star-btn').forEach(s => s.style.color=+s.dataset.val<=val?'#facc15':'rgba(255,255,255,0.2)');
                document.getElementById('rating-count').textContent='Average: '+cur.avg.toFixed(1)+'/5 from '+cur.count+' rating'+(cur.count>1?'s':'');
            });
        });
        const favBtn = modalBody.querySelector('#modal-fav-btn');
        favBtn.addEventListener('click', () => { toggleFavorite(place.id); const nf=isFavorite(place.id); favBtn.innerHTML=nf?'&#9829; Saved!':'&#9825; Save'; favBtn.style.background=nf?'#ef4444':'rgba(255,255,255,0.15)'; });
        modalBody.querySelector('#modal-share-btn').addEventListener('click', () => {
            if (navigator.share) navigator.share({title:place.title, text:'Check out '+place.title+' in Beautiful Getafe, Bohol!', url:window.location.href});
            else navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied! Share it with your friends.'));
        });
    }

    window.closeAllModals = () => {
        modal.classList.remove('active');
        addModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (openAddBtn) {
        openAddBtn.addEventListener('click', () => {
            addModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', window.closeAllModals);
    if (closeAddBtn) closeAddBtn.addEventListener('click', window.closeAllModals);
    
    // Also close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal || e.target === addModal) window.closeAllModals();
    });

    // Escape key to back/close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    function filterPlaces() {
        if (!grid || !searchInput) return;
        const term = searchInput.value.toLowerCase();
        const filtered = allPlaces.filter(place => {
            const matchesFilter = currentFilter === 'all' || place.category === currentFilter;
            const matchesSearch = place.title.toLowerCase().includes(term) || place.description.toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
        populateGrid(filtered);
    }

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterPlaces();
        });
        });
    }

    // --- Submission ---
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
        const fileInput = document.getElementById('new-place-image');
        if (!fileInput.files[0]) { alert('Please select a photo.'); return; }

        const reader = new FileReader();
        reader.onloadend = () => {
            const newPlace = {
                id: Date.now(),
                title: document.getElementById('new-place-title').value,
                category: document.getElementById('new-place-category').value,
                image: reader.result,
                description: document.getElementById('new-place-description').value,
                history: "Shared Discovery",
                bestTime: "Consult locals for tides.",
                type: "normal",
                coords: [10.15, 124.15],
                tags: ["Community"],
                status: "pending"
            };
            communityPlaces.push(newPlace);
            localStorage.setItem('getafe_community_places', JSON.stringify(communityPlaces));
            allPlaces = [...defaultPlaces, ...communityPlaces];
            filterPlaces();
            addModal.classList.remove('active');
            addForm.reset();
            document.getElementById('file-name').textContent = 'No file chosen';
        };
        reader.readAsDataURL(fileInput.files[0]);
        });
    }

    // --- Initial setup ---
    if (grid) populateGrid(activePlaces);
    if (weatherWidget) updateWeather();
    document.querySelectorAll('.reveal-boundary, #impact').forEach(el => observer.observe(el));
    
    // --- Inquiry Form Submission ---
    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = inquiryForm.querySelectorAll('input, select, textarea');
            const newInquiry = {
                id: Date.now(),
                name: inputs[0].value,
                email: inputs[1].value,
                interest: inputs[2].value,
                message: inputs[3].value,
                date: new Date().toLocaleDateString()
            };
            let inquiries = JSON.parse(localStorage.getItem('getafe_inquiries')) || [];
            inquiries.push(newInquiry);
            localStorage.setItem('getafe_inquiries', JSON.stringify(inquiries));
            alert('Your inquiry has been sent! We will get back to you soon.');
            inquiryForm.reset();
        });
    }

    setTimeout(() => {
        document.querySelectorAll('.hero-content .reveal-boundary').forEach(el => el.classList.add('active'));
    }, 500);
});