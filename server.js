const http = require('http')
const fs = require('fs')
const path = require('path')
const queryString = require('query-string')

const apiHandle = require('wikipedia-list-extractor/src/apiHandle')

global.fetch = require('node-fetch')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document

const options = {}

const contentTypes = {
  css: 'text/css',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  html: 'text/html',
  js: 'application/javascript',
  json: 'application/json'
}

function requestListener (req, res) {
  let file
  let ext = 'html'

  console.log('* ' + req.url)

  m = req.url.match(/^\/api\//)
  if (m) {
    return apiHandle(req.url,
      (err, result) => {
        if (err) {
          console.error(err)
          res.writeHead(500)
          res.end()
          return
        }

        res.setHeader('Content-Type', 'application/json')
        res.writeHead(200)
        res.end(JSON.stringify(result, null, '    '))
      }
    )
  }

  file = req.url
  if (req.url === '/') {
    file = '/index.html'
  }

  if (req.url.match(/\.\./)) {
    res.writeHead(500)
    res.end('Internal server error')
    return console.error(err)
  }

  fs.readFile(path.join(__dirname, file), (err, contents) => {
    if (!contents) {
      res.writeHead(404)
      res.end('File not found')
      return
    }

    const m = file.match(/\.([a-z]*)$/i)
    ext = m[1]

    if (err) {
      res.writeHead(500)
      res.end()
      return console.error(err)
    }

    res.setHeader('Content-Type', ext in contentTypes ? contentTypes[ext] : 'text/plain')
    res.writeHead(200)
    res.end(contents)
  })
}

const server = http.createServer(requestListener)
server.listen(8080)
