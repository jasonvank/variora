/* 
    instruction of usage:
    
    write your page index javascript file as [appname]/static/xxx.js
    but include in the page as /static/bundle/[appname]/xxx.js
    we suggest you name your index javascript file (i.e. xxx.js) as [pagename]_index.js
*/


var path = require('path');
var glob = require('glob');

/**
 * search for all .js file under [appname]/static/
 * for each, add the following key-value pair to the entries object:
 *    [appname]/[filename].js: [path to this .js file]
 * @returns the entries object as explained above
 */
function getEntries() {
    var filePaths = glob.sync("./Orbital_django/*/static/*.js")
    var entries = {};    
    for (filePath of filePaths) {
        var splits = filePath.split('/');
        var appName = splits[splits.length - 3];
        var fileName = splits[splits.length - 1].split('.')[0]
        entries[appName + '/' + fileName] = filePath;
    }
    return entries
}
    
module.exports = {
    entry: getEntries,
    output: {
        path: path.resolve('./Orbital_django/bundled_static/prod/bundle'),
        filename: "[name].js"
    },
    resolve: {
      // please refer to the following links for explanation:
      // https://moduscreate.com/es6-es2015-import-no-relative-path-webpack/
      // https://webpack.js.org/configuration/resolve/#resolve-modules
      modules: [
        "node_modules",
        path.resolve(__dirname, 'Orbital_django/comm_assets'),
      ],
      alias: {
        vue: 'vue/dist/vue.js', 
        CommAssets: path.resolve(__dirname, 'Orbital_django/comm_assets'),
      },
    },
    module: {
      loaders: [
        // use babel-loader with es2015 and react settign to load .js and .jsx files 
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react'],
            plugins: [
              [
                "import", [
                  {
                    "libraryName": "antd",
                  }
                ]
              ]
            ]
          }
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
          loader: 'file-loader',
          options: {
            publicPath: '/static/bundle/'
          }
        },
      ],
    },
}
