# Administrator account credential fix

- SuperAdmin creates each staff account with a username, email, phone number, and initial password (minimum 8 characters).
- The initial password is hashed by the API; it is never returned in the API response or stored in plaintext.
- New accounts are marked `must_change_password=true`. After a successful first sign-in, the portal redirects the user to Change Password.
- Until the password is changed, the API blocks administrative routes. The authenticated user can still load their profile and use the change-password endpoint.
- After changing the password, the user is signed out and signs in again with their new password.
- Existing admin accounts receive the nullable `phone` field through the API's idempotent startup schema update.
