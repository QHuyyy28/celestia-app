# Frontend Deployment Guide

## Problem
SPA (Single Page Application) routes return 404 when page is refreshed because the server tries to find the actual file instead of letting React Router handle the routing.

## Solution
Redirect all non-asset routes to `index.html` so React Router can handle the routing client-side.

## Deployment Platforms

### 1. Vercel (Recommended for React)
✅ Auto-configured with `vercel.json`

**Setup:**
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts

**Configuration:**
- `vercel.json` handles all routing redirects
- Environment variables configured via Vercel Dashboard

**Set Environment Variables:**
```bash
vercel env add VITE_API_URL "https://your-api-domain.com/api"
```

---

### 2. Netlify
✅ Auto-configured with `public/_redirects`

**Setup:**
1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

**Configuration:**
- `public/_redirects` handles all routing
- `netlify.toml` optional for advanced config

**Set Environment Variables in Netlify:**
- Go to Site settings → Build & deploy → Environment
- Add: `VITE_API_URL = https://your-api-domain.com/api`

---

### 3. GitHub Pages
Need to set `base` in `vite.config.js` and use `HashRouter`:

```javascript
export default defineConfig({
  base: '/celestia-app/', // if repo name is not your-username.github.io
  // ... rest of config
})
```

---

### 4. Apache (Shared Hosting)
✅ Auto-configured with `public/.htaccess`

**Requirements:**
- Apache with `mod_rewrite` enabled

**Setup:**
1. Build: `npm run build`
2. Upload `dist` folder contents to `public_html`
3. `.htaccess` file should be in root

**Enable mod_rewrite:**
```bash
# SSH into server and run
a2enmod rewrite
systemctl restart apache2
```

---

### 5. Nginx
✅ Use `nginx.conf` as template

**Setup:**
```bash
# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/celestia
sudo ln -s /etc/nginx/sites-available/celestia /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### 6. Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Environment Variables

### For Production
Create `.env.production` or set via hosting platform:

```
VITE_API_URL=https://your-api-domain.com/api
```

### For Testing
```
VITE_API_URL=http://localhost:5000/api
```

---

## Testing Deployment Locally

### Build and preview
```bash
npm run build
npm run preview
```

### With Docker
```bash
docker build -t celestia-frontend .
docker run -p 3000:80 celestia-frontend
```

---

## Troubleshooting

### Still getting 404 on refresh?
1. ✅ Check if build output is in `dist/`
2. ✅ Verify `.htaccess`, `_redirects`, or `vercel.json` is deployed
3. ✅ Confirm `index.html` is in root of dist folder
4. ✅ Check browser console for actual errors

### API requests still failing?
1. Check `VITE_API_URL` is set correctly
2. Verify backend CORS allows frontend domain
3. Check browser DevTools Network tab

---

## Production Checklist

- [ ] `VITE_API_URL` set to production backend URL
- [ ] `NODE_ENV=production`
- [ ] Routing fallback configured
- [ ] CORS properly configured on backend
- [ ] SSL certificate enabled (HTTPS)
- [ ] Environment variables secured (never commit `.env`)
- [ ] Build tested locally with `npm run preview`
