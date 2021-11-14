require('leaflet')
require('leaflet.markercluster')
let WikipediaListExtractor = require('wikipedia-list-extractor/client')
const Twig = require('twig')

let extractor
let templates = {}

function showPopup(values) {
  let id = values[1]
  if (dataset.idPrefix) {
    id = dataset.idPrefix + id
  }
  let wikidataId = values[0].match(/http:\/\/www.wikidata.org\/entity\/(.*)$/)[1]

  let dom = document.createElement('div')
  dom.className = 'popup'

  dom.innerHTML = 'Loading ...'

  if (extractor) {
    extractor.get(id, (err, result) => {
      dom.innerHTML = ''

      if (result.length) {
        let content = ''
        let entry = result[0]

        entry.data = entry.rendered

        content += '<div class="title">' + (entry.data.title || '')+ '</div>'

        if (entry.data.image) {
          let url = 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/' + encodeURIComponent(entry.data.image.id) + '&width=300'

          content += '<div class="image"><img src="' + url + '"></div>'
        }

        content += '<div class="description">' + (entry.data.description || '') + '</div>'

        let links = ''
        if (entry.url) {
          links += '<a target="_blank" href="' + entry.url + '">Quelle</a>'
        }

        if (dataset.links) {
          dataset.links.forEach(
            (linkDef) => {
              if (!(linkDef.url in templates)) {
                templates[linkDef.url] = Twig.twig({
                  data: linkDef.url
                })
              }
              let template = templates[linkDef.url]
              let url = template.render({item: entry})

              if (url.trim() !== '') {
                links += '<a target="_blank" href="' + encodeURI(url) + '" title="' + encodeURI(linkDef.title) + '"><img src="' + encodeURI(linkDef.icon) + '"></a>'
              }
            }
          )
        }

        if (links) {
          content += "<div class='links'>" + links + "</div>"
        }

        dom.innerHTML = content
      }
    })
  }

  return dom
}

let datasets

let map
let markers = null
let datasetId
let dataset

window.onload = function () {
  map = L.map('map').fitBounds([[-70, -180], [70, 180]])
  map.attributionControl.setPrefix('<a target="_blank" href="https://github.com/plepe/demo-wikipedia-list-extractor">demo-wikipedia-list-extractor</a>')

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  global.fetch('data/datasets.json')
    .then(res => res.json())
    .then(result => {
      datasets = result

      const select = document.getElementById('dataset')
      for (let k in datasets) {
        const option = document.createElement('option')
        option.value = k
        option.appendChild(document.createTextNode(datasets[k].title))
        select.appendChild(option)
      }

      if (select.value) {
        init(select.value)
      }

      select.onchange = () => {
        deinit()
        init(select.value)
      }
    })
}

function init (_id) {
  datasetId = _id
  dataset = datasets[datasetId]

  markers = L.markerClusterGroup()

  global.fetch('data/' + datasetId + '.csv')
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
          marker.bindPopup(() => showPopup(values), { minWidth: 'auto', maxWidth: 'auto' })
          markers.addLayer(marker)
        }
      })

      map.addLayer(markers)

      map.flyToBounds(dataset.bounds)
    })

    extractor = new WikipediaListExtractor(dataset.list, {
      serverUrl: 'http://localhost:8080'
    })
}

function deinit () {
  if (markers !== null) {
    map.removeLayer(markers)
    markers = null
  }
}
