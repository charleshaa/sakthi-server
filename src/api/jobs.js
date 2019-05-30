import si from 'systeminformation'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

// eslint-disable-next-line
async function cmd(command = 'ls') {
  const { stdout, stderr } = await exec(command)

  return {
    stdout,
    stderr
  }
}

export default [
  {
    name: 'battery',
    async handle(s) {
      const data = await si.battery()
      s.emit('battery', data)
    },
    interval: 120000
  },
  {
    name: 'currentApp',
    async handle(s) {
      cmd(  
        `osascript -e 'tell application "System Events"' -e 'set bid to bundle identifier of first application process whose frontmost is true' -e 'set bname to name of first application process whose frontmost is true' -e 'set result to bid & ":" & bname' -e 'end tell'`
      )
        .then(out => {
          const app = out.stdout.split(':')
          s.emit('activeApp', { name: app[1], id: app[0] })
        })
        .catch(err => {
          console.log(err)
        })
    },
    interval: 3000
  },
  {
    name: 'system',
    async handle(s) {
        const cpuData = await si.currentLoad()
        const memData = await si.mem()
        s.emit('system', {
          cpu: cpuData,
          memory: memData
        })
    },
    interval: 10000
  },
  {
    name: 'network',
    async handle(s) {
        const netData = await si.networkStats()
        s.emit('network', netData)
    },
    interval: 3000
  },
  {
    name: 'spotify',
    async handle(s) {
      cmd(
        `osascript ./src/apple-scripts/spotifyInfo.scpt`
      )
        .then(out => {
          const info = JSON.parse(out.stdout)
          s.emit('spotify', info)
        })
        .catch(err => {
          console.log(err)
        })
    },
    interval: 8000
  },
  {
    name: 'spotify',
    async handle(s) {
      cmd(
        `osascript ./src/apple-scripts/chromeTabs.scpt`
      )
        .then(out => {
          const tabs = out.stdout.split(',')
          const tabList = tabs.map((t, i) => {
            // if(t === 'end') return false
            const arr = t.split('|||')
            if(t.indexOf('|A|') === 0) {
              // Active tab
              return {
                url: arr[0].replace('|A|', ''),
                title: arr[1],
                active: true
              }
            }
            return {
              url: arr[0],
              title: arr[1],
              active: false
            }
          })
          s.emit('chromeTabs', tabList)
        })
        .catch(err => {
          console.log(err)
        })
    },
    interval: 8000
  }
]
