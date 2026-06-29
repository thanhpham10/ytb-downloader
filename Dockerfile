FROM node:20-slim

# Install Python, FFmpeg, build tools, unzip (for deno), and python3-pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip curl ffmpeg build-essential unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Deno (strongly recommended by yt-dlp for EJS challenge solving)
RUN curl -fsSL https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip -o deno.zip && \
    unzip deno.zip -d /usr/local/bin && \
    rm deno.zip

# Install yt-dlp via pip3 to ensure all required EJS assets are packaged
RUN pip3 install --break-system-packages -U "yt-dlp[default]"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
