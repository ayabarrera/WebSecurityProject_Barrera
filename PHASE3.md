# PHASE 3 - QUEST APP

To have this running properly, make sure Phase1 & Phase2 are properly set-up.
 - For Phase 1  [REAMDE.md](README.md)
 - For Phase 2  [PHASE2.md](PHASE2.md)

# Part A - User Dashboard

##  Overview
In Part A of the project, I've implemented a secure, user-specific dashboard page. The dashboard displays a welcome message and user details (name and email), and includes a logout option. 

### Features Implemented

- [ ] Secure route for /dashboard using JWT-based authentication
- [ ] Dynamic content rendering with EJS (Embedded JavaScript Templates)
- [ ] Displays logged-in user's name and email
- [ ] Logout button that ends the session securely

### Dependencies

```
npm install ejs express-validator escape-html
```
---

### Folder Structure Changes

New and modified files for Part A:
- [ ] views/dashboard.ejs – EJS template to render the dashboard UI
- [ ] routes/dashboard.js – Express route for serving the dashboard
- [ ] middleware/authenticate.js – Validates JWT and fetches user from DB (already exists)
- [ ] middleware/authorize.js – Ensures only authorized roles access dashboard (already exists)

### Code Highlight

1. #### views/dashboard.ejs 

```
<h2>Welcome, <%= username %>!</h2>
<p>Email: <%= email %></p>
<form method="POST" action="/auth/logout">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>" />
  <button type="submit">Logout</button>
</form>
```

* EJS escapes all output by default (e.g., <%= username %>), which helps prevent Cross-Site Scripting (XSS).
* The hidden <input> with name="_csrf" includes a server-generated CSRF token that must be validated on the backend.
* Without the CSRF token, logout requests (or any form POSTs) would be rejected with a Forbidden (403) error.
* routes/dashboard.js – JWT-Protected Route with Role Authorization


2. #### routes/dashboard.js – Protected route using JWT and roles

```
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorize");

router.get("/", authenticate, authorizeRoles("User", "Admin", "Moderator"), (req, res) => {
  const { username, email } = req.authUser;
  res.render("dashboard", {
    username,
    email,
    csrfToken: req.csrfToken(),
  });
});

module.exports = router;

```
* authenticate middleware decodes the JWT from the cookie, verifies it, and loads the user into req.authUser.
* authorizeRoles middleware restricts access to only those users who match allowed roles. Prevents unauthorized users from accessing admin/user-specific pages.
* req.csrfToken() generates a CSRF token for this session, which is passed to the template for secure form submission.

3. #### app.js – Add view engine and use dashboard route
```
app.set("view engine", "ejs");
app.set("views", "./views");

const dashboardRoute = require("./routes/dashboard");
app.use("/dashboard", dashboardRoute);
```
* EJS must be registered as the view engine to allow rendering .ejs templates.
* Routes are modularized (separated) and mounted on /dashboard. You can access the dashboard at https://localhost:3000/dashboard.


# Part B: Secure User Profile Update Form

This part of the project focuses on designing and implementing a secure user profile update form. The goal is to handle user input safely, prevent common web vulnerabilities, and protect sensitive user data.

---

### **Overview**

This task involves creating a form where users can update their name, email, and bio. The process is secured by:

* **Input Validation & Sanitization:** Ensuring that all user input is safe and adheres to specific rules before it's processed or stored.
* **Output Encoding:** Escaping data before rendering it in the browser to prevent malicious code execution.
* **Data Encryption:** Encrypting sensitive information like email and bio before it's saved to the database.
* **Secure Communication:** Using HTTPS to encrypt all data transmitted between the user's browser and the server.

---

### **Steps to Implement**

1.  **Design the Form (`profile.ejs`)**: Create a simple HTML form that allows users to input their name, email, and bio. This form should include a hidden CSRF token field to prevent Cross-Site Request Forgery attacks.

