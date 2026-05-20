---
description: Run 6 security audit checks against the project (auth, IDOR, deployment, bots, secrets, input validation)
---

Run a comprehensive security audit of this project. Check all 6 areas:

## 1. Secure Authentication
Review the authentication system (NextAuth). Ensure passwords are securely hashed, sessions expire, email verification is enabled, password reset tokens expire, login attempts are rate limited, and authentication secrets are never exposed to the frontend. Refactor any insecure authentication logic.

## 2. Prevent IDOR (Insecure Direct Object Reference)
Review all API endpoints and database queries. Ensure every request verifies the logged-in user owns the data being accessed. Prevent insecure direct object reference vulnerabilities by enforcing ownership checks before reading, modifying, or deleting any resource.

## 3. Secure Deployment & Monitoring
Check the application for secure deployment config. Ensure HTTPS is enforced, secrets are stored securely, direct database access from public internet is restricted, and there's logging for authentication attempts, API errors, and unusual traffic patterns.

## 4. Prevent Abuse & Bot Attacks
Check for rate limiting on login attempts, API endpoints, account creation, and AI generation requests. Identify where bots could repeatedly call endpoints or scrape data.

## 5. Protect Secrets & API Keys
Scan the entire project for secrets and credentials. Ensure API keys, database service keys, and tokens are never exposed in frontend code or committed to the repository. Verify all secrets are in environment variables and only used on the server.

## 6. Validate & Sanitize User Input
Identify every place where user input enters the system including forms, APIs, uploads, and query parameters. Check for SQL injection, command injection, script injection (XSS), and unsafe file uploads. Verify strict input types are enforced.

For each area: report findings, severity (critical/high/medium/low), and fix immediately if critical.
