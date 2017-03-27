const path = require('path')
console.log(`STARTING IN PATH: ${__dirname}`)
const srcRoot = __dirname
process.env.NODE_PATH = srcRoot
require('module')._initPaths()
console.log(`NODE_PATH: ${process.env.NODE_PATH}`)
const serviceDir = path.dirname(srcRoot)
require('envc')({path: serviceDir})
module.exports = require('./server')
