const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create a new listing");
        return res.redirect("/login");
    }
    next();
};

const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.owner || !review.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports = {
    isLoggedin,
    isOwner,
    isReviewAuthor
};