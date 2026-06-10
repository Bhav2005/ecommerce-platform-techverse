require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    reviews: [],
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

const products = [
    {
        name: "Wireless Headphones",
        description: "Premium noise-cancelling wireless headphones with 30hr battery life.",
        price: 2999,
        category: "Electronics",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
        rating: 4.5
    },
    {
        name: "Black-themed Mechanical Keyboard V92435",
        description: "Ultra-responsive clicky tactile key switches with premium keycaps.",
        price: 2500,
        category: "Accessories",
        stock: 8,
        images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ553Nhs3qFJquA21pTlM9gIPEnzTwcKJhjog&s"],
        rating: 3.8,
    },
    {
        name: "GEN AI PC",
        description: "Ultra-responsive clicky tactile key switches with premium keycaps.",
        price: 1500,
        category: "Accessories",
        stock: 8,
        images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFT55ZsY7MQWWQRbPedOR4tRcc5TfDpSzZ_w&s"],
        rating: 4.3
    },
    {
        name: "Laptop Backpack",
        description: "Water-resistant backpack with USB charging port, fits 15.6 inch laptops.",
        price: 1499,
        category: "Bags",
        stock: 40,
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
        rating: 4.2
    },
    {
        name: "Smart Watch",
        description: "Fitness tracker with heart rate monitor, GPS and sleep tracking.",
        price: 4999,
        category: "Electronics",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
        rating: 4.6
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with tactile switches, perfect for gaming and typing.",
        price: 3499,
        category: "Electronics",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400"],
        rating: 4.7
    }
];

async function seedDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        await Product.insertMany(products);
        console.log('Products seeded successfully!');

        mongoose.connection.close();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedDB();