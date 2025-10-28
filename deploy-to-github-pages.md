# Deploy to GitHub Pages (exact commands for Windows `cmd.exe`)

These steps will create a GitHub repository, push the current site, and use the included GitHub Actions workflow to publish to GitHub Pages.

Prerequisites
- Git installed and available in your PATH
- A GitHub account
- (Optional) `gh` CLI if you want to create the remote repository from the command line

Replace `USERNAME` and `REPO` below with your GitHub username and desired repository name.

1) Initialize a local repository (only if you haven't already):

```cmd
cd path\to\your\project
git init
git add .
git commit -m "Initial site commit"
```

2) Create a GitHub repo and add the remote:

Option A — create the repo on GitHub manually via the website, then run:

```cmd
git branch -M main
git remote add origin https://github.com\USERNAME\REPO.git
git push -u origin main
```

Option B — create the repo with the GitHub CLI (`gh`) (if installed):

```cmd
gh repo create USERNAME/REPO --public --source=. --remote=origin --push
```

3) What we've added to this repo to help GitHub Pages
- `CNAME` — placeholder file at project root. Replace `example.com` with your custom domain (if you have one). Commit and push to ensure GitHub Pages config picks it up.
- `.github/workflows/deploy-pages.yml` — GitHub Actions workflow that uploads the repository content and deploys to GitHub Pages automatically when you push to `main`.

4) Enable GitHub Pages (if needed)
- Go to your repository Settings → Pages. Under "Build and deployment," choose "GitHub Actions" (the workflow will deploy automatically). If Pages isn't already set, set the source to `GitHub Actions` or `main`/`(root)` depending on which method you prefer.
- In Pages settings, enable "Enforce HTTPS" once the site is published.

5) Confirm deployment
- After you push to `main`, open the repository's Actions tab and watch the `Deploy Pages` job. When it completes, the Pages URL will be visible in the Pages settings (or in the Actions job output).

Notes and troubleshooting
- If you use a custom domain, replace `CNAME` with your domain and verify your DNS A/ALIAS/CNAME records point to GitHub Pages as per GitHub's instructions.
- If your site does not appear, check the Actions logs (Actions → workflow run) for errors. Common issues: missing files, large files blocked, or incorrect branch.
- If the repo is private, GitHub Pages from `main` may require extra settings or a paid plan; the workflow still works for public repos.

If you want, I can:
- attempt to create the remote repo and push for you now (I'll need the repo URL or your permission to run the `gh repo create` command),
- or provide a single script you can run locally to perform all steps.