2.  **Define Server-Side Routes (`profile.js`)**:
    * Create a `GET` route to render the profile form. Before rendering, **decrypt** any sensitive data (email, bio) fetched from the database so it can be displayed to the user in a readable format.
    * Create a `POST` route to handle form submissions. This route will be the core of the security implementation.

3.  **Implement Input Validation**:
    * Use a library like `express-validator` to define clear validation rules for each input field.
    * **Name:** Must be 3–50 alphabetic characters.
    * **Email:** Must be a valid email format.
    * **Bio:** Must be under 500 characters and should not contain any HTML tags or special characters that could lead to a security issue.

4.  **Implement Input Sanitization**:
    * Sanitize the name and bio fields to remove any potentially dangerous characters or tags. For example, use `express-validator`'s `.escape()` or `.blacklist()` methods to strip away HTML.

5.  **Encrypt Sensitive Data**:
    * Use a cryptographic library like `crypto` to encrypt the email and bio fields.
    * Ensure the encryption function uses a secure algorithm (e.g., `aes-256-cbc`) and a randomly generated **Initialization Vector (IV)** for each encryption, which must be stored along with the ciphertext.

6.  **Update the Database**:
    * After validation, sanitization, and encryption, update the user's document in the database with the new, secure data.

7.  **Output Encoding for Display**:
    * When the user's profile data is rendered on any page, make sure to use a templating engine (like EJS) that automatically escapes content. This converts special characters (like `<`, `>`) into HTML entities (`&lt;`, `&gt;`), preventing any stored malicious code from executing in the user's browser.

8.  **Ensure HTTPS**:
    * Configure your Express server to run over HTTPS. This ensures all data transmitted between the client and server is encrypted, protecting against man-in-the-middle attacks. This is already implemented in `app.js` using `https.createServer`.

---

### **Why These Steps Are Necessary**

* **Defense in Depth:** Combining input validation, sanitization, and output encoding creates multiple layers of defense. Even if an attacker bypasses one layer (e.g., input validation), the others can still prevent a successful attack.
* **Preventing XSS (Cross-Site Scripting):** Input sanitization prevents malicious scripts from being stored, and output encoding prevents them from being executed. Together, they form a robust defense against XSS.
* **Protecting Sensitive Information:** Encrypting data like email addresses protects users' privacy even if the database is compromised. An attacker who gains access to the database will only see encrypted, unreadable text.
* **Securing Data in Transit:** HTTPS ensures that all data (including user credentials and profile information) is encrypted during transmission, protecting it from eavesdropping on public networks.

---

# Part C: Update Third-Party Software and Libraries

## Overview

This section details the process of updating project dependencies to address security vulnerabilities and outlines the importance of maintaining up-to-date software.

### Vulnerability Report from npm audit
After running npm audit, the following vulnerabilities were identified in the project's dependencies:

