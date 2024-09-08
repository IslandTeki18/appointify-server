# Appointify Backend

This is the backend for a Calendly clone application built with Node.js, Express, TypeScript, and MongoDB. It provides APIs for user authentication, event type management, and appointment scheduling.

## Features

- User authentication (register, login, logout)
- Event type management (create, read, update, delete)
- Appointment scheduling and management
- User profile management

## Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/calendly-clone-backend.git
   cd calendly-clone-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Start the server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

The server should now be running on `http://localhost:5000`.

## Project Structure

```
src/
├── config/
│   └── database.ts
├── models/
│   ├── User.ts
│   ├── EventType.ts
│   └── Appointment.ts
├── routes/
│   ├── auth.routes.ts
│   ├── eventType.routes.ts
│   ├── appointment.routes.ts
│   └── user.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── eventType.service.ts
│   ├── appointment.service.ts
│   └── user.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── utils/
│   ├── asyncHandler.ts
│   └── AppError.ts
├── types/
│   └── index.ts
└── server.ts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Event Types
- `POST /api/event-types` - Create a new event type
- `GET /api/event-types` - Get all event types for the authenticated user
- `GET /api/event-types/:id` - Get a specific event type
- `PUT /api/event-types/:id` - Update an event type
- `DELETE /api/event-types/:id` - Delete an event type

### Appointments
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments` - Get all appointments for the authenticated user
- `PUT /api/appointments/:id/cancel` - Cancel an appointment

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the JWT token in the Authorization header of your requests:

```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API uses a centralized error handling mechanism. All errors are formatted consistently and include a status code and error message.

## Validation

Request payload validation is performed using Joi. Invalid requests will return a 400 Bad Request status with details about the validation errors.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.