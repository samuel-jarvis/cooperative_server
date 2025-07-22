// cors config file

const allowedOrigins = [
  'http://localhost:2085',
  'https://apexglobal-client.vercel.app',
  'https://apexglobalcliient-production.up.railway.app',
  'https://apexglobalunion.com'
]

module.exports = {
  origin: allowedOrigins,
  optionSuccessStatus: 200,
  credentials: true
}
