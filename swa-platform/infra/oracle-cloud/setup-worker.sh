#!/bin/bash
set -euo pipefail
# Setup worker su VPS Ubuntu 22.04 - eseguire via SSH: ssh -i ~/.ssh/swa_worker_key ubuntu@<IP> 'bash -s' < setup-worker.sh
# Richiede .env già configurato in swa-platform/.env (copiato da locale)

# Trova repo root (supporta sia ~/swa-platform che ~/swa-verticals/swa-platform)
if [ -f "swa-platform/.env" ]; then
  REPO_ROOT="."
elif [ -f "swa-verticals/swa-platform/.env" ]; then
  REPO_ROOT="swa-verticals"
else
  echo "ERRORE: .env non trovato in swa-platform/.env né swa-verticals/swa-platform/.env"
  echo "Esegui: cat > ~/swa-verticals/swa-platform/.env <<'EOS' ... oppure copia il file .env sul VPS"
  exit 1
fi

echo ">> Repo root: $REPO_ROOT (env in $REPO_ROOT/swa-platform/.env)"
echo ">> Aggiorno sistema e installo Docker..."
sudo apt-get update -qq
sudo apt-get install -y -qq docker.io git ffmpeg fonts-dejavu-core docker-compose-plugin 2>/dev/null || sudo apt-get install -y -qq docker.io docker-compose git ffmpeg fonts-dejavu-core
sudo usermod -aG docker $USER || true

echo ">> Abilito Docker..."
sudo systemctl enable --now docker

echo ">> Installo Node 22 + pnpm..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
sudo apt-get install -y -qq nodejs
sudo npm install -g pnpm@9 >/dev/null

echo ">> Build e avvio renderer..."
cd "$REPO_ROOT/swa-platform/infra/vps-renderer"
ln -sf ../../.env .env
if docker compose version >/dev/null 2>&1; then DC="docker compose"; else DC="docker-compose"; fi
echo ">> Uso: $DC"
$DC up -d --build
sleep 5
$DC ps
curl -s http://localhost:8080/health || echo "health check fallito - controlla $DC logs"

echo ""
echo ">> Worker attivo. Log: docker compose logs -f"
echo ">> Test: curl http://localhost:8080/health"
