# Security Guidelines

## ⚠️ IMPORTANT: Never Commit Secrets!

This repository uses Google Calendar API which requires credentials. **NEVER commit secrets to git!**

## What NOT to commit:

- ❌ `client_secret*.json` files
- ❌ `config.js` with real credentials
- ❌ API keys or tokens
- ❌ Private keys or certificates

## What TO commit:

- ✅ `config.example.js` (template with placeholders)
- ✅ `.gitignore` (to prevent accidental commits)

## Setup Instructions:

1. Copy `config.example.js` to `config.js`
2. Fill in your actual credentials in `config.js`
3. `config.js` is already in `.gitignore` and won't be committed

## If you accidentally committed a secret:

1. **Immediately revoke the secret** in Google Cloud Console
2. Remove it from git history (see below)
3. Create a new secret
4. Update `config.js` with the new secret

## Removing secrets from git history:

If you've already committed a secret (but haven't pushed), you can remove it:

```bash
# Remove from current commit
git rm --cached client_secret*.json

# Remove from all commits in history (DANGEROUS - only if not pushed!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch client_secret*.json' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if you're sure!)
git push --force-with-lease
```

**Warning:** If you've already pushed secrets, you MUST:
1. Revoke them immediately
2. Create new secrets
3. Consider the old secrets compromised

