source env/bin/activate

pip install -r prod_reqs.txt

sudo service apache2 stop

python variora/manage.py makemigrations
python variora/manage.py migrate
sudo env/bin/python variora/manage.py collectstatic --noinput
sudo env/bin/python variora/manage.py installtasks

#sudo service memcached restart
echo 'flush_all' | netcat localhost 11211
sudo service apache2 start
