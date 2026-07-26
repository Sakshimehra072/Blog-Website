const { toggleSubscription, getSubscriberCount } = require('../models/subscriptionModel');

async function handleToggleSubscribe(req, res) {
  try {
    const { authorId } = req.body;
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');

    if (!authorId) {
      return res.status(400).json({ success: false, message: 'Author ID is required.' });
    }

    const result = await toggleSubscription({ userId, authorId });
    res.json({
      success: true,
      message: result.isSubscribed ? 'Subscribed to author updates!' : 'Unsubscribed from author.',
      isSubscribed: result.isSubscribed,
      subscriberCount: result.count
    });
  } catch (error) {
    console.error('Subscribe Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update subscription.' });
  }
}

async function handleGetSubscriberCount(req, res) {
  try {
    const { authorId } = req.params;
    const count = await getSubscriberCount(authorId);
    res.json({
      success: true,
      authorId,
      subscriberCount: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscriber count.' });
  }
}

module.exports = {
  handleToggleSubscribe,
  handleGetSubscriberCount
};
