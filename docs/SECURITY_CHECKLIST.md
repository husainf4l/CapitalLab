# Security Checklist

- Replace all sample secrets before staging and production.
- Store JWT private keys and encryption keys in the deployment secret manager.
- Enforce HTTPS at the edge and API gateway.
- Restrict Hangfire to authenticated SuperAdmin users.
- Confirm CORS allows only the deployed frontend origins.
- Enable PostgreSQL encrypted storage and daily backups.
- Rotate SMTP, SMS, WhatsApp, and push provider credentials.
- Run dependency audit before release.
- Verify audit logs capture privileged actions.
- Confirm demo accounts are disabled or password-rotated outside demo environments.
