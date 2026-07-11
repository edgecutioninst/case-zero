FROM node:20-alpine AS builder 
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the client code
COPY . .

# API URL baked in during the build process
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build
RUN npm run build


# Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Only copy the essential production files 
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]