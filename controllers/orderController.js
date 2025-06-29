const Order = require('../model/Order');
const Product = require('../model/productsModel'); // প্রোডাক্ট মডেল

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, quantity, addressId } = req.body;
    console.log('id', id, 'q', quantity, 'add', addressId);

    if (!userId && (!req.user || !req.user.id)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }



    const order = new Order({
      userId: userId || req.user._id,
      product: {
        productId: product._id,
        quantity: quantity || 1,
        price: product.price,
        image: product.images?.[0] || null
      },
      addressId: addressId,
      totalAmount: (product.price * (quantity || 1)),
      status: 'pending'
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
      const userId = req.params.userId || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('Fetching orders for user:', userId);
  try {


    const orders = await Order.find({ userId })
    .populate('product.productId', 'name price images')
    .sort({ createdAt: -1 })
    ;

    if (!orders || orders.length === 0) {
      return res.status(404).json({ orders: [] });
    }

    res.status(200).json({ orders });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// For admin
// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try{
    const orderId = req.params.orderId;
    const { status } = req.body;
    console.log('orderid', orderId, 'status', status);

    if (!orderId || !status) {
      return res.status(400).json({ message: 'Order ID and status are required' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
