# PawCare Cat Sitting Management System

A responsive admin-only cat sitting management prototype created for the IMS566 Advanced Web Design Development and Content Management individual project.

## Main features
- Hardcoded admin login with error feedback
- Responsive left-side slide-out navigation
- Dashboard with KPI cards
- Booking status tracking: Completed, Pending, Registered
- Cat records data view
- Owner records data view
- Cat sitter profile and contact page
- Add/delete booking interactions
- Search and filter functions
- Meaningful Chart.js visualisations
- LocalStorage for demo data persistence
- Mobile-friendly layout
- Dark mode with saved preference
- Per-booking cat photos with click-to-view
- Demo credential autofill from the login form
- Owner addresses and phone numbers on owner and booking records
- Matching blue-and-orange heart favicon on browser tabs

## Demo login
Username: `admin`
Password: `pawcare123`

## Technologies
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Chart.js
- Google Fonts

## Important limitation
This is a front-end prototype. The login is simulated and booking information is stored in browser LocalStorage. It is suitable for an assignment/demo but is NOT a secure production system for real confidential customer data. A real system would require a backend database, encrypted authentication, access control and secure server-side storage.

## Run
Open `index.html` in Google Chrome, or install VS Code's Live Server extension and click **Go Live**. No VS Code `launch.json` is required.

## Profile cat photos
Add or replace four JPG images in the project root's `images` folder using these exact names:
- `raudah-cat-1.jpg` (profile/hero and gallery photo)
- `raudah-cat-2.jpg` (gallery photo)
- `raudah-cat-3.jpg` (gallery photo)
- `raudah-cat-4.jpg` (gallery photo)

The profile page displays image placeholders for any missing files, renders its cat photos in a portrait 2:3 ratio, and automatically cycles through the gallery. Booking cat photos can be added from the booking form or by opening a cat's name in the bookings table; each upload is limited to 2 MB and compressed before it is stored in browser LocalStorage. Owner address and phone are collected with new bookings; use **Edit contact** on the Owners page to fill in existing records.

## GitHub Pages
Upload the project folder to a GitHub repository and enable GitHub Pages from the repository settings. The assignment guideline requires both a live GitHub Pages link and repository link.
