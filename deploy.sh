npm install -g webpack webpack-cli
# remove the obsolte bundle (both development version and production version)
rm -r ./variora/bundled_static/*
# generate new production-version bundle
webpack --config webpack.config.js --mode production

source env/bin/activate
pip install -r prod_reqs.txt

python variora/manage.py makemigrations
python variora/manage.py migrate
sudo env/bin/python variora/manage.py collectstatic --noinput
sudo env/bin/python variora/manage.py installtasks

sudo service memcached restart
sudo service apache2 restart
