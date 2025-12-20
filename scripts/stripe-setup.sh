#!/bin/bash

# Stripe CLI setup script
# Downloads Stripe CLI if not available

STRIPE_CLI_PATH="./node_modules/.bin/stripe-cli-bin"
STRIPE_VERSION="1.21.0"

# Detect OS and architecture
detect_platform() {
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  
  case "$OS" in
    darwin) OS="mac-os" ;;
    linux) OS="linux" ;;
    *) echo "Unsupported OS: $OS"; exit 1 ;;
  esac
  
  case "$ARCH" in
    x86_64) ARCH="x86_64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
  esac
  
  echo "${OS}_${ARCH}"
}

# Download Stripe CLI if not present
if [ ! -x "$STRIPE_CLI_PATH" ]; then
  echo "📦 Downloading Stripe CLI..."
  PLATFORM=$(detect_platform)
  URL="https://github.com/stripe/stripe-cli/releases/download/v${STRIPE_VERSION}/stripe_${STRIPE_VERSION}_${PLATFORM}.tar.gz"
  
  mkdir -p "$(dirname "$STRIPE_CLI_PATH")"
  curl -sL "$URL" | tar -xz -C "$(dirname "$STRIPE_CLI_PATH")"
  mv "$(dirname "$STRIPE_CLI_PATH")/stripe" "$STRIPE_CLI_PATH"
  chmod +x "$STRIPE_CLI_PATH"
  
  echo "✅ Stripe CLI installed"
fi

# Run the command passed as arguments
exec "$STRIPE_CLI_PATH" "$@"

