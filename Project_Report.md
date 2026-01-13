# 1. Project Title
**Project Name:** TaskPathPal (ServiceDesk)
**Tagline:** Intelligent Workflow Automation for Institutional Service Requests.

# 2. Abstract / Overview
**TaskPathPal** is a comprehensive Service Request Management System designed to streamline the process of raising, tracking, and resolving service requests within an institution or organization. It replaces manual, paper-based, or fragmented communication channels (like emails/calls) with a centralized digital platform. The system facilitates seamless interaction between requestors (staff/students), departmental authorities (HODs), and service providers (Technicians), ensuring transparency, accountability, and faster turnaround times for issues ranging from IT support to facility maintenance.

# 3. Problem Statement
**The Problem:**
In many organizations, reporting issues (e.g., "Printer not working", "AC repair needed") is a chaotic process. Requests are often lost in emails, there is no way to track status, and assigning accountability is difficult. Approvals from Heads of Departments (HODs) are often delayed due to manual paperwork.

**Real-world Importance:**
Efficient facility and IT management is crucial for operational continuity. A delay in repairing a projector can halt a lecture; a broken server can stop business operations. This project solves the "visibility gap" and "coordination lag" in service management.

# 4. Objectives
- **Centralized Dashboard:** To provide a single view for all requests, reducing data fragmentation.
- **Role-Based Access:** To ensure secure access control for Admins, HODs, Technicians, and Requestors.
- **Automated Workflow:** To automate the flow of a request from Creation → Approval → Assignment → Resolution.
- **Real-time Tracking:** To allow users to check the status of their complaints at any time.
- **Resource Management:** To map specific staff to specific types of requests (e.g., IT staff for computer issues) automatically.

# 5. Scope of the Project
**Included:**
- Role-based Authentication (Sign up/Login).
- Dashboard for viewing request statistics.
- Service Request Lifecycle Management (Create, Update, Close).
- Admin Modules for managing Departments, Service Types, and Request Types.
- Technician and HOD specific interfaces for approvals and assignments.
- Commenting/Reply system for communication on requests.

**Not Included (Limitations):**
- In-app payment processing (for paid repairs).
- Mobile App (currently a responsive web app).
- IoT integration for automatic fault detection.

# 6. Target Users
1.  **Admin:** System configuration, managing masters (Departments, Users, Types).
2.  **HOD (Head of Department):** Approves requests raised by their department members; oversees department performance.
3.  **Technician:** The service provider who works on the request and resolves it.
4.  **Requestor:** Any staff or student who initiates a service request.

# 7. Tech Stack Used

| Component | Technology | Reason for Choice |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (React) | Server-Side Rendering (SSR) for performance, App Router for modern routing. |
| **Styling** | Tailwind CSS | Rapid UI development with utility-first classes; responsive design. |
| **UI Components**| Shadcn/UI | Accessible, high-quality pre-built components (Dialogs, Tables, Cards). |
| **Backend** | Supabase (PostgreSQL) | Backend-as-a-Service (BaaS) providing instant APIs and minimal boilerplate. |
| **Database** | PostgreSQL | Robust relational database for structured data and complex relationships. |
| **Authentication**| Supabase Auth | Secure, built-in authentication handling (Email/Password). |
| **Languages** | TypeScript | Type safety to reduce runtime errors and improve code quality. |
| **State Mgmt** | React Context + Hooks | Native state management sufficient for application flow. |

# 8. System Architecture
The system follows a modern **Serverless / BaaS (Backend-as-a-Service)** architecture. The frontend communicates directly with the Supabase PostgreSQL database using the Supabase Client. Security is enforced directly at the database layer using Row Level Security (RLS) policies.

**Architecture Diagram:**

```text
+-----------------+        +---------------------+        +--------------------------+
|  User (Browser) | <----> |  Next.js Frontend   | <----> |  Supabase (BaaS)         |
|  (React UI)     |        |  (App Router)       |        |  (Auth + DB + Realtime)  |
+-----------------+        +---------------------+        +--------------------------+
       ^                                                                |
       |                                                                |
       +------------------- (Direct DB Access via Client) --------------+
```

