#!/bin/bash

# Punyo Go - Avtomatik Server O'rnatish Skripti
# Ubuntu 20.04/22.04/24.04 uchun

set -e # Xatolik bo'lsa skriptni to'xtatish

echo "=========================================="
echo "Punyo Go O'rnatish Skriptiga Xush Kelibsiz!"
echo "=========================================="

# 1. So'rovnomalar
read -p "Domen nomingizni kiriting (masalan, humo-tezkor.uz yoki api.sizning-domen.uz): " DOMAIN
read -p "GitHub Personal Access Token (repo ga kirish uchun): " GITHUB_TOKEN
read -p "Bot Tokenini kiriting: " BOT_TOKEN

# 2. Tizimni yangilash va kerakli dasturlarni o'rnatish
echo "--> Tizim yangilanmoqda va kerakli dasturlar o'rnatilmoqda..."
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git curl nginx certbot python3-certbot-nginx libpq-dev sqlite3

# 3. Node.js va npm ni o'rnatish
if ! command -v node &> /dev/null
then
    echo "--> Node.js o'rnatilmoqda..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# PM2 ni o'rnatish (bot uchun)
sudo npm install -g pm2

# 4. Loyihani yuklab olish (agar yo'q bo'lsa)
APP_DIR="/var/www/punyo_go"
if [ ! -d "$APP_DIR" ]; then
    echo "--> Loyiha GitHub'dan ko'chirilmoqda..."
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    git clone https://pmyge:${GITHUB_TOKEN}@github.com/pmyge/punyo_go.git $APP_DIR
else
    echo "--> Loyiha papkasi allaqachon mavjud, faqat yangilanmoqda..."
    cd $APP_DIR
    git pull origin main
fi

cd $APP_DIR

# 5. Backend'ni sozlash (Django)
echo "--> Backend sozlanmoqda..."
cd $APP_DIR/punyo_go_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn # Gunicorn server uchun kerak
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py collectstatic --noinput

# Backend uchun Systemd Service yaratish
echo "--> Backend uchun Systemd xizmati yaratilmoqda..."
cat <<EOF | sudo tee /etc/systemd/system/punyo_backend.service
[Unit]
Description=Gunicorn instance to serve Punyo Go Backend
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=$APP_DIR/punyo_go_backend
Environment="PATH=$APP_DIR/punyo_go_backend/venv/bin"
ExecStart=$APP_DIR/punyo_go_backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:$APP_DIR/punyo_go_backend/punyo_backend.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start punyo_backend
sudo systemctl enable punyo_backend

# 6. Frontend'ni sozlash (React)
echo "--> Frontend sozlanmoqda..."
cd $APP_DIR/punyo_go_frontend
# API URL'ni avtomatik o'zgartirish (api.js da qattiq yozilgan manzilni almashtirish)
sed -i "s|https://humo-tezkor.uz/api|https://$DOMAIN/api|g" src/api.js || true

npm install
npm run build

# 7. Botni sozlash (Aiogram)
echo "--> Telegram Bot sozlanmoqda..."
cd $APP_DIR/punyo_go_bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Bot .env faylini yaratish
cat <<EOF > .env
BOT_TOKEN=$BOT_TOKEN
API_BASE_URL=https://$DOMAIN/api
WEB_APP_SHOP_URL=https://$DOMAIN
WEB_APP_CHAT_URL=https://$DOMAIN/chat
WEB_APP_ORDERS_URL=https://$DOMAIN/orders
EOF

# Botni PM2 bilan ishga tushirish
pm2 start main.py --name "punyo-bot" --interpreter venv/bin/python
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# 8. Nginx ni sozlash
echo "--> Nginx sozlanmoqda..."
cat <<EOF | sudo tee /etc/nginx/sites-available/punyo_go
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend fayllari
    root $APP_DIR/punyo_go_frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API uchun proxy
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:$APP_DIR/punyo_go_backend/punyo_backend.sock;
    }

    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:$APP_DIR/punyo_go_backend/punyo_backend.sock;
    }

    location /static/ {
        alias $APP_DIR/punyo_go_backend/staticfiles/;
    }

    location /media/ {
        alias $APP_DIR/punyo_go_backend/media/;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/punyo_go /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 9. SSL Sertifikat o'rnatish (Certbot)
echo "--> SSL Sertifikat o'rnatilmoqda (HTTPS uchun)..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || echo "SSL o'rnatishda muammo bo'ldi. Domeningiz IP ga ulanmagan bo'lishi mumkin."

echo "=========================================="
echo "Tabriklaymiz! O'rnatish yakunlandi."
echo "Loyiha manzili: https://$DOMAIN"
echo "=========================================="
