const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const projectRootPath = process.cwd()
class IncrementalAssetPlugin {
  preAssetList = [];
  path = '';
  constructor(outPath, targetPath, publicPath) {
    try {
      this.path = path.resolve(projectRootPath, targetPath);
      this.preAssetList = Object.values(
        JSON.parse(
          fs.readFileSync(
            path.resolve(projectRootPath, outPath, 'manifest.json'),
            'utf-8'
          )
        )
      ).map((file) => {
        file = file.replace(publicPath, '');
        if (file.startsWith('/')) {
          return file.replace('/', '');
        }
        return file;
      });
    } catch (e) {
      this.preAssetList = [];
      console.error('请配合 webpack-manifest-plugin 使用',e);
    }
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tap('myplugin', (compilation) => {
      let outPutPath = compilation.outputOptions.path;
      console.log(Object.keys(compilation), compilation.outputOptions);
      fsExtra.removeSync(this.path);
      fsExtra.copySync(outPutPath, this.path);
      let files = compilation.assetsInfo.keys();
      console.log(this.path, '----------------------------', outPutPath);
      for (let file of files) {
        if (this.preAssetList.includes(file)) {
          console.log(file);
          fsExtra.removeSync(path.resolve(this.path, file));
        }
      }
      return false;
    });
  }
}
module.exports = IncrementalAssetPlugin;