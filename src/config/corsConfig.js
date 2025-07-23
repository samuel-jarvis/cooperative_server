// cors config file

const allowedOrigins = [
  'http://localhost:2085',
  'https://cooperativeclient-production.up.railway.app'
]

module.exports = {
  origin: allowedOrigins,
  optionSuccessStatus: 200,
  credentials: true
}
