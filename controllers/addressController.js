import Address from '../model/addressModel.js';

export const createAddress = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is stored in req.user after authentication
    console.log('User ID:', userId);
    const newAddress = new Address({ ...req.body, userId });
    const address = await Address.find({ userId });
    if (address.length > 0) {
      return res.status(400).json({ message: 'User already has an address' });
    }
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    //const { userId } = req.query;
    const userId = req.user._id; // Assuming user ID is stored in req.user after authentication
    console.log('User ID:', userId);
    if (userId) {
      const addresses = await Address.find({ userId });
      return res.status(200).json(addresses);
    } else {
      return res.status(400).json({ message: 'User ID is required' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id; 
    const deletedAddress = await Address.findOneAndDelete({ userId: userId, _id: req.params.id });
    if (!deletedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
