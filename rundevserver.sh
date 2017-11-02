# modify database scheme acording to the change of models.py
python Orbital_django/manage.py makemigrations

#  apply database scheme change to database
python Orbital_django/manage.py migrate

# remove the obsolte bundle
rm -r ./Orbital_django/bundled_static/dev/*

webpack --config webpack.config.dev.js &  # run webpack watching mode in background
python Orbital_django/manage.py runserver  # run Django development server
pkill -f webpack  # kill wepback watching mode after django dev server is terminated

rm -r ./Orbital_django/bundled_static/dev/*
