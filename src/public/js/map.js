console.log('Map script loaded');

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing map...');
    console.log('Map token available:', typeof mapToken !== 'undefined');
    console.log('Mapbox GL available:', typeof mapboxgl !== 'undefined');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    // Check if token exists and is not empty
    if (typeof mapToken === 'undefined' || !mapToken || mapToken.trim() === '') {
        console.error('Map token not found or empty');
        mapContainer.innerHTML = '<div class="text-center p-4 text-muted"><i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>Map token not configured</div>';
        mapContainer.classList.add('map-loading');
        return;
    }
    
    try {
        mapboxgl.accessToken = mapToken;
        console.log('Token set, creating map...');
        
        // Get coordinates
        let coordinates = [77.2090, 28.6139]; // Default Delhi [lng, lat]
        if (mapContainer.dataset.coordinates) {
            try {
                let parsed = JSON.parse(mapContainer.dataset.coordinates);
                // Ensure it's an array with 2 numbers
                if (Array.isArray(parsed) && parsed.length === 2 && 
                    typeof parsed[0] === 'number' && typeof parsed[1] === 'number') {
                    coordinates = parsed;
                    console.log('Using coordinates:', coordinates);
                } else {
                    console.log('Invalid coordinates format, using default');
                }
            } catch (e) {
                console.log('Error parsing coordinates, using default:', e);
            }
        }
        
        // Get listing info from data attributes
        const listingTitle = mapContainer.dataset.title || 'Property Location';
        const listingLocation = mapContainer.dataset.location || 'Location';
        
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: coordinates,
            zoom: 10
        });
        
        // Add red circle around marker 
        map.on('load', function() {
            map.addSource('area', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates
                    }
                }
            });
            
            map.addLayer({
                'id': 'area-circle',
                'type': 'circle',
                'source': 'area',
                'paint': {
                    'circle-radius': 80,
                    'circle-color': '#fe424d',
                    'circle-opacity': 0.15,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fe424d',
                    'circle-stroke-opacity': 0.3
                }
            });
        });
        
        // Create popup HTML
        const popupHTML = `
            <div style="padding: 8px; min-width: 200px;">
                <h6 style="margin: 0 0 8px 0; font-weight: 600; color: #222222;">${listingTitle}</h6>
                <p style="margin: 0; font-size: 14px; color: #717171;">
                    <i class="fas fa-map-marker-alt" style="color: #fe424d; margin-right: 4px;"></i>
                    ${listingLocation}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #717171;">Exact location provided after booking</p>
            </div>
        `;
        
        // Create custom marker element with logo
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
            <div class="marker-inner">
                <div class="marker-front"><i class="fas fa-home"></i></div>
                <div class="marker-back"><i class="fas fa-compass"></i></div>
            </div>
        `;
        
        // Add marker with custom element and anchor to center
        const marker = new mapboxgl.Marker({ 
            element: el,
            anchor: 'center'
        })
            .setLngLat(coordinates)
            .setPopup(
                new mapboxgl.Popup({ 
                    offset: 25,
                    closeButton: false,
                    className: 'airbnb-popup'
                })
                .setHTML(popupHTML)
            )
            .addTo(map);
        
        // Show popup on hover and flip marker
        el.addEventListener('mouseenter', () => {
            marker.getPopup().addTo(map);
            el.querySelector('.marker-inner').classList.add('flipped');
        });
        
        el.addEventListener('mouseleave', () => {
            marker.getPopup().remove();
            el.querySelector('.marker-inner').classList.remove('flipped');
        });

        console.log('Map created successfully');
        
    } catch (error) {
        console.error('Error creating map:', error);
        mapContainer.innerHTML = '<div class="text-center p-4 text-muted"><i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>Map failed to load: ' + error.message + '</div>';
        mapContainer.classList.add('map-loading');
    }
});