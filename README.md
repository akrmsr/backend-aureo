# 🎵 Music Player API

A full-featured REST API for a music streaming platform built with Node.js, Express, and MongoDB Atlas. Users can upload their own songs with cover images and listen to them anywhere, while admins can manage default songs visible to all users.

## ✨ Features

- 🔐 **User Authentication** - Session-based authentication (no JWT)
- 🎵 **Song Upload** - Upload audio files (MP3, WAV, OGG, M4A) with optional cover images
- 🖼️ **Cover Images** - Add custom album art to songs
- 🎼 **Genre Support** - 24 music genres including Pop, Rock, Hip-Hop, Jazz, etc.
- 🔍 **Search & Filter** - Search songs by title, artist, album, and filter by genre
- 📊 **Song Management** - Edit metadata, delete songs, track play counts
- 👑 **Admin Panel** - Admin can upload default songs visible to all users
- 💾 **GridFS Storage** - Audio files and images stored in MongoDB using GridFS
- 🎧 **Audio Streaming** - Stream songs with range request support

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **File Storage**: GridFS (MongoDB)
- **Authentication**: Express Session + Connect-Mongo
- **File Upload**: Multer + Multer-GridFS-Storage
- **Validation**: Express Validator
- **Security**: Bcrypt for password hashing

## 📁 Project Structure

```
music-player-api/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── session.js           # Session configuration
│   │   ├── gridfs.js            # GridFS initialization
│   │   └── constants.js         # App constants
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Song.js              # Song model
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── songController.js    # Song operations
│   │   └── adminController.js   # Admin operations
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── songs.js             # Song routes
│   │   └── admin.js             # Admin routes
│   ├── middleware/
│   │   ├── auth.js              # Authentication check
│   │   ├── adminAuth.js         # Admin authorization
│   │   └── errorHandler.js      # Error handling
│   └── utils/
│       ├── validation.js        # Input validation
│       ├── fileValidation.js    # File validation
│       └── helpers.js           # Utility functions
├── scripts/
│   └── createAdmin.js           # Create admin user
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── server.js                    # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd music-player-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Get this from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicplayer

# Generate a random 32+ character string
SESSION_SECRET=your_super_secret_session_key_here

# File size limits (in MB)
MAX_AUDIO_SIZE=50
MAX_IMAGE_SIZE=5

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@musicplayer.com
ADMIN_PASSWORD=Admin@123456
```

4. **Create admin user**
```bash
npm run create-admin
```

5. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be running at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |
| GET | `/auth/me` | Get current user | ✅ |

### Song Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/songs/upload` | Upload song | ✅ |
| GET | `/songs` | Get all songs | ✅ |
| GET | `/songs/my-songs` | Get user's songs | ✅ |
| GET | `/songs/:id` | Get song by ID | ✅ |
| PUT | `/songs/:id` | Update song | ✅ |
| DELETE | `/songs/:id` | Delete song | ✅ |
| GET | `/songs/stream/audio/:id` | Stream audio | ✅ |
| GET | `/songs/stream/image/:id` | Get cover image | ✅ |
| GET | `/songs/search` | Search songs | ✅ |
| GET | `/songs/genres` | Get all genres | ❌ |

### Admin Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/admin/songs/upload` | Upload default song | ✅ Admin |
| GET | `/admin/songs` | Get default songs | ✅ Admin |
| PUT | `/admin/songs/:id` | Update default song | ✅ Admin |
| DELETE | `/admin/songs/:id` | Delete default song | ✅ Admin |
| GET | `/admin/users` | Get all users | ✅ Admin |
| DELETE | `/admin/users/:id` | Delete user | ✅ Admin |

## 📝 API Usage Examples

### 1. Register a new user

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Upload a song

```bash
POST /api/songs/upload
Content-Type: multipart/form-data

audioFile: <audio file>
coverImage: <image file> (optional)
title: "My Song"
artist: "Artist Name"
album: "Album Name" (optional)
genre: "Pop"
```

### 4. Search songs

```bash
GET /api/songs/search?q=love&genre=Pop&sortBy=plays&order=desc
```

### 5. Stream a song

```bash
GET /api/songs/stream/audio/<audioFileId>
```

## 🎨 Supported File Formats

### Audio Files
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- Max size: 50MB (configurable)

### Cover Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Max size: 5MB (configurable)

## 🎭 Music Genres

Pop, Rock, Hip-Hop, Rap, Jazz, Classical, Electronic, EDM, Dance, Country, R&B, Soul, Reggae, Metal, Blues, Folk, Indie, Alternative, Punk, K-Pop, Latin, Bollywood, Instrumental, Other

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- Secure HTTP-only cookies
- File type and size validation
- Input sanitization and validation
- Protection against common attacks

## 🐛 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- All contributors

---

Made with ❤️ and 🎵