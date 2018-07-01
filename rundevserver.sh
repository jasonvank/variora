# modify database scheme acording to the change of models.py
python variora/manage.py makemigrations

#  apply database scheme change to database
python variora/manage.py migrate

# remove the obsolte bundle
rm -r ./variora/bundled_static/dev/*

webpack --config webpack.config.dev.js --mode development &  # run webpack watching mode in background

if [ $# -ge 1 ]; then
    python variora/manage.py runserver $1  # run Django development server on specify port
else
    python variora/manage.py runserver  # run Django development server on default port 8080
fi

pkill -f webpack  # kill wepback watching mode after django dev server is terminated

rm -r ./variora/bundled_static/dev/*