# 9. Project Modules / Features

### 1. Authentication Module
- **Purpose:** Secure entry to the system.
- **Workflow:** User signs up → Entry created in `auth.users` → Trigger creates profile in `public.profiles`.
- **Validation:** Email format, password strength.

### 2. Service Request Management
- **Purpose:** Core functionality to raise and track issues.
- **Workflow:** Requestor fills form → Status "Pending" → HOD Approves → Assigned to Technician → Technician marks "In Progress" → "Completed".
- **Inputs:** Title, Description, Priority, Category.

### 3. Master Data Management (Admin)
- **Purpose:** Configure system parameters.
- **Features:** Manage Service Departments, Staff Mapping, Request Types.
- **Edge Cases:** Preventing deletion of a Department if it has active requests.

### 4. Communication (Replies)
- **Purpose:** Clarify doubts regarding a request.
- **Workflow:** User posts comment → Stored in `service_request_replies`.

# 10. Database Design
**Database Name:** PostgreSQL (Supabase Default)

**Key Tables & Schema:**

1.  **profiles**
    *   `id` (UUID, PK): Links to Auth User.
    *   `name` (Text): Display name.
    *   `email` (Text): Contact email.

2.  **service_requests**
    *   `id` (UUID, PK)
    *   `request_no` (Text): Unique ID (e.g., SR-2024-0001).
    *   `requester_id` (UUID, FK): Who raised it.
    *   `status_id` (UUID, FK): Current status.
    *   `assigned_to_user_id` (UUID, FK): Technician assigned.
    *   `service_request_type_id` (UUID, FK): Category.

3.  **service_request_statuses**
    *   `id` (UUID, PK)
    *   `name` (Text): "Pending", "In Progress", "Closed".

4.  **service_departments**
    *   `id` (UUID, PK)
    *   `name` (Text): e.g., "IT Dept", "Maintenance".

**ER Diagram (Simplified):**

```text
[profiles] 1 ---- * [service_requests] * ---- 1 [service_request_types]
                         |
                         *
              [service_request_replies]
```

# 11. API Design (Backend)
Since this project uses Supabase, a traditional REST API is replaced by **PostgREST**, which automatically generates API endpoints from the database schema.

| Operation | Logical Endpoint (Supabase SDK) | Method | Body/Input | Response |
| :--- | :--- | :--- | :--- | :--- |
| **Get Requests** | `supabase.from('service_requests').select('*')` | GET | Filters (e.g., `eq('status', 'open')`) | JSON Array of Requests |
| **Create Request**| `supabase.from('service_requests').insert(...)` | POST | `{ title, description, type_id ... }` | Created Object |
| **Update Status** | `supabase.from('service_requests').update(...)` | PATCH | `{ status_id: '...' }` | Updated Object |
| **Delete Request**| `supabase.from('service_requests').delete(...)` | DELETE | `eq('id', '...')` | Success/Error |

**Example Response (JSON):**
```json
{
  "id": "abc-123",
  "request_no": "SR-2024-005",
  "title": "Projector Malfunction",
  "status": { "name": "Pending" }
}
```

# 12. Frontend UI Explanation
-   **Routing:** Next.js App Router (file-system based).
    -   `/auth`: Login/Signup pages.
    -   `/`: Dashboard (protected).
    -   `/requests`: List of requests.
    -   `/requests/[id]`: Detail view of a request.
    -   `/admin/*`: Admin master interfaces.
-   **Structure:**
    -   `layout.tsx`: Root layout with Sidebar and Topbar.
    -   `components/`: Reusable UI elements (Buttons, Inputs, Cards).
-   **State:** Local state (`useState`) for forms, `useEffect` for fetching data from Supabase.
-   **Validation:** `zod` schema validation for forms (e.g., submitting a reply).

