# Community Post Image Upload - Troubleshooting Guide

## Current Status
- ✅ Backend validation relaxed (text limit: 5000 chars)
- ✅ Image upload configured (4 images max, 10MB each)
- ✅ Metro config updated to suppress InternalBytecode errors
- ✅ Image picker deprecation warning noted (will auto-fix in future)

## The Main Issue: Network Error

The error `Network Error` means the Mobile App cannot reach the Backend server.

### Solution Steps:

#### 1. **Verify Backend is Running**
Check if you see this in the Backend terminal:
```
🕉️  ShlokaYug Backend API Server
📍 Running on port 5000
```

If not, start it:
```powershell
cd "c:\Users\shant\Desktop\Chandas Identifier SIH 25\Backend"
npm start
```

#### 2. **Check Your IP Address**
Run in PowerShell:
```powershell
ipconfig | findstr "IPv4"
```

Update `LOCAL_IP` in these files to match your current IP:
- `Mobile-App/services/api.ts` (line 11)
- `Mobile-App/components/ai-composer/AIComposer.tsx` (line 36)
- `Mobile-App/services/taglineService.ts` (line 7)

Current IP in config: `10.245.97.46`

#### 3. **Test Backend Connection**
Open browser and visit:
```
http://10.245.97.46:5000/api/v1/community/explore
```

If it doesn't load, your IP changed or backend isn't running.

#### 4. **Restart Expo (Metro Cache)**
```powershell
cd "c:\Users\shant\Desktop\Chandas Identifier SIH 25\Mobile-App"

# Option 1: Clean restart (recommended)
npx expo start --clear

# Option 2: Nuclear option if above doesn't work
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
npx expo start --clear
```

#### 5. **Alternative: Use ngrok (if IP keeps changing)**
```powershell
# Install ngrok: https://ngrok.com/download
ngrok http 5000
```

Then update `BACKEND_URL` in `services/api.ts`:
```typescript
const BACKEND_URL = 'https://YOUR-NGROK-URL.ngrok.io/api/v1';
```

## Backend Changes Made

### File: `Backend/src/routes/community.js`

**Relaxed Validations:**
- Text limit: 500 → 5000 characters
- Location name limit: 100 → 200 characters
- All fields now use `optional({ checkFalsy: true })`
- Removed strict `isMongoId()` check for videoId
- Removed strict `isArray()` checks

**Upload Config (Already Good):**
- Max images: 4
- Max file size: 10MB per image
- Allowed types: JPEG, PNG, GIF, WebP

## Mobile App Changes Made

### File: `Mobile-App/metro.config.js`
- Added error suppression for InternalBytecode.js
- Enabled cache reset on startup

### File: `Mobile-App/components/community/CreatePostModal.tsx`
- Noted deprecation warning (MediaTypeOptions → MediaType)
- Will auto-update when expo-image-picker is upgraded

## Testing the Fix

1. **Start Backend:**
   ```powershell
   cd Backend
   npm start
   ```

2. **Verify it's running** - You should see port 5000 message

3. **Start/Restart Expo:**
   ```powershell
   cd Mobile-App
   npx expo start --clear
   ```

4. **Test in app:**
   - Open Community tab
   - Click create post
   - Add text and images
   - Submit

## If Still Not Working

1. Check firewall isn't blocking port 5000
2. Try using `localhost` instead of IP (Android emulator only)
3. Ensure you're on same WiFi network (phone & computer)
4. Check Backend terminal for incoming request logs

## Success Indicators

When working, you'll see in Backend terminal:
```
POST /api/v1/community/posts 200 - - ms
```

And in Mobile App:
```
✅ API Response: {"data": {...}, "success": true}
```
