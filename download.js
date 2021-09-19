const fs = require('fs')
const async = require('async')
const fetch = require('node-fetch')

const datasets = require('./data/datasets.json')

async.eachOfSeries(datasets,
  (dataset, datasetId, done) => {
    if (!dataset['wikidata-property']) {
      return done()
    }

    console.log('Downloading', datasetId)
    const query = 'select ?item ?value ?coord where { ?item wdt:' + dataset['wikidata-property'] + ' ?value. ?item wdt:P625 ?coord. }'

    fetch('https://query.wikidata.org/sparql?query=' + encodeURI(query), {
      headers: {
        Accept: 'text/csv'
      }
    })
    .then(response => response.text())
    .then(result => {
      fs.writeFile('data/' + datasetId + '.csv', result, (err) => {
        if (err) {
          console.error(datasetId + ': Error writing file: ', err)
        }
      })

      done()
    })
    .catch(done)
  },
  (err) => {
    if (err) {
      console.error(err)
    }
  }
)
