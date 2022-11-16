mapboxgl.accessToken = mapToken;

// const campground = JSON.parse(stringCampground)
const campground = stringCampground
const coordinates = campground.geometry.coordinates

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: coordinates,
    zoom: 4
});
map.on('style.load', () => {
    map.setFog({});
});

new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
    )
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl());