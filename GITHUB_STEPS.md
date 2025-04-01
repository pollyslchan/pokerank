# Steps to Push to GitHub

1. Create a new repository on GitHub
   - Go to https://github.com/new
   - Name your repository (e.g., "pokemon-rankings")
   - Choose if it should be public or private
   - Don't initialize it with README, .gitignore, or license

2. Create a Personal Access Token (if you don't already have one)
   - Go to GitHub → Settings → Developer Settings → Personal Access Tokens
   - Click "Generate new token"
   - Give it a name and appropriate permissions (at least repo access)
   - Copy the token when it's shown (you won't see it again)

3. Add your GitHub repository as a remote and push
   ```bash
   git remote add origin https://github.com/pollyslchan/pokemon-rankings.git
   git branch -M main
   git push -u origin main
   ```
   - When prompted for username: enter your GitHub username
   - When prompted for password: enter your Personal Access Token

4. Verify your code is on GitHub
   - Visit https://github.com/pollyslchan/pokemon-rankings
   - You should see your code and README in the repository

Note: You can also use SSH keys instead of a Personal Access Token for a more secure connection to GitHub. See GitHub's documentation for details.