```
# npm audit report

cookie  <0.7.0
cookie accepts cookie name, path, and domain with out of bounds characters - https://github.com/advisories/GHSA-pxg6-pf52-xh8x
fix available via `npm audit fix --force`
Will install csurf@1.2.2, which is a breaking change
node_modules/csurf/node_modules/cookie
  csurf  >=1.3.0
  Depends on vulnerable versions of cookie
  node_modules/csurf

on-headers  <1.1.0
on-headers is vulnerable to http response header manipulation - https://github.com/advisories/GHSA-76c9-3jph-rj3q
fix available via `npm audit fix`
node_modules/on-headers
  express-session  1.2.0 - 1.18.1
  Depends on vulnerable versions of on-headers
  node_modules/express-session

4 low severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

### Analysis and Insights
The audit report highlights two key areas of concern, both involving low-severity vulnerabilities in transitive dependencies (packages that our direct dependencies rely on).

* `on-headers` Vulnerability: This issue affects express-session, a core library used for managing user sessions. The vulnerability in on-headers allows for HTTP response header manipulation. 
    * The recommended fix (npm audit fix) is safe to apply as it is a patch update and will not introduce breaking changes to express-session.

* `cookie` Vulnerability: This issue affects csurf, our CSRF protection library. The npm audit report suggests a fix (npm audit fix --force) that would install a very old version of csurf (1.2.2), which is highly confusing and would likely break our application. Since the project's package.json already specifies a much newer version (1.11.0), this indicates that the vulnerability report may be based on an outdated package-lock.json file. 
    * The correct action is to ensure we have the most current version of all dependencies, which likely already contains the patch for the cookie issue.

### Action Plan
1. Clean and Reinstall:
To ensure a fresh and accurate dependency tree, we first remove the node_modules folder and the package-lock.json file before reinstalling everything. This guarantees we pull the latest compatible versions, which should include the patches.
```
rm -rf node_modules package-lock.json
npm install
```

2. Apply Safe Patches:
Next, we run npm audit fix to automatically apply any remaining, safe patches. This is expected to resolve the on-headers vulnerability.
```
npm audit fix
```

3. Verify Resolution:
Finally, we run npm audit again to confirm that all vulnerabilities have been successfully addressed.

```
npm audit
```

## Reflection Checkpoint
**Why is it risky to use outdated third-party libraries?**
> Outdated libraries are a major security risk. They often contain known vulnerabilities that have been patched in newer versions. Attackers can easily exploit these known flaws, leading to data breaches or system compromise.

**How does automation help with dependency management?**
> Automation, such as with GitHub Actions or Dependabot, is crucial for continuous security. It automatically scans the project for new vulnerabilities, reducing manual effort and ensuring that security threats are identified and addressed in real time. This allows for quick, consistent patching across the entire development lifecycle.

**What risks does it have?**
> Automated updates can introduce breaking changes, new bugs, or performance regressions if not managed carefully. The risk is minimized by coupling automation with a robust testing strategy (unit tests, integration tests) that can catch regressions before they are deployed to production. 

# Part D -  Test and Debug
This section details the manual testing process performed to verify the security measures implemented in the application and includes insights on which vulnerabilities were most challenging to address.

### Testing for XSS (Cross-Site Scripting)
The goal of this test is to verify that user inputs are properly sanitized and encoded, preventing malicious scripts from executing in the browser.
>  Action: On the profile update form, submit the following payloads in the Name and Bio fields:

```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
'"><script>alert('XSS')</script>
```

Expected Secure Behavior:
* The application's input validation rejects the input with an error message (e.g., "Name must contain only letters").
* If the input is accepted, the page displays the raw text literally (<script>alert('XSS')</script>) without executing the script or showing an alert box. This confirms that output encoding is working.

Expected Vulnerable Behavior:
* An alert box pops up on the screen, indicating a successful XSS attack.

### Testing for SQL Injection
This test aims to determine if malicious SQL code can manipulate database queries.
- Action: On the profile update form, submit the following payloads in a field that might interact with the database, such as Name:
```
' OR '1'='1'--
'; DROP TABLE users;--
admin'--
```

* Secure Behavior:
    > - The application's input validation for the Name field (isAlpha) rejects the input immediately.
    > - If the input is accepted, Mongoose treats the entire payload as a literal string. The query fails, and no unintended database operations are performed.

### Reflection Checkpoint
**Which vulnerabilities were most challenging to address?**
* The most challenging vulnerabilities to address were the Cross-Site Scripting (XSS) and dependency management issues. 
* While input validation and sanitization seem straightforward, ensuring comprehensive coverage across all fields and anticipating a wide range of attack vectors is complex. 

**What additional testing tools or strategies could improve the process?**
* Dynamic Application Security Testing (DAST) Tools:
    * Automated scanners like OWASP ZAP could be used to perform comprehensive security scans of the running application, identifying vulnerabilities that manual testing might miss.