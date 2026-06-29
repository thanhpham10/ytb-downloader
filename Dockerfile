FROM node:20-slim

# Install Python (for yt-dlp), FFmpeg, and build tools (for native npm modules like better-sqlite3)
RUN apt-get update && \
    apt-get install -y python3 curl ffmpeg build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp binary directly
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

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
