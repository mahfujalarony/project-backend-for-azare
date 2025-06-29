const Wishlist = require('../model/wishlistModel');

const addWishList = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
      await wishlist.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Product added to wishlist.', 
        wishlist 
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product already in wishlist.' 
        });
      }
      wishlist.products.push(productId);
      await wishlist.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Product added to wishlist.', 
        wishlist 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error. Could not add to wishlist.', 
      error: error.message 
    });
  }
};


const getWishLists = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products',
      select: 'name price oldPrice discount images'
    });
    if (!wishlist) {
      // যদি না থাকে, ফাঁকা wishlist পাঠান
      return res.status(200).json({ products: [] });
    }
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};



const deleteWishList = async (req, res) => {
  const userId = req.user._id;
  const { id: productId } = req.params;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'User ID and Product ID are required' });
  }

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(product => product.toString() !== productId);

    if (wishlist.products.length === 0) {
      await Wishlist.deleteOne({ userId });
      return res.status(200).json({ message: 'Wishlist deleted as it is empty' });
    }

    await wishlist.save();
    res.status(200).json({ message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}

module.exports = {
  addWishList,
  getWishLists,
  deleteWishList
};