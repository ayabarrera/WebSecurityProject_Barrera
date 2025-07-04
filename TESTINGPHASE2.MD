::::info
**Learn about Project Phase 2**
**Check how to **

:::spoiler Click to learn more :wave:
Set column properties and quantities:

```
  column-count: 2;
  column-gap: 20px;
  max-width: 100%;
```

Set to cancel the text layout width restriction. Removing the syntax will restore HackMD's default text layout width:

```
.markdown-body, .ui-infobar {
    max-width: unset !important;
}
```

To ensure that Markdown syntax works correctly within a `div` container, please add a blank line before starting to write Markdown.

:pencil2: Feel free to customize it.
:::
::::

<style>
.two-column-layout {
  column-count: 2; /* Set column number */
  column-gap: 20px;
  max-width: 100%;
  overflow: hidden;
}

/* Media query for mobile devices */
@media (max-width: 768px) {
  .two-column-layout {
    column-count: 1; /* Switch to single column on small screens */
    column-gap: 0;   /* Optional: Set gap to 0 for single column */
  }
}

.markdown-body, .ui-infobar {
    max-width: unset !important;
}

.two-column-layout ul, 
.two-column-layout ol {
  margin: 0;
  padding-left: 20px;
}

.two-column-layout strong {
  font-weight: bold;
}

.two-column-layout em {
  font-style: italic;
}
    
.two-column-layout h1,
.two-column-layout h2,
.two-column-layout h3,
.two-column-layout h4,
.two-column-layout h5,
.two-column-layout h6 {
    margin-top: 0;    
}
</style>



---
# Security Testing & Debugging Checklist

This section documents the testing strategies used to validate the security and functionality of the authentication and authorization systems.


---

##    A. Local Authentication Testing

<div class="two-column-layout">
    
###  Account Creation  using Postman

```
{
  "username": "usertesting",
  "email": "test@example.com",
  "password": "StrongPass123!"
}

```
&nbsp;
    
1. Register 
    - Choose body -> raw -> JSON
    - POST /auth/register
2. Confirmation
    ✅ User created
    ✅ Password stored as hash in DB (Argon2)
    
</div>

&nbsp;



---


<div class="two-column-layout">
    
### Account Log in

```
{
  "email": "test@example.com",
  "password": "StrongPass123!"
}

```
&nbsp;
&nbsp;

1. Postman
    - POST /auth/login
2. Confirmation
    ✅ Receives HttpOnly cookies (token, refreshToken)
    ✅ JWT has correct payload (id, role)
    ✅ token expires in 15 mins, refreshToken in 7 days
    
</div>

&nbsp;


---


<div class="two-column-layout">
    
### Protected Routes

```
{
 ADD IMAGE EXAMPLE HERE
}

```
&nbsp;
&nbsp;

1. Postman
    - GET /profile or /dashboard
2. Confirmation
    ✅ Access granted if logged in
    ❌ Access denied if not logged in
    
</div>

&nbsp;

---

##    B. Google OAuth
<div class="two-column-layout">
    
###  Log in

```
{
  INSERT IMAGE
}

```
&nbsp;
    
1. Visit: https://localhost:3000/auth/google
2. Confirmation
    ✅ User created with role User
    ✅ Redirected to /dashboard
    ✅ Can access protected routes
    
</div>


---

&nbsp;


##   C. Authorization (RBAC) Testing
<div class="two-column-layout">
    
###  User Access

```
  {
  "email": "test@example.com",
  "password": "StrongPass123!"
  }

```
&nbsp;
    
1. Login as regular user
2. Try accessing /admin
    ❌ Should return 403 Access Denied
2.  Admin Access - Create a new user with admin role
    ✅ Retry /admin
    ✅ Should return admin content


</div>

&nbsp;

---

<div class="two-column-layout">
    
### Token Refresh Testing
    
&nbsp;
&nbsp;

```
{
 ADD IMAGE EXAMPLE HERE
}

```
&nbsp;
    
&nbsp;


1. Expired Token
    - Wait for access token to expire (15 mins or shorten temporarily)
    - Request protected route
    ❌ Returns 401 Token expired
2. Refresh Token
    - POST /auth/refresh-token
    - Confirm:
    ✅ New access token issued
    ✅ Protected route access restored
    
</div>

&nbsp;

---

<div class="two-column-layout">
    
### Brute Force Protection
&nbsp;

```
{
"error": "Too many login attempts.
Please try again after 15 minutes."
}


```
&nbsp;
    
&nbsp;


1. Rate Limiting
    - Send 6+ failed login attempts
2. Confirmation
    ❌ Login blocked with: "ERROR"
    
</div>

&nbsp;

---

<div class="two-column-layout">
    
### CSRF Protection
&nbsp;

```
{
    ADD IMAGE HERE
}


```
&nbsp;
    
&nbsp;


1. No CSRF Token
    - Submit POST without csrfToken
    ❌ Should fail CSRF validation
2. With CSRF Token
    - Retrieve req.csrfToken() and include in request
    ✅ Should pass CSRF validation
    
</div>

&nbsp;

---

<div class="two-column-layout">
    
### Account Enumeration Prevention
&nbsp;

```
{
    ADD IMAGE HERE
}


```
&nbsp;
    
1. Try login or password reset with non-existent email
2. Confirmation
    ✅ Response is generic: "Invalid credentials"
    ❌ Should NOT reveal "User not found"
    
</div>

&nbsp;

---

<div class="two-column-layout">
    
### Session Fixation Protection
&nbsp;

```
{
    ADD IMAGE HERE
}


```
&nbsp;
    
1. Before login, inspect session cookie
2. After login, check that session ID:
    ✅ Has changed
    ✅ Is unique per user
    
</div>

&nbsp;

---

<div class="two-column-layout">
    
### Account Enumeration Prevention
&nbsp;

```
{
    ADD IMAGE HERE
}


```
&nbsp;
    
1. Try login or password reset with non-existent email
2. Confirmation
    ✅ Response is generic: "Invalid credentials"
    ❌ Should NOT reveal "User not found"
    
</div>

&nbsp;

---

<div class="two-column-layout">
    
### JWT Integrity & Tampering Test
&nbsp;

```
{
    ADD IMAGE HERE
}


```
&nbsp;
    
1. Decode token on jwt.io
2. Change role to "Admin", re-sign token with fake secret
3. Send request with tampered token
    ❌ Should return 403 Invalid token
    
</div>

&nbsp;

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