<div align="center">
  <img src="https://res.cloudinary.com/dxy7irilx/image/upload/v1776375873/LogoClodinary_ucwnez.png" width="120" alt="Echo Logo"/>
  <h1>Echo – Real‑time Chat & Video Call App</h1>
  <p><strong>Instant messaging • HD video calls • PWA • 12 themes • 10+ fonts</strong></p>
  <p>
    <a href="https://echo-chat-application-proj.netlify.app/"><img src="https://img.shields.io/badge/Live_Demo-echo_chat-7c6af7?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo"/></a>
    <a href="https://github.com/Vaida-Paul/chat-app"><img src="https://img.shields.io/github/stars/Vaida-Paul/chat-app?style=for-the-badge&color=ffb86b" alt="GitHub stars"/></a>
    <a href="https://github.com/Vaida-Paul/chat-app/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Vaida-Paul/chat-app?style=for-the-badge&color=50fa7b" alt="License"/></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white"/>
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=spring-boot&logoColor=white"/>
    <img src="https://img.shields.io/badge/WebRTC-333333?style=flat-square&logo=webrtc&logoColor=white"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>
  </p>
</div>

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/0974577f-57a4-4806-8f3c-be0ee71a4a03" /> About Echo

**Echo** is a full‑stack real‑time communication platform that combines modern messaging with high‑quality video calls. It's built as a **Progressive Web App (PWA)**, so you can install it on your phone or desktop and use it like a native app.

The goal was to create a seamless, beautiful, and fast experience – from typing indicators and read receipts to crystal‑clear WebRTC calls with screen sharing.

<img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/92048ca5-44f2-480f-9143-f024acd4e435" /> **Live demo:** [https://echo-chat-application-proj.netlify.app/](https://echo-chat-application-proj.netlify.app/)

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/1b2ba47f-c057-4676-988d-1f7d9fda994d" /> Key Features

| Category | Features |
|----------|----------|
| **Messaging** | Real‑time text, typing indicators, online presence, read & delivery receipts, delete for everyone, image sharing |
| **Calls** | HD video/audio calls, screen sharing, picture‑in‑picture mode, mute/unmute, toggle camera |
| **Personalisation** | 12 beautiful themes (Midnight, Galaxy, Arctic, Ember…), 10+ custom fonts (Quicksand, Pacifico, Orbitron…), profile picture upload |
| **Security** | JWT authentication, email verification, password reset, block users |
| **PWA** | Installable on any device, works offline (cached assets), push notifications |
| **Tech** | WebSockets (STOMP) for real‑time events, WebRTC for peer‑to‑peer media |

---
## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/05e17cd6-96ce-4544-a5b8-653ad8b2e1a3" /> Gifs

