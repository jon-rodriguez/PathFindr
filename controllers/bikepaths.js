const Bikepath = require('../models/bikepath');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const bikepaths = await Bikepath.find({}).populate('popupText');
    res.render('bikepaths/index', { bikepaths })
}

module.exports.renderNewForm = (req, res) => {
    res.render('bikepaths/new');
}

module.exports.createBikepath = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.bikepath.location,
        limit: 1
    }).send()
    const bikepath = new Bikepath(req.body.bikepath);
    bikepath.geometry = geoData.body.features[0].geometry;
    bikepath.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    bikepath.author = req.user._id;
    await bikepath.save();
    console.log(bikepath);
    req.flash('success', 'Successfully made a new bikepath!');
    res.redirect(`/bikepaths/${bikepath._id}`)
}

module.exports.showBikepath = async (req, res,) => {
    const bikepath = await Bikepath.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!bikepath) {
        req.flash('error', 'Cannot find that bikepath!');
        return res.redirect('/bikepaths');
    }
    res.render('bikepaths/show', { bikepath });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const bikepath = await Bikepath.findById(id)
    if (!bikepath) {
        req.flash('error', 'Cannot find that bikepath!');
        return res.redirect('/bikepaths');
    }
    res.render('bikepaths/edit', { bikepath });
}

module.exports.updateBikepath = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const bikepath = await Bikepath.findByIdAndUpdate(id, { ...req.body.bikepath });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    bikepath.images.push(...imgs);
    await bikepath.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await bikepath.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated bikepath!');
    res.redirect(`/bikepaths/${bikepath._id}`)
}

module.exports.deleteBikepath = async (req, res) => {
    const { id } = req.params;
    await Bikepath.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted bikepath')
    res.redirect('/bikepaths');
}