require('leaflet')
require('leaflet.markercluster')

window.onload = function () {
  var map = L.map('map').fitBounds([[46.55, 9.57], [49.02, 17.09]])

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  let markers = L.markerClusterGroup()

  global.fetch('data.csv')
    .then(res => res.text())
    .then(data => {
      data = data.split(/\r\n/g)
      let header = data.splice(0, 1)

      data = data.forEach(entry => {
        if (entry === '') {
          return
        }

        let values = entry.split(/,/g)
        if (values.length !== 3) {
          console.log('error parsing entry: "' + entry + '"')
          return
        }

        let coords = values[2].match(/^Point\(([0-9\.]+) ([0-9\.]+)\)/)
        if (coords) {
          let marker = L.marker([coords[2], coords[1]])
          markers.addLayer(marker)
        }
      })

      map.addLayer(markers)
    })
}
