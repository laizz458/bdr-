// Initialisation de la carte centrée sur Bouches-du-Rhône
var map = L.map('map').setView([43.3, 5.4], 10);

// Ajouter OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Requête Overpass API pour tous les fast-foods du 13
var overpassQuery = `
[out:json][timeout:50];
area["name"="Bouches-du-Rhône"][admin_level=6];
(
  node["amenity"="fast_food"](area);
  way["amenity"="fast_food"](area);
  relation["amenity"="fast_food"](area);
);
out center tags;
`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery
})
.then(response => response.json())
.then(data => {
    var fastFoods = data.elements.map(el => {
        var lat = el.lat || el.center.lat;
        var lon = el.lon || el.center.lon;
        var tags = el.tags || {};
        var name = tags.name || "Fast-food";
        var cuisine = tags.cuisine || "Non renseigné";
        var hours = tags.opening_hours || "Horaires non renseignés";
        var description = tags.description || "";
        
        // Créer un marqueur avec popup détaillé
        var popupContent = `<b>${name}</b><br>
                            Cuisine : ${cuisine}<br>
                            Horaires : ${hours}<br>
                            ${description}`;
        var marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(popupContent);
        
        return {marker: marker, name: name.toLowerCase()};
    });

    // Recherche par nom
    var searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        var query = this.value.toLowerCase();
        fastFoods.forEach(ff => {
            if(ff.name.includes(query)) {
                map.addLayer(ff.marker);
            } else {
                map.removeLayer(ff.marker);
            }
        });
    });
});
