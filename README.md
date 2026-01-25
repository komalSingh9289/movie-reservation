# 🎬 Movie Reservation System (Real-Time Seat Locking)

A full-stack movie reservation system inspired by platforms like **BookMyShow**, focused on solving a real-world problem:  
👉 *Preventing multiple users from selecting the same seat at the same time.*

This project implements **real-time seat locking**, role-based admin panels, and clean API documentation using Swagger.

---

## 🚀 Features

### 🎟️ User Features
- Browse movies and shows
- Select seats with **real-time locking**
- Prevents double booking and race conditions
- Seat locks are **user-specific and time-bound**
- Smooth and responsive UI

### 🧑‍💼 Admin Features (Organization Admin)
- Create and manage movie shows
- Update or delete **expired shows** (based on date & time)
- Control show availability and schedules
- Organization-level access control

### 🛡️ Super Admin Features
- Manage global categories
- Create, update, and delete movies
- Control organization-level movie assignments

---

## ⚙️ Tech Stack

**Frontend**
- Next.js (React)
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Socket.IO (WebSockets)

**Authentication & Security**
- Clerk Authentication
- Role-based access control (Super Admin / Org Admin / User)

**API Documentation**
- Swagger (OpenAPI)

---

## 🔁 Real-Time Seat Locking (Core Logic)

- When a user selects a seat, it is **instantly locked**
- Other users see the seat as unavailable **in real time**
- Locks expire automatically if booking is not completed
- Server remains the **source of truth** to avoid inconsistencies

> This approach ensures safe concurrency handling even with multiple users selecting seats simultaneously.

---

## 📚 API Documentation

The project uses **Swagger** for API documentation, making it easy for developers to:
- Understand available endpoints
- Test APIs directly from the browser
- View role-based access (locked endpoints)

Example APIs include:
- Categories (Super Admin only)
- Movies management
- Organization-specific movie collections

---

## 🧠 What I Learned

- Real-time state synchronization using WebSockets
- Handling concurrency and race conditions
- Designing role-based admin systems
- Optimistic UI vs server-side validation
- Writing clean, developer-friendly API documentation

---

## Screenshots

<img width="1354" height="608" alt="Image" src="https://github.com/user-attachments/assets/2bd17d6e-3d58-49e2-bb6d-cf4ee2408687" />
<img width="1366" height="768" alt="Image" src="https://github.com/user-attachments/assets/bbbf9f18-b031-4b11-8279-d2593f36dc25" />
<img width="1366" height="768" alt="Image" src="https://github.com/user-attachments/assets/cfddd4c1-8b03-4669-a10f-47329a774e2d" />
<img width="1366" height="768" alt="Image" src="https://github.com/user-attachments/assets/99e5c83a-350b-4665-b58f-266143df1024" />
<img width="1366" height="768" alt="Image" src="https://github.com/user-attachments/assets/588a900e-a707-4e32-88ca-f433eae5f741" />
<img width="1366" height="768" alt="Image" src="https://github.com/user-attachments/assets/50cd50f9-669a-42ce-9183-b223444f7261" />
<img width="1366" height="768" alt="Image" src="https://github.com/user-attachments/assets/a6e94641-34f5-4b74-b78d-6125a66babd2" />

---

## 📌 Why This Project?

Instead of building just a portfolio project, I wanted to:
- Solve a **real-world system design problem**
- Build something scalable and practical
- Learn how real platforms handle multi-user conflicts

---

## 👩‍💻 Author

**Komal Singh**  
MERN Stack Developer | Full-Stack Enthusiast  
Learning by building real products 🚀

---

