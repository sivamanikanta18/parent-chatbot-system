# SMTP Production Setup Guide (Nodemailer)

This guide shows how to configure SMTP credentials securely for production email OTP delivery.

## 1) Choose an SMTP Provider

Use one of the following:

- Gmail Workspace SMTP (good for small scale)
- SendGrid SMTP relay
- Mailgun SMTP relay
- Amazon SES SMTP

For production, prefer SendGrid, SES, or Mailgun instead of personal Gmail accounts.

## 2) Create SMTP Credentials

Create credentials in your provider dashboard and collect:

- SMTP host (for example smtp.sendgrid.net)
- SMTP port (usually 587 for TLS)
- SMTP username
- SMTP password or app password
- From email address (for example no-reply@yourdomain.com)

## 3) Configure Environment Variables

Set these in your host secret manager, not in source code:

- MONGODB_URI (or MONGO_URI)
- JWT_SECRET
- NODE_ENV=production
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- SMTP_FROM

Recommended defaults:

- SMTP_PORT=587
- SMTP_SECURE=false

## 4) DNS and Domain Setup

If using your own domain for sender email, configure:

- SPF record
- DKIM signing
- DMARC policy

This improves delivery and prevents OTP emails from going to spam.

## 5) Required Production Safeguards

- Store SMTP_PASS only in secret manager.
- Rotate SMTP credentials periodically.
- Restrict SMTP account permissions to minimum required scope.
- Keep OTP and credentials out of logs.
- Add rate limiting on send-otp, verify-otp, and login endpoints.

## 6) Verification Checklist

- [ ] API starts with NODE_ENV=production.
- [ ] Startup does not fail environment validation.
- [ ] send-otp returns success and does not expose otp in response.
- [ ] OTP email arrives in inbox (not spam).
- [ ] verify-otp and login flow works end-to-end.

## 7) Throughput Scaling

- Use provider API limits and warm-up strategy.
- Monitor bounce, reject, and spam complaint metrics.
- Set alerts for delivery failure spikes.
