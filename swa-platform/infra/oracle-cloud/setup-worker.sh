#!/bin/bash
set -euo pipefail
# Setup worker su VPS Ubuntu 22.04 - eseguire via SSH: ssh -i ~/.ssh/swa_worker_key ubuntu@<IP> 'bash -s' < setup-worker.sh
# Richiede .env già configurato in swa-platform/.env (copiato da locale)

if [ ! -f "swa-platform/.env" ]; then
  echo "ERRORE: swa-platform/.env non trovato. Copialo prima: scp -i ~/.ssh/swa_worker_key -r swa-platform ubuntu@<IP>:~/"
  exit 1
fi

echo ">> Aggiorno sistema e installo Docker..."
sudo apt-get update -qq
sudo apt-get install -y -qq docker.io docker-compose-plugin git ffmpeg fonts-dejavu-core
sudo usermod -aG docker $USER || true

echo ">> Abilito Docker..."
sudo systemctl enable --now docker

echo ">> Installo Node 22 + pnpm..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
sudo apt-get install -y -qq nodejs
sudo npm install -g pnpm@9 >/dev/null

echo ">> Build e avvio renderer..."
cd swa-platform/infra/vps-renderer
# usa il .env di swa-platform (symlink)
ln -sf ../../.env .env
docker compose up -d --build
sleep 5
docker compose ps
curl -s http://localhost:8080/health || echo "health check fallito - controlla docker logs"

echo ""
echo ">> Worker attivo. Log: docker compose logs -f"
echo ">> Test: curl http://localhost:8080/health"
