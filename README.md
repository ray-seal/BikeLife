# MotoMeet - Motorcyclist Social & Ride-Sharing App (Sample Starter)

A sample project to connect motorcyclists, record rides, share photos, and find people to ride with.

## Features

- User authentication (JWT)
- Ride recording (mocked GPS)
- Photo sharing (local storage, can be swapped for cloud)
- Basic social features (add friends, view feed)

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT

## Getting Started

### Backend

1. `cd backend`
2. `npm install`
3. `npm start`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npx expo start`

---

## Folder Structure

- `backend/` – Express API (users, rides, photos)
- `frontend/` – React Native app

---

## Next Steps

- Replace local photo storage with S3/Firebase
- Add real GPS tracking
- Polish UI & add more social features
