# Backend - Web 1 Final Project

A Node.js + Express backend with modular folder structure.

## Project Structure

```
src/
├── server.js           # Main server file
├── routes/             # API route handlers
├── controllers/        # Business logic
├── models/             # Data models
└── middlewares/        # Custom middleware functions
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration:

   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/web1-final-project
   ```

4. Make sure MongoDB is running locally or update `MONGODB_URI` with your MongoDB connection string (e.g., MongoDB Atlas).

## Running the Server

### Development (with hot reload):

```bash
npm run dev
```

### Production:

```bash
npm start
```

The server will be available at `http://localhost:5000`

## API Endpoints

- **Health Check**: `GET /health` - Check if server is running
- **API Root**: `GET /api` - Welcome message

### Example CRUD Endpoints

- `GET /api/examples` - Get all examples
- `GET /api/examples/:id` - Get example by ID
- `POST /api/examples` - Create new example
- `PUT /api/examples/:id` - Update example
- `DELETE /api/examples/:id` - Delete example

## Built With

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management
- **Nodemon** - Development auto-restart

## Adding New Routes

1. Create a new file in `src/routes/`
2. Define your route handlers
3. Import and use it in `src/server.js`

Example:

```javascript
import userRoutes from "./routes/userRoutes.js";
app.use("/api/users", userRoutes);
```

## Adding Middleware

Create middleware files in `src/middlewares/` and use them in your routes or globally in `src/server.js`.

## License

ISC
