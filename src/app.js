require('leaflet')

window.onload = function () {
  var map = L.map('map').fitBounds([[46.55, 9.57], [49.02, 17.09]])

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
}
