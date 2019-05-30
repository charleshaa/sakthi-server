import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import initializeDb from './db'
import middleware from './middleware'
import api from './api'
import config from './config.json'
import sio from 'socket.io'
import si from 'systeminformation'
import jobs from './api/jobs'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
let app = express()
app.server = http.createServer(app)
const io = sio(app.server)
const osxBrightness = require('osx-brightness')

// eslint-disable-next-line
async function cmd(command = 'ls') {
  const { stdout, stderr } = await exec(command)

  return {
    stdout,
    stderr
  }
}
// logger
app.use(morgan('dev'))
app.use(express.static(__dirname + '/public'))
// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders
  })
)

app.use(
  bodyParser.json({
    limit: config.bodyLimit
  })
)

jobs.forEach(job => {
  setInterval(() => {
    job.handle(io)
  }, job.interval)
})

// connect to db
initializeDb(db => {
  // internal middleware
  app.use(middleware({ config, db }))

  // api router
  app.use('/api', api({ config, db }))

  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`)
  })
  io.on('connection', socket => {
    socket.emit('news', { hello: 'world' })
    socket.on('customevent', msg => {
      console.log('MESSAGE', msg)
    })
    socket.on('brightness', val => {
      const lvl = val / 100
      osxBrightness.set(lvl)
    })
    socket.on('volume', val => {
      cmd(`osascript -e 'set volume output volume ${val}'`)
    })
    socket.on('chrome.switchTab', index => {
      cmd(`osascript -e 'tell application "Google Chrome" to set active tab index of first window to ${index}'`)
    })
  })
})

export default app
