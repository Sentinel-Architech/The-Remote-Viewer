FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV RUSTUP_HOME=/usr/local/rustup
ENV CARGO_HOME=/usr/local/cargo
ENV PATH="/usr/local/cargo/bin:/root/.local/share/solana/install/active_release/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    git \
    udev \
    libudev-dev \
    cmake \
    libclang-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable

# Install Solana CLI (includes cargo-build-sbf and current SBF tools)
ARG SOLANA_VERSION=v1.18.26
RUN sh -c "$(curl -sSfL https://release.solana.com/${SOLANA_VERSION}/install)"

# Install Anchor CLI matching target framework specifications
ARG ANCHOR_VERSION=0.30.1
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v${ANCHOR_VERSION} anchor-cli --locked

WORKDIR /workspace
ENTRYPOINT ["anchor", "build"]
