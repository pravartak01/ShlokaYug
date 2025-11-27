# Quick Fix: Update User Role and Re-login

## ✅ Step 1: User Role Updated (DONE)
Your user role has been successfully updated to 'guru' in the database.

## ⚠️ Step 2: Token Mismatch Issue
The JWT token stored in your browser was issued when you were a 'student'. That old token is still being sent with requests, causing 401 errors.

## 🔧 Solution: Re-login to Get New Token

### Option A: Use the Website (Recommended)
1. Go to http://localhost:5173/dashboard
2. Click the **Logout** button (top right)
3. You'll be redirected to `/login`
4. Login again with your credentials
5. You'll get a new token with 'guru' role
6. Try creating a course again - it will work! ✅

### Option B: Clear Browser Storage Manually
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → `http://localhost:5173`
4. Delete these items:
   - `guru_access_token`
   - `guru_refresh_token`
   - `guru_user`
5. Refresh the page and login again

### Option C: Clear from Console
1. Open browser console (F12)
2. Run this command:
   ```javascript
   localStorage.clear(); window.location.href = '/login';
   ```
3. Login again with your credentials

## 🔍 Verify Your New Token

After logging in again, open browser console and run:
```javascript
const user = JSON.parse(localStorage.getItem('guru_user'));
console.log('Role:', user.role);
console.log('Guru Profile:', user.guruProfile);
```

You should see:
- **Role**: `guru` (not `student`)
- **Guru Profile**: Object with verification info

## ✨ After Re-login

Once you have the new token, you can:
- ✅ Create courses
- ✅ Publish/unpublish courses
- ✅ Add units, lessons, lectures
- ✅ View analytics
- ✅ Manage enrollments

---

**Why This Happened:**
JWT tokens contain encoded user data including the role. When you registered, you got a token with `role: "student"`. Even though we updated your role in the database to `guru`, the token in your browser still says `student`. The backend rejects requests from `student` role when trying to create courses (which require `guru` role).

Re-logging gives you a fresh token with the updated role! 🎉
