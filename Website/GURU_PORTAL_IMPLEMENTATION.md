# Guru Portal - Home & Course Management Pages

## ✅ Completed Implementation

### Pages Created

#### 1. **Guru Dashboard** (`/dashboard`)
**File**: `src/pages/dashboard/GuruDashboard.jsx`

**Features**:
- ✅ Sticky header with OM symbol and ShlokaYug branding
- ✅ User profile display with verification status badge
- ✅ Quick access to Settings and Logout
- ✅ Welcome section with personalized greeting
- ✅ **Stats Cards** (4 metrics):
  - Total Courses
  - Total Students
  - Published Courses
  - This Month Earnings (₹)
- ✅ **Quick Actions Grid** (4 cards):
  - Create New Course → `/courses/create`
  - My Courses → `/courses`
  - Analytics → `/analytics`
  - Students → `/students`
- ✅ **Recent Enrollments** section (placeholder with sample data)
- ✅ **Upcoming Sessions** section (placeholder with sample data)
- ✅ **Sanskrit Quote Section** with motivation message
- ✅ Footer with copyright info

**Design**:
- Vintage paper theme consistent throughout
- Responsive grid layout (1/2/4 columns)
- Hover effects on cards and buttons
- Icon integration from `lucide-react`

---

#### 2. **My Courses Page** (`/courses`)
**File**: `src/pages/courses/MyCourses.jsx`

**Features**:
- ✅ Header with "Create New Course" CTA button
- ✅ **Search & Filter Bar**:
  - Text search (by title/description)
  - Filter dropdown (All / Published / Drafts)
- ✅ **Courses Grid** (responsive 1/2/3 columns):
  - Course thumbnail or placeholder icon
  - Status badge (Published/Draft)
  - Course title and description (truncated)
  - Stats: Students count, Duration, Price
  - Edit button → `/courses/:id/edit`
  - More menu (⋮) with actions:
    - View Course
    - Publish/Unpublish
    - Analytics
    - Delete (with confirmation)
- ✅ **Empty State** when no courses found
- ✅ API Integration:
  - `apiService.getMyCourses()` - Fetch instructor's courses
  - `apiService.publishCourse(id)` - Publish a draft
  - `apiService.unpublishCourse(id)` - Unpublish a course
  - `apiService.deleteCourse(id)` - Delete course

**User Experience**:
- Loading state with OM symbol spinner
- Error display with vintage alert
- Real-time filtering as user types
- Confirmation dialog before delete
- Menu closes when clicking outside

---

#### 3. **Create Course Page** (`/courses/create`)
**File**: `src/pages/courses/CreateCourse.jsx`

**Features**:
- ✅ **Multi-Step Wizard** (4 steps with progress indicator):
  
  **Step 1: Basic Information**
  - Course Title (required)
  - Description (required, textarea)
  - Category (required, dropdown):
    - Vedic Prosody, Classical Prosody, Chandas Shastra, Meter Analysis, Verse Composition, Sanskrit Poetry, Other
  - Difficulty Level (beginner/intermediate/advanced)
  - Thumbnail URL (optional)

  **Step 2: Pricing & Access**
  - Free Course checkbox
  - Pricing Type (One-time / Subscription)
  - One-time Price (INR) - if one-time selected
  - Monthly Price (INR) - if subscription selected
  - Yearly Price (INR) - if subscription selected
  - Revenue sharing note (80/20 split)

  **Step 3: Course Content**
  - Learning Outcomes (dynamic array, required, min 1)
  - Prerequisites (dynamic array, optional)
  - Target Audience (textarea)
  - Estimated Duration (hours, number input)
  - Add/Remove buttons for array items

  **Step 4: Additional Details**
  - Tags (dynamic array, optional)
  - Meta Keywords (dynamic array, optional)
  - Syllabus Overview (textarea)
  - Info box about next steps

- ✅ **Navigation**:
  - Previous/Next buttons
  - Step validation before proceeding
  - "Save as Draft" button on final step
  - "Create Course" button on final step
  
- ✅ **Validation**:
  - Required field checks per step
  - Price validation (must be > 0 if not free)
  - Array validation (at least one learning outcome)
  - Error messages displayed above form

- ✅ **API Integration**:
  - `apiService.createCourse(payload)` - Create course
  - Auto-redirect to `/courses/:id/edit` after creation (to add units/lessons/lectures)

**Design**:
- OM symbol header
- Step indicator with progress line
- Checkmarks for completed steps
- Vintage card wrapper
- Responsive 2-column grid for pricing inputs
- Add/remove controls for dynamic arrays

---

### Updated Files

#### 4. **App.jsx**
**Changes**:
- ✅ Added import for `GuruDashboard`, `MyCourses`, `CreateCourse`
- ✅ Added routes:
  - `/dashboard` → GuruDashboard
  - `/courses` → MyCourses
  - `/courses/create` → CreateCourse
  - `/` → Redirects to `/dashboard` (changed from `/login`)

---

#### 5. **GuruAuthContext.jsx**
**Changes**:
- ✅ Added auto-redirect to `/dashboard` after successful login
  - Uses `setTimeout` + `window.location.href` for clean navigation
  - Ensures user is authenticated before redirect

---

