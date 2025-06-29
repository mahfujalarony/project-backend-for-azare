const { v4: uuidv4 } = require('uuid');
const Message = require('../model/MessageModel2');
const Conversation = require('../model/conversationModel');
const User = require('../model/UserModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const messageSocket = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
    //  console.log('User authenticated:', socket.user);
      next();
    } catch (err) {
      console.error('Invalid token');
      next(new Error('Invalid authentication token'));
    }
  });

  // ✅ On socket connection
  io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id);

    // ➤ Start chat (by user)
// ...existing code...
socket.on('start_chat', async ({ productId }) => {
  const userId = socket.user.userId;
  //  console.log('start_chat event received:', { userId, productId });

  try {
    let conversation = await Conversation.findOne({ createdBy: userId, productId })
      .populate('createdBy', 'name email imgUrl role')
      .lean();

    if (!conversation) {
      const chatId = uuidv4();
      conversation = new Conversation({
        chatId,
        productId,
        createdBy: userId,
        lastMessageTime: new Date(),
      });
      await conversation.save();
      // নতুন conversation হলে populate করতে হবে
      conversation = await Conversation.findOne({ chatId })
        .populate('createdBy', 'name email imgUrl role')
        .lean();
    }

    // এখানে load_first_chat-এর মতো payload বানান
    const payload = {
      id: conversation.chatId || conversation._id.toString(),
      name: conversation.name || 'Unnamed Chat',
      user: {
        name: conversation.createdBy?.name || 'Unknown User',
        email: conversation.createdBy?.email || '',
        imgUrl: conversation.createdBy?.imgUrl || '',
        role: conversation.createdBy?.role || 'user',
        userId: conversation.createdBy?._id?.toString() || userId,
      },
    };

    socket.emit('chat_started', payload);
    socket.join(conversation.chatId);
  } catch (error) {
    // console.error('Error starting chat:', error);
    socket.emit('error', 'Could not start chat');
  }
});
// ...existing code...
    // ➤ Load first chat for user (for auto navigation)
// server-side (socket.on)
// server-side (socket.on)
// server-side (socket.on)
socket.on('load_first_chat', async () => {
  const userId = socket.user?.userId;
  const role = socket.user?.role;

  
//  console.log('Load first chat requested:', { userId, role });

  if (!userId || !role) {
    console.error('Missing userId or role');
    socket.emit('error', 'User not authenticated');
    return;
  }

  try {
    let conversation;

    if (role === 'admin') {
      conversation = await Conversation.findOne()
        .sort({ lastMessageTime: -1 })
        .populate('createdBy', 'name email imgUrl role')
        .lean();
    } else {
      conversation = await Conversation.findOne({ createdBy: userId })
        .sort({ lastMessageTime: -1 })
        .populate('createdBy', 'name email imgUrl role')
        .lean();
    }

    
   // console.log('Found conversation:', conversation);

    if (conversation) {
     
      const payload = {
        id: conversation.chatId || conversation._id.toString(), // chatId না থাকলে _id ব্যবহার করুন
        name: conversation.name || 'Unnamed Chat', // ডিফল্ট নাম
        user: {
          name: conversation.createdBy?.name || 'Unknown User',
          email: conversation.createdBy?.email || '',
          imgUrl: conversation.createdBy?.imgUrl || '',
          role: conversation.createdBy?.role || 'user',
          userId: conversation.createdBy?._id.toString() || userId,
        },
      };

      //console.log('Emitting first_chat_loaded with payload:', payload);
      socket.emit('first_chat_loaded', payload);
    } else {
     // console.log('No conversation found, emitting null');
      socket.emit('first_chat_loaded', null);
    }
  } catch (error) {
   // console.error('Error loading first chat:', error);
    socket.emit('error', 'Could not load first chat');
  }
});


    // ➤ Load all conversations
    socket.on('load_conversations', async () => {
      const userId = socket.user.userId;
      const role = socket.user.role;
     // console.log('load_conversations event received:', { userId, role });

      try {
        const filter = role === 'user' ? { createdBy: userId } : {};

        const conversations = await Conversation.find(filter)
          .populate('productId', 'name price images')
          .populate('createdBy', 'name email imgUrl')
          .sort({ lastMessageTime: -1 })
          ;

const formattedConversations = conversations
  .filter(convo => convo.productId && convo.createdBy)
  .map((convo) => ({
    chatId: convo.chatId,
    product: {
      _id: convo.productId._id,
      name: convo.productId.name,
      price: convo.productId.price,
      imageUrl: convo.productId.images?.[0] || null,
    },
    user: {
      userId: convo.createdBy._id,
      name: convo.createdBy.name,
      email: convo.createdBy.email,
      imgUrl: convo.createdBy.imgUrl,
      role: convo.createdBy.role,
    },
    createdAt: convo.createdAt,
  }));

        socket.emit('conversations_loaded', formattedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        socket.emit('error', 'Could not load conversations');
      }
    });

    // ➤ Load user info
    socket.on('load_user_info', async ({ userId }) => {
      try {
        const user = await User.findById(userId, 'name email imgUrl role').lean();

        if (!user) {
          console.error('User not found:', userId);
          return socket.emit('error', 'User not found');
        }

        const formattedUser = {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          imgUrl: user.imgUrl,
          role: user.role,
        };

//console.log('User info loaded:', formattedUser);
        socket.emit('user_info_loaded', formattedUser);
      } catch (error) {
        console.error('Error loading user info:', error);
        socket.emit('error', 'Could not load user info');
      }
    });

    // load product info
    socket.on('load_product_info', async({ productId}) => {
      try{
        const product = await require('../model/ProductModel').findById(productId).lean();
        if (!product) {
       //   console.error('Product not found:', productId);
          return socket.emit('error', 'Product not found');
        }
        const formattedProduct = {
          _id: product._id.toString(),
          name: product.name,
          price: product.price,
          images: product.images,
          description: product.description,
        };
        socket.emit('product_info_loaded', formattedProduct);
      } catch(err) {
        console.log('errr', err.message);
      }
    })

    // ➤ Load messages for a chat
    socket.on('load_messages', async (chatId) => {
      const userId = socket.user.userId;

      try {
        socket.join(chatId);
        const messages = await Message.find({ chatId })
          .populate('senderId', '_id name imgUrl role')
        .sort({ lastMessageTime: 1 }).lean();

        const formattedMessages = messages.map((msg) => ({
          id: msg._id.toString(),
          chatId: msg.chatId,
          role: msg.role,
          text: msg.text,
          createdAt: msg.createdAt.toISOString(),
        }));

      //  console.log('Messages loaded for chatId:', chatId);
        socket.emit('messages_loaded', formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        socket.emit('error', 'Could not load messages');
      }
    });

    // ➤ Send a message
    socket.on('send_message', async ({ chatId, text }) => {
      const { userId, role } = socket.user;

      try {
        socket.join(chatId);

        const message = new Message({
          chatId,
          senderId: userId,
          text,
          role,
          createdAt: new Date(),
        });

        await message.save();

        //update last messagetime conversations
        await Conversation.findOneAndUpdate(
          { chatId },
          { lastMessageTime: message.createdAt },
          { new: true }
        );

        io.emit('reload_conversations'); 

        const formattedMessage = {
          id: message._id.toString(),
          chatId: message.chatId,
          role: message.role,
          text: message.text,
          createdAt: message.createdAt.toISOString(),
        };

        //console.log('Message saved and emitted:', formattedMessage);
        io.to(chatId).emit('new_message', formattedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Could not send message');
      }
    });

    // ➤ Disconnect
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

module.exports = messageSocket;
