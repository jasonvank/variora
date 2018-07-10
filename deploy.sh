source env/bin/activate

pip install -r prod_reqs.txt

sudo service apache2 stop

python variora/manage.py makemigrations
python variora/manage.py migrate

sudo env/bin/python variora/manage.py collectstatic --noinput

sudo env/bin/python variora/manage.py installtasks
sudo env/bin/python variora/manage.py showtasks

#sudo service memcached restart
python variora/manage.py invalidate_cachalot -c default
sudo service apache2 start