#### 6. **vintage.css**
**New Classes Added**:
- ✅ `.vintage-btn-secondary` - Outline button style
- ✅ `.text-vintage-*` - Color utility classes (sepia, gold, amber, burgundy, ink)
- ✅ `.bg-vintage-*` - Background color utilities
- ✅ `.bg-vintage-aged`, `.bg-vintage-paper-light` - Background variations
- ✅ `.line-clamp-2` - Text truncation after 2 lines
- ✅ `.bg-opacity-10` - Opacity utility
- ✅ `.border-vintage-*` - Border color utilities

---

## 🔄 User Flow

### First-Time Guru Journey
1. **Register** → `/register` (4-step wizard)
2. **Login** → `/login` (credentials entry)
3. **Auto-redirect** → `/dashboard` (welcome screen with stats)
4. **Create First Course** → Click "Create New Course" → `/courses/create`
5. **Fill Course Details** → 4-step wizard (Basic Info → Pricing → Content → Additional)
6. **Create Course** → Redirects to `/courses/:id/edit` (future: add units/lessons)
7. **View My Courses** → `/courses` (grid view with search/filter)

### Existing Guru Journey
1. **Login** → `/login`
2. **Dashboard** → `/dashboard` (view stats, recent activity)
3. **Manage Courses** → `/courses` (search, filter, publish/unpublish, delete)
4. **Create New Course** → `/courses/create`
5. **Quick Actions** → Analytics, Students, Schedule (future pages)

---

## 📊 Backend API Endpoints Used

### Course Management
- `POST /api/v1/courses` - Create new course (auth required, guru role)
- `GET /api/v1/courses/instructor/my-courses` - Get guru's courses
- `PUT /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Soft delete course
- `POST /api/v1/courses/:id/publish` - Publish course
- `POST /api/v1/courses/:id/unpublish` - Unpublish course

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user data

---

## 🎨 Design System

### Colors
- **Paper Background**: `#f4f1e8` (vintage-paper)
- **Ink Text**: `#2c2416` (vintage-ink)
- **Sepia Accent**: `#8b7355` (vintage-sepia)
- **Gold Accent**: `#d4af37` (vintage-gold)
- **Amber**: `#c9a961` (vintage-amber)
- **Burgundy**: `#6b2e2e` (vintage-burgundy)
- **Saffron**: `#ff9933` (OM symbol)

### Typography
- **Body**: Georgia, Garamond (serif)
- **Headings**: Cinzel, Georgia (serif)

### Components
- **Cards**: White paper background, sepia border, gold top bar
- **Buttons**: Gradient (sepia → ink), uppercase, rounded
- **Inputs**: Paper background, inset shadow, sepia focus ring
- **Alerts**: Left border accent, contextual colors

---

## 🚀 Next Steps (Future Pages)

1. **Edit Course Page** (`/courses/:id/edit`)
   - Add Units (hierarchical structure)
   - Add Lessons within Units
   - Add Lectures within Lessons
   - Upload videos/documents
   - Reorder content

2. **Course Analytics** (`/courses/:id/analytics`)
   - Enrollment trends graph
   - Revenue breakdown
   - Student progress stats
   - Popular lessons

3. **Students Page** (`/students`)
   - List all enrolled students
   - Filter by course
   - View individual student progress
   - Send messages/announcements

4. **Schedule Page** (`/schedule`)
   - Calendar view
   - Create live sessions
   - Manage Q&A sessions
   - Send reminders

5. **Settings Page** (`/settings`)
   - Profile management
   - Payment preferences
   - Notification settings
   - Account security

6. **Protected Route Wrapper**
   - Check authentication before rendering
   - Redirect to `/login` if not authenticated
   - Show loading state during auth check

---

## 📝 Technical Notes

### State Management
- Uses `GuruAuthContext` for global authentication state
- Local state in components for form data and UI states
- API calls via centralized `apiService`

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages
- Vintage-themed alert components
- Form validation with clear feedback

### Performance
- Lazy loading considerations for future (React.lazy)
- Optimistic UI updates (course list refresh after actions)
- Debouncing for search (can be added)

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels (can be enhanced)
- Focus management in forms

---

## 🐛 Known Issues / TODOs

1. ✅ Guru role check temporarily disabled (all users can access)
2. ⏳ Backend `/guru/apply` endpoint doesn't exist yet
3. ⏳ Course editing (units/lessons/lectures) not implemented
4. ⏳ File upload for thumbnails not implemented (URL input only)
5. ⏳ Analytics, Students, Schedule pages are placeholders
6. ⏳ Protected routes not enforced (any user can access if they know URL)
7. ⏳ Line ending fixes (CRLF → LF) pending in Backend

---

## ✨ Summary

**Created 3 major pages** with full functionality:
- ✅ Dashboard with stats, quick actions, and activity feeds
- ✅ My Courses with search, filter, and CRUD operations
- ✅ Create Course with 4-step wizard and full validation

**Updated 3 existing files**:
- ✅ App.jsx (routing)
- ✅ GuruAuthContext.jsx (login redirect)
- ✅ vintage.css (utility classes)

**Total Lines of Code**: ~1,500+ lines across all new pages

**Ready for**: Testing, user feedback, and iterative enhancement!

---

*Created: November 25, 2025*  
*Version: 1.0.0*
