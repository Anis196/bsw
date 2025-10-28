# Enabling HTTPS (SSL) for this static site

This document explains practical ways to enable HTTPS for your responsive static site and how to force HTTPS/HSTS. Pick the approach that matches your hosting.

## Quick summary
- For GitHub Pages or Netlify, HTTPS is provided automatically (free). Configure a redirect to HTTPS in settings or with a small config file.
- For your own server (Nginx/Apache), use Let's Encrypt (certbot) to obtain certificates, then add a server block to redirect HTTP → HTTPS and enable HSTS.
- For local development, use `mkcert` to create trusted local certificates and a simple HTTPS static server.

---

## GitHub Pages
1. Push your repository to GitHub and enable GitHub Pages in repository settings (branch: `main` or `gh-pages`).
2. In the Pages settings, ensure "Enforce HTTPS" is checked. GitHub will provision a certificate automatically.
3. Optionally add a CNAME file for a custom domain and configure DNS; GitHub will handle TLS for the domain when DNS is correct.

Notes:
- GitHub Pages forces HTTPS at the platform level when enabled.

## Netlify
1. Deploy the site to Netlify (connect GitHub/drag-and-drop). Netlify will provision a Let's Encrypt certificate automatically.
2. In Netlify site settings, enable "Enforce HTTPS." Netlify will redirect HTTP → HTTPS.

## Vercel
1. Deploy to Vercel. Vercel automatically handles TLS for the default domain and most custom domains.
2. Use the project settings to force HTTPS.

## Nginx (example) + Let's Encrypt (certbot)
1. Install certbot on your server.
2. Create an initial Nginx server block for `example.com` (replace with your domain), then run certbot to obtain a certificate.

Sample Nginx config (replace example.com):

server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/your-site;
    index index.html;

    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/your-site;
    index index.html;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}

After creating the `server` block for port 80, run:

```
# Install certbot (example for Ubuntu)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain cert and let certbot update Nginx config
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot will renew certificates automatically (via cron or systemd timer).

## Apache (.htaccess) redirect example
Add to your site vhost or `.htaccess` to redirect to HTTPS:

```
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Local development (mkcert)
1. Install mkcert: https://github.com/FiloSottile/mkcert
2. Create a cert for a local hostname:

```
mkcert -install
mkcert localhost 127.0.0.1
```

This produces `localhost+2.pem` and `localhost+2-key.pem` (filenames may vary). Use a simple Node static server that supports TLS, for example with `http-server`:

```
npm install -g http-server
http-server . -p 8443 --ssl --cert localhost+2.pem --key localhost+2-key.pem
```

Open https://localhost:8443/ to test.

## Forcing HTTPS in static hosting (redirects)
- Netlify: add a `_redirects` file with `/* https://%{host}%{request_uri} 301!`
- GitHub Pages: enable "Enforce HTTPS" in repository settings
- Vercel: enable force HTTPS in project settings

## Security notes
- HSTS (Strict-Transport-Security) should only be enabled after you have valid HTTPS and you're ready to commit browsers to HTTPS for the domain — removing HSTS from a domain is non-trivial if you include `preload`.
- Use secure ciphers and the recommended TLS config from Mozilla SSL guidelines.

---

If you want, I can:
- Add a `_redirects` file for Netlify and a `CNAME` placeholder.
- Create an `nginx.conf` sample file with a deployable snippet.
- Add a small `deploy.md` with step-by-step for GitHub Pages and Netlify tailored to this repo.

Which of those would you like me to add next?

---

Files added in this repo to help with deployment and HTTPS:

- `_redirects` — Netlify redirect to force HTTPS.
- `CNAME` — placeholder for custom domain (replace `example.com`).
- `assets/img/og-image.svg` — a simple Open Graph image used for social previews.
- `deploy/nginx.conf` — sample Nginx config with HTTP→HTTPS redirect and HSTS header.

Use the `_redirects` file when deploying to Netlify (it will enforce HTTPS redirects). Replace the domain in `CNAME` and `deploy/nginx.conf` when you have your production domain.

If you'd like, I can also:
- add a `_headers` file for Netlify containing HSTS and other security headers
- add a small `deploy-to-github-pages.md` with exact git commands to publish
- add a PNG fallback OG image (the SVG is widely supported but some services may rasterize differently)

