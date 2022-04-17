const Nuron = require('../index');
const path = require('path');
const fs = require('fs');
const os = require('os');
const launch = async (_nuronHome, _keyportHome) => {
  const nuronHome = path.resolve(_nuronHome, "home")
  const nuronTmp = path.resolve(_nuronHome, "tmp")
  const keyportHome = path.resolve(_keyportHome)
  const nuron = new Nuron();
  console.log("nuron home located at:", nuronHome);
  console.log("keyport home located at:", keyportHome);
  await fs.promises.mkdir(nuronHome, { recursive: true }).catch((e) => {})
  await fs.promises.mkdir(nuronTmp, { recursive: true }).catch((e) => {})
  await nuron.init({
    ipfs: {},
    path: nuronHome,
    tmp: nuronTmp,
    keyport: keyportHome
  })
  console.log("nuron started")
}
launch(process.argv[2], process.argv[3])
