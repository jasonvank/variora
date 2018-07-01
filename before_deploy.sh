# remove the obsolte bundle (both development version and production version)
rm -r ./variora/bundled_static/*

# generate new production-version bundle
webpack --config webpack.config.js --mode production
