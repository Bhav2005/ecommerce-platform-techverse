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
        category: "Audio",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
        rating: 4.5
    },
    {
        name: "Gaming Laptop",
        description: "High performance gaming laptop with RTX 4060, 16GB RAM and 512GB SSD.",
        price: 85000,
        category: "Electronics",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400"],
        rating: 4.7
    },
    {
        name: "4K Monitor",
        description: "27 inch 4K UHD IPS monitor with 144Hz refresh rate and HDR support.",
        price: 32000,
        category: "Electronics",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"],
        rating: 4.6
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with tactile switches, perfect for gaming and typing.",
        price: 3499,
        category: "Accessories",
        stock: 40,
        images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400"],
        rating: 4.7
    },
    {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with 3200 DPI, silent clicks and 60hr battery life.",
        price: 1299,
        category: "Accessories",
        stock: 60,
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"],
        rating: 4.4
    },
    {
        name: "Laser Printer",
        description: "Compact all-in-one laser printer with WiFi, print, scan and copy functions.",
        price: 12999,
        category: "Accessories",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400"],
        rating: 4.3
    },
    {
        name: "Smart Watch",
        description: "Fitness tracker with heart rate monitor, GPS and sleep tracking.",
        price: 4999,
        category: "Electronics",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
        rating: 4.6
    },
    {
        name: "Bluetooth Speaker",
        description: "360 degree surround sound portable speaker with 24hr battery and waterproof body.",
        price: 2499,
        category: "Audio",
        stock: 45,
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"],
        rating: 4.5
    },
    {
        name: "Laptop Backpack",
        description: "Water-resistant backpack with USB charging port, fits 15.6 inch laptops.",
        price: 1499,
        category: "Accessories",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
        rating: 4.2
    },
    {
        name: "Webcam HD",
        description: "1080p HD webcam with built-in microphone, auto focus and wide angle lens.",
        price: 3299,
        category: "Accessories",
        stock: 35,
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNcEGntCGEBdSEALlKRYw9abX-P1SYPDYnew&s"],
        rating: 4.3
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