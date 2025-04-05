// /* global Bare, BareKit */

import RPC from 'bare-rpc'
import fs from 'bare-fs'

import Autopass from 'autopass'
import Corestore from 'corestore'
import { IPC } from 'bare-kit'
import Hyperswarm from 'hyperswarm'
import Hyperdrive from 'hyperdrive'
import { ethers } from 'ethers'
import RAM from 'random-access-memory'
import b4a from 'b4a'

// Initialize ethers provider
const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')

// Define path based on environment
const path = Bare.argv[0] === 'android'
  ? '/data/data/to.holepunch.bare.expo/autopass-example'
  : './tmp/autopass-example/'

// Initialize RPC
const rpc = new RPC(IPC, (req, error) => {
  // Handle two way communication here
})

// Clean start
if (fs.existsSync(path)) {
  fs.rmSync(path, { recursive: true, force: true })
}
fs.mkdirSync(path)

// Corestore (disk) for Autopass
const diskStore = new Corestore(path)

// Autopass pairing
const invite = Bare.argv[1]
const pair = Autopass.pair(diskStore, invite)
const pass = await pair.finished()
await pass.ready()

pass.on('update', async () => {
  const req = rpc.request('reset')
  req.send('data')

  for await (const data of pass.list()) {
    const value = JSON.parse(data.value)

    if (value[0] === 'password') {
      const req = rpc.request('message')
      req.send(JSON.stringify(value))
    }
  }
})

// =========================
// Hyperswarm & Hyperdrive
// =========================

// In-memory Corestore for Hyperdrive (separate from diskStore)
const memStore = new Corestore(RAM)
await memStore.ready()

const drive = new Hyperdrive(memStore)
await drive.ready()
console.log('Hyperdrive initialized with key:', drive.key.toString('hex'))

const swarm = new Hyperswarm()
const topic = drive.discoveryKey
swarm.join(topic)
console.log('Joined swarm with topic:', b4a.toString(topic, 'hex'))



swarm.on('connection', (socket) => {
  console.log('New Hyperswarm connection')
  const stream = memStore.replicate(socket)

  getEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045').then((balance) => {
    console.log('Vitalik ETH Balance:', balance)

    // ✅ Send ETH balance to frontend
    const req = rpc.request('eth_balance')
    req.send(balance)
  })

  stream.on('error', (err) => console.error('Replication error:', err))
})


swarm.on('error', (err) => console.error('Swarm error:', err))

// ETH balance fetch function
async function getEthBalance(address) {
  try {
    const balance = await provider.getBalance(address)
    return ethers.utils.formatEther(balance)
  } catch (error) {
    console.error('Error fetching ETH balance:', error)
    return '0'
  }
}
