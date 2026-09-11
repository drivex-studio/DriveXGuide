FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

# SQLite file lives here; mount a volume or Cloud Run's ephemeral disk works
# for light traffic, but note it resets on new revisions/instance churn —
# see README "Storage note for Cloud Run".
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "index.js"]
