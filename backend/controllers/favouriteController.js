const { toggleFavourite, getFavouritesByUserId } = require('../models/favouriteModel');

async function handleToggleFavourite(req, res) {
  try {
    const { blogId } = req.body;
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');

    if (!blogId) {
      return res.status(400).json({ success: false, message: 'Blog ID is required.' });
    }

    const result = await toggleFavourite({ userId, blogId });
    res.json({
      success: true,
      message: result.isSaved ? 'Added to Favourites!' : 'Removed from Favourites.',
      isSaved: result.isSaved,
      blogId
    });
  } catch (error) {
    console.error('Favourite Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update favourites.' });
  }
}

async function handleGetUserFavourites(req, res) {
  try {
    const userId = req.params.userId || (req.user ? req.user.id : 'guest_user');
    const favourites = await getFavouritesByUserId(userId);
    res.json({
      success: true,
      userId,
      favourites: favourites || []
    });
  } catch (error) {
    console.error('Fetch Favourites Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch favourite blogs.' });
  }
}

module.exports = {
  handleToggleFavourite,
  handleGetUserFavourites
};
