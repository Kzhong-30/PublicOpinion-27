const net = require('net')
const { spawn } = require('child_process')

const DEFAULT_START_PORT = 5180
const MAX_CONSECUTIVE_FAILS = 20
const WARN_THRESHOLD = 3

function logInfo(msg) {
  console.log(`[dev-port][INFO] ${msg}`)
}

function logWarn(msg) {
  console.warn(`[dev-port][WARN] ${msg}`)
}

function logError(msg) {
  console.error(`[dev-port][ERROR] ${msg}`)
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close()
      resolve(true)
    })
    server.listen(port, '0.0.0.0')
  })
}

async function findFreePort(startPort) {
  let consecutiveFailures = 0
  for (let offset = 0; offset < MAX_CONSECUTIVE_FAILS; offset++) {
    const port = startPort + offset
    if (await isPortFree(port)) {
      if (consecutiveFailures >= WARN_THRESHOLD) {
        logInfo(`Found free port ${port} after skipping ${consecutiveFailures} occupied ports`)
      }
      return port
    }
    consecutiveFailures++
    if (consecutiveFailures === WARN_THRESHOLD) {
      logWarn(`Consecutive ${WARN_THRESHOLD} ports (${startPort}-${port}) are occupied, continuing to scan...`)
    } else if (consecutiveFailures > WARN_THRESHOLD) {
      logWarn(`Port ${port} occupied — ${consecutiveFailures} in a row, keep scanning`)
    } else {
      logInfo(`Port ${port} is in use, trying next...`)
    }
  }
  throw new Error(
    `Consecutive ${MAX_CONSECUTIVE_FAILS} ports (${startPort}-${startPort + MAX_CONSECUTIVE_FAILS - 1}) are all occupied. ` +
    `Please free up ports in that range or specify a different starting port via CLI argument.`
  )
}

async function main() {
  const startPort = parseInt(process.argv[2], 10) || DEFAULT_START_PORT
  logInfo(`Starting port detection from ${startPort} (max consecutive attempts: ${MAX_CONSECUTIVE_FAILS})`)

  let port
  try {
    port = await findFreePort(startPort)
  } catch (err) {
    logError(err.message)
    process.exit(2)
  }

  logInfo(`Selected free port: ${port}`)
  logInfo('Spawning vite dev server...')

  const args = [
    'vite',
    '--host', '0.0.0.0',
    '--port', String(port),
    ...process.argv.slice(3)
  ]

  const child = spawn('npx', args, {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, PORT: String(port) }
  })

  child.on('exit', (code) => {
    if (code !== 0 && code != null) {
      logError(`Vite exited with non-zero code ${code}`)
    }
    process.exit(code ?? 0)
  })
  child.on('error', (err) => {
    logError(`Failed to spawn vite: ${err.message}`)
    process.exit(1)
  })
}

main().catch(err => {
  logError(`Fatal error: ${err.message}`)
  process.exit(1)
})
