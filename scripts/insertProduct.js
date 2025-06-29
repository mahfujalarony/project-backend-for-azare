const Product = require('../model/productsModel');

const insertProducts = async () => {
  try {
    const newProduct = {
      name: 'Laptop Bag',
      price: 800,
      oldPrice: 1000,
      description: 'Stylish laptop bag for professionals',
      stars: 4.3,
      reviews: 10,
      size: 'M',
      image: 'https://example.com/images/laptopbag.jpg',
      discount: 20,
      category: 'Accessories',
      inStock: true,
    };


    const existingProduct = await Product.findOne({ name: newProduct.name });
    if (existingProduct) {
      console.log(`⚠️ Product "${newProduct.name}" already exists in the database. Skipping insertion.`);
      return;
    }

    await Product.insertOne(newProduct);
    console.log(`✅ Product "${newProduct.name}" inserted successfully!`);
  } catch (error) {
    console.error('❌ Error inserting product:', error.message);
  }
};

module.exports = insertProducts;