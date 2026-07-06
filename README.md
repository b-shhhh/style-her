# Style Her - Fashion E-commerce Platform

A modern fashion e-commerce application built with React, Express, and MongoDB.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Product Catalog**: Browse products by category (Dresses, Tops, Bottoms, Ethnic Wear)
- **Shopping Cart**: Add products to cart and manage quantities
- **Order Management**: Place orders with Cash on Delivery or eSewa wallet payment
- **Admin Dashboard**: Manage products, orders, and users
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Payment**: eSewa integration

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://127.0.0.1:27017/styleher
PORT=4000
CLIENT_URL=http://localhost:4000
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
```

## Project Structure

```
style-her/
├── src/                 # Frontend source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── server/              # Backend source code
│   ├── index.js         # Express server
│   └── mongoDb.js       # Database models and operations
├── backend/             # Alternative backend structure
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── repositories/ # Data access layer
│   └── package.json
├── fashion_dataset.csv  # Product data
└── fashion_images_export/ # Product images
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - Get all categories
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/profile` - Delete profile

## License

MIT