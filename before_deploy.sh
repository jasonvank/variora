# remove the obsolte bundle (both development version and production version)
rm -r ./Orbital_django/bundled_static/*

# generate new production-version bundle
webpack --config webpack.config.js -p