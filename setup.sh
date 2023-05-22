sudo apt update
sudo apt upgrade
sudo apt install nginx -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&
sudo apt-get install -y nodejs
sudo npm install -g yarn
sudo apt install python3 python3-pip python3-venv tmux htop

sudo apt install mysql-server
echo "create user ExposedUser@localhost identified by 'ExposedPassword' ;" \
echo "grant all privileges on *.* to ExposedUser@localhost with grant option ;" \
echo "\q" | sudo mysql 
sudo apt-get install mysql-connector-python
pip install mysql-connector-python

sudo ufw enable
sudo ufw allow "Nginx HTTP"
sudo ufw allow 3000
sudo ufw allow SSH

mkdir entreaties
cd ./entreaties
sudo git init
sudo git pull https://github.com/HobbyHobbyist/Entreaties
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

cd ./frontend
sudo yarn add package.json

cd ~
mkdir entreaties_database
sudo git init
cd ./entreaties_database
sudo git pull https://github.com/HobbyHobbyist/EntreatiesDatabase
python3 main.py
cd ../
