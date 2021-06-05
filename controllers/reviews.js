const Bikepath = require('../models/bikepath');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const bikepath = await Bikepath.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    bikepath.reviews.push(review);
    await review.save();
    await bikepath.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/bikepaths/${bikepath._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Bikepath.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/bikepaths/${id}`);
}
