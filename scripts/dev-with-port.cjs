const net = require('net')
const { spawn } = require('child_process')

const DEFAULT_START_PORT = 5180
const MAX_ATTEMPTS = 100

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
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const port = startPort + i
    if (await isPortFree(port)) {
      return port
    }
    console.warn(`[find-port] Port ${port} is in use, trying next...`)
  }
  throw new Error(`No free port found from ${startPort} to ${startPort + MAX_ATTEMPTS - 1}`)
}

async function main() {
  const startPort = parseInt(process.argv[2], 10) || DEFAULT_START_PORT
  const port = await findFreePort(startPort)
  console.log(`[find-port] Using free port: ${port}`)

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

  child.on('exit', (code) => process.exit(code ?? 0))
  child.on('error', (err) => {
    console.error('[find-port] Failed to spawn vite:', err)
    process.exit(1)
  })
}

main().catch(err => {
  console.error('[find-port] Fatal error:', err.message)
  process.exit(1)
})
