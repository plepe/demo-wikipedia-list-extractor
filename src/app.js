require('leaflet')
require('leaflet.markercluster')
let WikipediaListExtractor = require('wikipedia-list-extractor')

let extractor

function showPopup(values) {
  let id = values[1]
  let wikidataId = values[0].match(/http:\/\/www.wikidata.org\/entity\/(.*)$/)[1]

  let dom = document.createElement('div')

  dom.innerHTML = '<div class="header"><b>#' + id + '</b> (<a target="_blank" href="https://www.wikidata.org/wiki/' + wikidataId + '">' + wikidataId + '</a>)</div>'

  if (extractor) {
    extractor.get(id, (err, result) => {
      if (result.length) {
        let entry = result[0]

        dom.innerHTML +=
          '<h3>' + (entry.data.title || '')+ '</h3>' +
          '<p>' + (entry.data.description || '') + '</p>' +
          '<a target="_blank" href="' + entry.url + '">Quelle</a>'
      }
    })
  }

  return dom
}

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
          marker.bindPopup(() => showPopup(values))
          markers.addLayer(marker)
        }
      })

      map.addLayer(markers)
    })

  global.fetch('node_modules/wikipedia-list-extractor/data/AT-BDA.json')
    .then(res => res.json())
    .then(data => {
      extractor = new WikipediaListExtractor('AT-BDA', data, {
        proxy: 'proxy/?'
      })
    })
}
