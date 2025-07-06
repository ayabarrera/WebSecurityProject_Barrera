# Security Testing & Debugging Checklist

This section documents the testing strategies used to validate the security and functionality of the authentication and authorization systems.

*See Phase 2 Setting up Documentation* [PHASE2.md](PHASE2.md)

---

##   A. Local Authentication Testing
    
###  Account Creation  using Postman

```
{
  "username": "usertesting",
  "email": "test@example.com",
  "password": "StrongPass123!"
}

```
    
1. Register 
    - Choose body -> raw -> JSON
    - POST /auth/register
2. Confirmation
    ✅ User created
    ✅ Password stored as hash in DB (Argon2)
    
---

### Account Log in

```
{
  "email": "test@example.com",
  "password": "StrongPass123!"
}

```

1. Postman
    - POST /auth/login
2. Confirmation
    ✅ Receives HttpOnly cookies (token, refreshToken)
    ✅ JWT has correct payload (id, role)
    ✅ token expires in 15 mins, refreshToken in 7 days
    
---

### Protected Routes

1. Postman
    - GET /profile or /dashboard
2. Confirmation
    ✅ Access granted if logged in
    ❌ Access denied if not logged in


---

##   B. Google OAuth
###  Log in
    
1. Visit: https://localhost:3000/auth/google
2. Confirmation
    ✅ User created with role User
    ✅ Redirected to /dashboard
    ✅ Can access protected routes
---


##   C. Authorization (RBAC) Testing

###  User Access

1. Login as regular user
2. Try accessing /admin
    ❌ Should return 403 Access Denied
2.  Admin Access - Create a new user with admin role
    ✅ Retry /admin
    ✅ Should return admin content

---

### Token Refresh Testing

1. Expired Token
    - Wait for access token to expire (15 mins or shorten temporarily)
    - Request protected route
    ❌ Returns 401 Token expired
2. Refresh Token
    - POST /auth/refresh-token
    - Confirm:
    ✅ New access token issued
    ✅ Protected route access restored
    
---
    
### Brute Force Protection

```
{
"error": "Too many login attempts.
Please try again after 15 minutes."
}


```
1. Rate Limiting
    - Send 6+ failed login attempts
2. Confirmation
    ❌ Login blocked with: "ERROR"

---
### CSRF Protection

1. No CSRF Token
    - Submit POST without csrfToken
    ❌ Should fail CSRF validation
2. With CSRF Token
    - Retrieve req.csrfToken() and include in request
    ✅ Should pass CSRF validation
    
---
    
### Account Enumeration Prevention
    
1. Try login or password reset with non-existent email
2. Confirmation
    ✅ Response is generic: "Invalid credentials"
    ❌ Should NOT reveal "User not found"

---
    
### Session Fixation Protection

1. Before login, inspect session cookie
2. After login, check that session ID:
    ✅ Has changed
    ✅ Is unique per user
    
---
    
### Account Enumeration Prevention
1. Try login or password reset with non-existent email
2. Confirmation
    ✅ Response is generic: "Invalid credentials"
    ❌ Should NOT reveal "User not found"
---


### JWT Integrity & Tampering Test
1. Decode token on jwt.io
2. Change role to "Admin", re-sign token with fake secret
3. Send request with tampered token
    ❌ Should return 403 Invalid token
    
---

#    Reflection: Security Testing
- [ ] Verified secure password hashing using Argon2.
- [ ] Checked JWT generation, expiration, and refresh token flow using Postman.
- [ ] Simulated:
    - Expired token access
    - Unauthorized role access
    - Manual tampering of cookies
- [ ]  Implemented and validated:
    - HttpOnly, Secure, and SameSite cookie flags
    - CSRF protection with csurf
    - Rate limiting with express-rate-limit (max 5 login attempts)
    - Prevented account enumeration by using non-specific login error messages.
    - Ensured only authorized users can access protected routes like /dashboard, /profile, /guilds, and /admin.