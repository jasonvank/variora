# modify database scheme acording to the change of models.py
python variora/manage.py makemigrations

#  apply database scheme change to database
python variora/manage.py migrate

# remove the obsolte bundle
rm -r ./variora/bundled_static/dev/*

webpack --config webpack.config.dev.js &  # run webpack watching mode in background
python variora/manage.py runserver  # run Django development server
pkill -f webpack  # kill wepback watching mode after django dev server is terminated

rm -r ./variora/bundled_static/dev/*
