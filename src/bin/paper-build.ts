import * as commander from 'commander'
import { checkSource, checkConfig } from '../utils/check'
import { compileToHtml, insertToApp } from '../compile'
import { defaultConfig, Config, Catalog } from '../utils/config.default'
import File from '../utils/file'
import Log from '../utils/log'
import { resolve } from 'path'

// parse id
commander
  .usage('<document-path> [document-path]')
  .parse(process.argv)
const sourcePath: string = `${commander.args[0]}`

;(async() => {
  const targetPath = `${resolve()}/dist`
  
  // check path
  if (!await checkSource(sourcePath)) return
  const config: Config = Object.assign({},
    defaultConfig,
    await checkConfig(sourcePath),
    { __user_source_path: sourcePath },
  )
  
  const catalogs: Catalog[] = await compileToHtml(sourcePath, config)
  await insertToApp(catalogs, sourcePath, config)
  
  Log.time.start()
  await File.spawnSync('./node_modules/.bin/webpack', ['--config', './build/webpack.app.prod.js'])
  Log.time.over('build website')
  
  Log.time.start()
  if (!await File.exists(targetPath)) {
    await File.spawnSync('mkdir', [targetPath])
  }
  // move to user dir
  // await File.spawnSync('mv', ['-f', `${__dirname}/../../templates/target/`, resolve(`${targetPath}/docs`)])
  Log.time.over('clear up')
})()
