sudo --set-home pip install --upgrade pip
npm i -g npm

npm install webpack webpack-cli yarn -g
yarn install

sudo --set-home pip install virtualenv
virtualenv env
./env/bin/activate
pip install -r dev_reqs.txt

