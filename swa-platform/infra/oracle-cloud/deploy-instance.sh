#!/bin/bash
set -euo pipefail
# Deploy swa-worker su Oracle Cloud Free Tier (eu-milan-1 = single AD)
# Uso in Cloud Shell: bash swa-platform/infra/oracle-cloud/deploy-instance.sh

echo ">> Ricavo tenancy OCID..."
COMPARTMENT_ID=$(oci search resource structured-search --query-text "query instance resources" | grep -o "ocid1.tenancy[^\"]*" | head -1)
if [ -z "$COMPARTMENT_ID" ]; then echo "ERRORE: COMPARTMENT_ID vuoto"; exit 1; fi
echo "COMPARTMENT_ID=$COMPARTMENT_ID"

VCN_ID=$(oci network vcn list --compartment-id "$COMPARTMENT_ID" --query "data[0].id" --raw-output)
echo "VCN_ID=$VCN_ID"

SUBNET_ID=$(oci network subnet list --compartment-id "$COMPARTMENT_ID" --vcn-id "$VCN_ID" --all | awk '/public subnet/{f=1} f && /ocid1.subnet/{print; exit}' | grep -o "ocid1.subnet[^\"]*")
echo "SUBNET_ID=$SUBNET_ID"

IMAGE_ID="ocid1.image.oc1.eu-milan-1.aaaaaaaaviptg4fgkl27hzqahxkcta3ujejbzsvvhslaskigifodcwhyxi7q"
echo "IMAGE_ID=$IMAGE_ID"

mkdir -p ~/.ssh
if [ ! -f ~/.ssh/swa_worker_key ]; then
  ssh-keygen -t rsa -b 2048 -f ~/.ssh/swa_worker_key -N "" -q
  echo "Chiave generata in ~/.ssh/swa_worker_key"
else
  echo "Chiave esistente in ~/.ssh/swa_worker_key"
fi

echo ">> Lancio istanza swa-worker su AD-1 (Milan single-AD)..."
oci compute instance launch \
  --compartment-id "$COMPARTMENT_ID" \
  --availability-domain "yjft:EU-MILAN-1-AD-1" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus":1,"memoryInGBs":6}' \
  --image-id "$IMAGE_ID" \
  --subnet-id "$SUBNET_ID" \
  --display-name "swa-worker" \
  --ssh-authorized-keys-file ~/.ssh/swa_worker_key.pub \
  --assign-public-ip true \
  --wait-for-state RUNNING \
  --output table

echo ""
echo ">> IP pubblico:"
oci compute instance list --compartment-id "$COMPARTMENT_ID" --display-name "swa-worker" --query 'data[0]."public-ip"' --raw-output
echo ""
echo ">> Connetti: ssh -i ~/.ssh/swa_worker_key ubuntu@<IP>"
echo ">> Poi: bash swa-platform/infra/oracle-cloud/setup-worker.sh"