# 13. Authentication & Authorization
-   **Mechanism:** Supabase Auth (JWT based).
-   **RBAC (Role Based Access Control):**
    -   Verified via `user_roles` table.
    -   **RLS Policies:**
        -   *Requestor* can only see *their own* requests.
        -   *Technician* can see requests *assigned* to them.
        -   *Admin* can see *all* requests.
-   **Session:** Persistent sessions handled automatically by Supabase client SDK.

# 14. Complete Project Workflow (End-to-End)
1.  **User Login:** User logs in at `/auth` using credentials.
2.  **Dashboard:** Redirected to dashboard showing summary (e.g., "5 Pending Requests").
3.  **Create Request:** User navigates to "New Request", selects Department ("IT") and Type ("Hardware"), enters description ("Mouse broken"), and submits.
4.  **Processing:**
    -   System generates ID (SR-2024-xxx).
    -   HOD/Technician receives the request in their dashboard.
5.  **Action:** Technician opens request, updates status to "In Progress".
6.  **Resolution:** Technician fixes issue, adds comment "Replaced mouse", updates status to "Resolved".
7.  **Closure:** User views update, confirms resolution.

# 15. Deployment Details
-   **Platform:** Vercel (Optimized for Next.js).
-   **Environment Variables:**
    -   `NEXT_PUBLIC_SUPABASE_URL`: API URL.
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API Key.
-   **Build Command:** `npm run build` (Next.js build).
-   **Deploy:** Auto-deploy from GitHub repository via Vercel integration.

# 16. Testing
Currently, the project focuses on **Manual Testing** during development.

| Test ID | Feature | Input | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Login | Valid Email/Pass | Redirect to Dashboard | ✅ Pass |
| TC-02 | Login | Invalid Pass | Error Toast "Invalid Credentials" | ✅ Pass |
| TC-03 | Create Request | Empty Description | Validation Error Shown | ✅ Pass |
| TC-04 | RLS Security | User access other's request | Access Denied / Empty List | ✅ Pass |

# 17. Results / Output Screens
-   **Login Screen:** Modern card-based UI with glassmorphism.
-   **Dashboard:** Grid view of status cards (Open, Closed, Pending).
-   **Request List:** Table with filtering and sorting capabilities.
-   **Request Detail:** Detailed view with chat-like activity history.

# 18. Performance & Optimization
-   **Code Splitting:** Next.js automatically splits code per page.
-   **Image Optimization:** Used `next/image` for optimized asset loading.
-   **Database Indexing:** Primary keys and Foreign keys are indexed by default in Postgres/Supabase for fast joins.

# 19. Security Considerations
-   **SQL Injection:** Prevented by using Parameterized Queries (via Supabase SDK).
-   **XSS (Cross-Site Scripting):** React automatically escapes content.
-   **Data Privacy:** **Row Level Security (RLS)** is the backbone, ensuring a user can only query data they are explicitly allowed to see, regardless of the frontend code.

# 20. Challenges Faced
-   **Challenge:** Syncing profile data with Auth users.
    -   *Solution:* Used PostgreSQL Triggers (`handle_new_user`) to automatically create a profile row when a new user signs up in Supabase Auth.
-   **Challenge:** Handling Foreign Key retrieval in lists without complex joins.
    -   *Solution:* Optimized queries to fetch related data (Profiles, Departments) efficiently, sometimes using manual mapping for better control over UI rendering.

# 21. Future Enhancements
-   **Email Notifications:** Send email alerts when status changes (using Supabase Edge Functions or SendGrid).
-   **File Attachments:** Allow users to upload photos of the issue (using Supabase Storage).
-   **Report Generation:** Export monthly PDF reports of service requests.

# 22. Conclusion
**TaskPathPal** successfully digitizes the service request lifecycle. It brings structure to chaos, accountability to staff, and transparency to users. By leveraging modern web technologies like Next.js and Supabase, it offers a scalable, secure, and performant solution for institutional management.

# 23. References
-   **Next.js Documentation:** https://nextjs.org/docs
-   **Supabase Documentation:** https://supabase.com/docs
-   **Tailwind CSS:** https://tailwindcss.com/
-   **React Icons (Lucide):** https://lucide.dev/
