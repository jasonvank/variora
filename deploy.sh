source env/bin/activate

pip install -r prod_reqs.txt

python variora/manage.py makemigrations
python variora/manage.py migrate

sudo env/bin/python variora/manage.py collectstatic --noinput

sudo env/bin/python variora/manage.py installtasks
sudo env/bin/python variora/manage.py showtasks

# invalidate content in memcached
python variora/manage.py invalidate_cachalot -c default

# ask apache to reload Django, this command works because Django runs in daemon mode:
# https://stackoverflow.com/a/4206134/6159872
# https://code.google.com/archive/p/modwsgi/wikis/ReloadingSourceCode.wiki
touch variora/variora/wsgi.py
