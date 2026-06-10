#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Capital Lab — RSA Key Generator for JWT RS256 signing
# Run once during initial setup. Store output securely (e.g. .env or secrets manager).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "Generating RSA-2048 key pair for JWT RS256 signing..."

# Generate private key (PKCS#8 format)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private_key.pem 2>/dev/null

# Extract public key
openssl pkey -in private_key.pem -pubout -out public_key.pem 2>/dev/null

# Base64 encode (no line breaks)
PRIVATE_KEY_B64=$(base64 -i private_key.pem | tr -d '\n')
PUBLIC_KEY_B64=$(base64 -i public_key.pem | tr -d '\n')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Add these to appsettings.Development.json or User Secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Jwt__PrivateKeyBase64: $PRIVATE_KEY_B64"
echo ""
echo "  Jwt__PublicKeyBase64:  $PUBLIC_KEY_B64"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate AES-256 encryption key (32 bytes)
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "  Encryption__Key:       $ENCRYPTION_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Cleaning up PEM files..."

rm -f private_key.pem public_key.pem
echo "  Done. Store keys securely — do NOT commit them to version control."
