const express = require('express');
const router = express.Router({ mergeParams: true }); //merge is needed for campground /:id
const catchAsync = require('../util/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;