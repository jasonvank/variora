# assume in python virtual environment

python Orbital_django/manage.py makemigrations
python Orbital_django/manage.py migrate
sudo env/bin/python Orbital_django/manage.py collectstatic
sudo env/bin/python Orbital_django/manage.py installtasks

sudo service memcached restart
sudo service apache2 restart