| Auth | Settings |
| :---: | :---: |
| ![Home Page](https://github.com/Vaida-Paul/chat-app/blob/main/docs/Gifs/loading_auth_page.gif) | ![Settings](https://github.com/Vaida-Paul/chat-app/blob/main/docs/Gifs/settings.gif) |

| Chat | Video Call |
| :---: | :---: |
| ![Chat Room](https://github.com/Vaida-Paul/chat-app/blob/main/docs/Gifs/chat-page.gif) | ![Video Calling](https://github.com/Vaida-Paul/chat-app/blob/main/docs/Gifs/video-call.gif) |

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/77cfa530-ad7f-4656-948a-942a8f97e560" /> Tech Stack

### Frontend
- **React 18** + **TypeScript** – type‑safe UI
- **Vite** – fast builds and HMR
- **Zustand** – minimal state management
- **SCSS Modules** – scoped styling
- **WebRTC** – peer‑to‑peer audio/video
- **STOMP over WebSocket** – real‑time messaging
- **Cloudinary** – image uploads
- **PWA** (vite-plugin-pwa) – installable & offline caching

### Backend
- **Spring Boot 3** – Java backend
- **Spring Security + JWT** – authentication & authorisation
- **Spring Data JPA** – database access
- **WebSocket (STOMP)** – bi‑directional communication
- **Cloudinary SDK** – file storage
- **JavaMail** – email verification & password reset

### Database & Deployment
- **PostgreSQL** (Neon) – cloud database
- **Netlify** – frontend hosting (auto‑deploy from GitHub)
- **Render** – backend hosting (Docker container)

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/1d6628e5-019e-44c0-bd48-2f414588de59" /> Getting Started (Local Development)

### Prerequisites
- <img width="24" height="24" alt="image" src="https://github.com/user-attachments/assets/c9bbc360-7136-485e-9169-011d141474c3" /> Node.js 18+
- <img width="24" height="24" alt="image" src="https://github.com/user-attachments/assets/ec4b0bc6-455c-44c3-b845-3a8179abeb5e" /> Java 17+
- <img width="24" height="24" alt="image" src="https://github.com/user-attachments/assets/9460ea50-3072-45ef-a9d2-5d71ffefa3d4" /> PostgreSQL (or a Neon cloud account)

### 1. Clone the repository
```bash
git clone https://github.com/Vaida-Paul/chat-app.git
cd chat-app
```
### 2. Backend Setup
```bash
cd backend-chat-app
```

Create an `application.properties` file (or set environment variables) with the following keys:

```properties
spring.application.name=chat-app-backend

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}

logging.level.org.springframework.security=DEBUG

turnstile.secret=${JWT_TURNSTILE_SECRET}
turnstile.verify-url=https://challenges.cloudflare.com/turnstile/v0/siteverify

cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB

brevo.api-key=${BREVO_API_KEY}
app.logo-url=https://res.cloudinary.com/dxy7irilx/image/upload/v1776375873/LogoClodinary_ucwnez.png
app.frontend-url=${FRONTEND_URL}
```

Run the backend application:
```bash
./mvnw spring-boot:run
```

---

### 3. Frontend Setup
```bash
cd ../frontend-chat-app
npm install
```

Create a `.env` file in the root of the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_TURNSTILE_SITEKEY=your_turnstile_site_key
```

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to register and start chatting!

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/f6680cc0-c67d-403e-a954-05cc5df17db6" /> Deployment

### Backend (Render)
* **Environment:** Use the Docker environment (auto‑detected).
* **Root directory:** `backend-chat-app`
* **Environment variables:** Set the same variables as above, plus:
  * `FRONTEND_URL` → Your Netlify URL (e.g., `https://echo-chat-application-proj.netlify.app`)

*Render builds and deploys automatically from your GitHub repository.*

---

### Frontend (Netlify)
1. Connect your GitHub repository.
2. Configure the following build settings:
   * **Base directory:** `frontend-chat-app`
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`

3. Set the following environment variables:
   * `VITE_API_URL` → Your Render backend URL (e.g., `https://your-backend.onrender.com/api`)
   * `VITE_TURNSTILE_SITEKEY` → Your Turnstile site key.

---

### Database (Neon)
* Create a PostgreSQL database on Neon.
* Use the pooled connection string as `DB_URL` (or `spring.datasource.url`) in the backend environment.
* *Note: The backend automatically runs migrations on startup.*
---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/baf82ec3-f9a5-48e4-81a0-9fbe35557447" /> Contributing

This is a personal portfolio project, but issues and suggestions are very welcome! Feel free to open an issue or submit a pull request.

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/52a0c9d4-4dd9-4803-8fa7-45b62632cd9f" /> License

MIT © **Vaida-Paul**
See [LICENSE](LICENSE) for details.

---

## <img width="32" height="32" alt="image" src="https://github.com/user-attachments/assets/bed6cd4a-ffe4-4f4a-a1a1-ac69571795b3" /> Acknowledgements

* **Cloudinary** – Image hosting & transformations
* **Render** – Backend hosting (free tier)
* **Netlify** – Frontend hosting (free tier)
* **Neon** – PostgreSQL database
* **Google Fonts** – Free typefaces
* **React Icons** – Icon library

---

<div align="center"> 
  <sub>Built by Vaida-Paul – <a href="https://github.com/Vaida-Paul">@Vaida-Paul</a></sub> 
</div>

