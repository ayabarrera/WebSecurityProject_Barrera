# PHASE 2 - QUEST APP

## Overview

This phase builds on the previous authentication setup by enhancing security, adding authorization with role-based access control (RBAC), and improving session management. The project uses:

- **Argon2** for secure password hashing  
- **Google OAuth 2.0** for single sign-on  
- **JWT tokens** with short expiration times  
- **Express-session** for session handling  
- **Role-based access control (RBAC)** to restrict routes based on user roles  
- **Password reset flow** with secure token and email link

---
## Updated Project Structure & Key Files

* app.js — Server setup, middleware, route mounting
* models/User.js — Mongoose schema with fields for username, email, hashed password, role, password reset tokens
* routes/auth.js — Authentication routes (register, login, logout, Google OAuth, password reset)
* routes/dashboard.js — Protected routes example requiring authentication and role authorization
* config/passport.js — Passport.js Google OAuth strategy configuration

```
Barrera_Phase1/
├── App.js
├── models
    └── User.js
├── package.json
├── config    
    └── passport.js
└── cert/
    ├── server.key
    └── server.cert
└── routes/
    ├── guilds.js
    ├── profile.js
    ├── quests.js
    └── routes.js
    └── dashboard.js
└── public/
    ├── images/
        ├── aya.png
        └── bg.png
    ├── index.html
    ├── main.js
    └── style.css
└── .env
└── app.js
```
---
## Setup Instructions
1. Clone the repository:
```
git clone https://github.com/ayabarrera/WebSecurity_Phase1
cd <project-folder>
```

2. Install all dependencies:
```
npm install express mongoose dotenv passport passport-google-oauth20 express-session cookie-parser jsonwebtoken argon2 helmet nodemailer express-rate-limit csurf

```

3. Create .env file in the root directory:
```
MONGO_URI=mongodb://localhost:27017/quest-app
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://localhost:3000/auth/google/callback
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```
> *To get the Client ID and Secret, create a project on Google Cloud Console and configure OAuth 2.0 credentials with redirect URI.*
> 
> *Create an App Password in Gmail for EMAIL_PASS (⚠️ not your regular password!)*
> 1. Go to your Google Account Security Page
> 2. Enable 2-Step Verification (if still not on)
> 3. After enabling, go to [Apps Password Page](https://myaccount.google.com/apppasswords)
> 4. Select: App -> Mail, Device -> Other
> 5. Click Generate 
> 6. You'll get a 16-character like password like this abcd efgh ijkl mnop
> 7. Use in .env EMAIL_PASS=abcdefghijklmnop (remove spaces)
> 
> !! 🛑 Never push .env to GitHub, ensure it is listed in your gitignore 🛑 !!

4. Run MongoDB locally:
```
mongod
```

5. Run App
```
node app.js
```

## How to Test Locally

1. Register a new user (using Postman)
> POST https://localhost:3000/auth/register
> Body -> Raw -> JSON 
> type
``
{
  "username": "testing1234",
  "email": "test@example.com",
  "password": "strongPassword123"
}
``

2. Login registered user
> POST https://localhost:3000/auth/login
> Body -> Raw -> JSON 
> type
``
{
  "email": "test@example.com",
  "password": "strongPassword123"
}
``
3. Login with Google OAuth
> Visit https://localhost:3000/auth/google in your browser and follow Google sign-in flow.

4. Test protected routes
> Access routes like https://localhost:3000/dashboard which require valid login and proper roles.

5. Password Reset Flow
> POST https://localhost:3000/auth/forgot-password with JSON { "email": "yourgmail.com" }
> Check your email for the reset link
> Open the link and submit a new password via POST to /auth/reset-password/:token

## Notes
* HTTPS is configured for secure communication in development using self-signed certificates.
* Cookies are HTTP-only, secure, and use SameSite=Strict to enhance security.
* JWT tokens expire after 15 minutes to minimize risk.
* Sessions managed with express-session and integrated with Passport.js for OAuth.


---

# Part B: Reflection Checkpoint — Role-Based Access Control (RBAC)

## Access Control Structure
- Our access control system is based on Role-Based Access Control (RBAC), where each user is assigned a role upon registration or login (e.g., "User", "Admin", "Moderator").
- This role is stored both in the database and encoded in the JWT token after login.

We implemented middleware to check the user's role and restrict access to protected routes accordingly:
* /profile: accessible to any authenticated user
* /dashboard: shared by all roles, but returns content dynamically based on role
* /admin: restricted to users with role === 'Admin'

This setup allows us to:
* Reuse authentication logic
* Easily add more roles or adjust access levels
* Keep each route focused and maintainable

##    Roles Chosen


| Role         | Description                            | 
| --------     | --------                               |
| User         | Default role for regular users         | 
| Moderator    | Potential content manager or approver  | 
| Admin        | Full access to protected admin routes  | 

> We started with these three because they offer a good balance of flexibility without being too complex for our current scope. Adding more would be easy if needed.


##    Security vs. User Experience Trade-Offs
* I chose JWT + cookie-based authentication (httpOnly, secure, sameSite) for strong session security.
* This protects against XSS but makes testing and development more difficult (e.g., cookies don't show in Postman unless HTTPS is used).
* Having a role field in the JWT allows it to avoid extra database queries for role checks — improving performance.

# Part C: Reflection Checkpoint — JWT Token Storage and Management
* For token storage, we chose to store the access token and refresh token securely as HttpOnly cookies rather than using localStorage or sessionStorage. 
* This decision was primarily driven by security concerns. HttpOnly cookies cannot be accessed by client-side JavaScript, which helps protect against common attacks such as cross-site scripting (XSS).
* The access token was set with a short expiry time (e.g., 15 minutes) to minimize the window of exposure if the token is compromised.
* To maintain a smooth user experience without requiring frequent logins, I've implemented a refresh token system that issues new access tokens when the old ones expire.
* Refresh tokens have a longer expiration (7 days) and are also stored securely in HttpOnly cookies. 
* One challenge I've faced was balancing security with usability: short-lived access tokens improve security but can cause friction if users are frequently prompted to log in again.
* The refresh token mechanism helps alleviate this but introduces complexity in securely managing token rotation and invalidation.


# Part D: Mitigate Security Risks

### Implemented:
1. Secure cookies
```
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
  maxAge: 15 * 60 * 1000,
});
```
> HttpOnly: Prevents JavaScript access (mitigates XSS).
Secure: Ensures cookies are sent over HTTPS only.
SameSite: "Strict": Blocks CSRF in most cases.

 2. Session timeout policy
 ```
 { expiresIn: "15m" }
 ```
>  I've implemented a short-lived token, which limits risks if ever it is stolen.

3. CSRF Protection
* To protect the application from Cross-Site Request Forgery (CSRF) attacks, we implemented the csurf middleware in our Express app.
* To prevent this, a CSRF token is generated and validated on all state-changing requests (like POST, PUT, DELETE).

5. Prevent account enumeration
> From this code
> ![image](https://hackmd.io/_uploads/Hkw5shVrge.png)
> To this:
> ![image](https://hackmd.io/_uploads/HymhinNBxl.png)

This way, it revents attackers from checking for registered emails (aka user enumeration).


6. Rate limiting (login attempts)
* To protect against brute-force attacks, we implemented rate limiting on sensitive routes — specifically the login route.
* Security: Prevents automated bots from spamming the login form with password guesses.