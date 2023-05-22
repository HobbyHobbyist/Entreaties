sudo apt update
sudo apt install nginx-y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&
sudo apt-get install -y nodejs
Step 7: sudo apt install python3 python3-pip python3-venv tmux htop


sudo ufw enable
sudo ufw allow "Nginx HTTP"
sudo ufw allow 3000
sudo ufw allow SSH

sudo mkdir entreaties
cd entreaties
git init
HobbyHobbyist n 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 n | git pull https://github.com/HobbyHobbyist/Entreaties
