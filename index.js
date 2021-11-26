const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');

class IncrementalAssetPlugin {
  preAssetList = [];
  path = '';
  constructor(outPath, targetPath) {
    try {
      this.path = path.resolve(__dirname, targetPath);
      this.preAssetList = Object.values(
        JSON.parse(
          fs.readFileSync(
            path.resolve(__dirname, outPath, 'manifest.json'),
            'utf-8'
          )
        )
      ).map((file) => {
        if (file.startsWith('/')) {
          return file.replace('/', '');
        }
        return file;
      });
    } catch (e) {
      this.preAssetList = [];
      console.error('请配合 webpack-manifest-plugin 使用');
    }
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tap('myplugin', (compilation) => {
      let outPutPath = compilation.outputOptions.path;
      console.log(Object.keys(compilation), compilation.outputOptions);
      fsExtra.removeSync(this.path);
      fsExtra.copySync(outPutPath, this.path);
      let files = compilation.assetsInfo.keys();
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
export default IncrementalAssetPlugin;