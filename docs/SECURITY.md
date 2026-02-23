# Security Policy

## Reporting a Vulnerability

Please report any security vulnerabilities to the project maintainers immediately via GitHub Issues or private communication.

## Daily Audit Protocol

The "Security Sentinel" agent performs a daily audit of the codebase, checking for:
- `eval()` usage
- Unsafe `JSON.parse`
- Hardcoded secrets
- XSS vulnerabilities
- Missing Zod validation

## Guidelines

1. **Input Validation**: All external input must be validated using Zod schemas.
2. **Secrets**: Never commit secrets to the repository. Use `.env` files.
3. **Dependencies**: Regularly audit dependencies for vulnerabilities.
4. **XSS Prevention**: Avoid `dangerouslySetInnerHTML`. React escapes by default.
5. **DoS Prevention**: Limit the size of inputs processed by the application.

## Audit Log

### 2026-02-22
- **Auditor**: Security Sentinel
- **Status**: Pass
- **Actions**:
  - Scanned for `eval()`, `JSON.parse()`, secrets, and XSS.
  - Added input size limit (10MB) to `scriptImporter` to prevent DoS.
  - Verified no hardcoded secrets or unsafe DOM manipulations.
