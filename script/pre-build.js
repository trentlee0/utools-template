const fs = require('fs')
const {resolve} = require("path")

fs.rmSync(resolve(__dirname, '../dist'), {
  recursive: true,
  force: true
})
