const Product = require('../model/productsModel');

const createProduct = async (req, res) => {
  try {
    console.log('Received request to insert product:', req.body);
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product inserted successfully', product });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'Failed to insert product' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // ডিফল্ট 10
    const offset = parseInt(req.query.offset) || 0;

    const products = await Product.find()
      .skip(offset)
      .limit(limit);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};



const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}



const searchProduct = async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (!q.trim()) {
      return res.status(400).json({ message: 'No search keyword provided' });
    }

    // Atlas Search (fuzzy)
    const results = await Product.aggregate([
      {
        $search: {
          index: 'default',
          text: {
            query: q,
            path: ['name', 'description', 'brand', 'category', 'tags'],
            fuzzy: { maxEdits: 2 }
          }
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Total count (for pagination)
    const countAgg = await Product.aggregate([
      {
        $search: {
          index: 'default',
          text: {
            query: q,
            path: ['name', 'description', 'brand', 'category', 'tags'],
            fuzzy: { maxEdits: 2 }
          }
        }
      },
      { $count: "total" }
    ]);
    const total = countAgg[0]?.total || 0;

    res.status(200).json({ products: results, total });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = { createProduct, getAllProducts, getProductById, searchProduct };



