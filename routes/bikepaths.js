const express = require('express');
const router = express.Router();
const bikepaths = require('../controllers/bikepaths');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateBikepath } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Bikepath = require('../models/bikepath');

router.route('/')
    .get(catchAsync(bikepaths.index))
    .post(isLoggedIn, upload.array('image'), validateBikepath, catchAsync(bikepaths.createBikepath))


router.get('/new', isLoggedIn, bikepaths.renderNewForm)

router.route('/:id')
    .get(catchAsync(bikepaths.showBikepath))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateBikepath, catchAsync(bikepaths.updateBikepath))
    .delete(isLoggedIn, isAuthor, catchAsync(bikepaths.deleteBikepath));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(bikepaths.renderEditForm))



module.exports = router;