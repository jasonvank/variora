# modify database scheme according to the change of models.py
python variora/manage.py makemigrations

# apply above migrations
python variora/manage.py migrate

python variora/manage.py showtasks

# remove the obsolete bundle
rm -r ./variora/bundled_static/dev/*

webpack --config webpack.config.dev.js --mode development &  # run webpack watching mode in background
redis-server --daemonize yes
pm2 start ./socket_service/socket_service.js


if [ $# -ge 1 ]; then
    python variora/manage.py runserver 0.0.0.0:$1  # run Django development server on specify port
else
    python variora/manage.py runserver 0.0.0.0:8000  # run Django development server on default port 8080
fi



# on termination
pm2 delete socket_service
pkill -f redis-server
pkill -f webpack  # kill wepback watching mode after django dev server is terminated

rm -r ./variora/bundled_static/dev/*
