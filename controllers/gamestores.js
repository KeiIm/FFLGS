const Campground = require('../models/gamestore');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('gamestores/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('gamestores/new');
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    console.log(campground.geometry.coordinates)
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully made a new gamestore!')
    res.redirect(`gamestores/${campground._id}`)
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', populate: { path: 'author' }
    }).populate('author'); //OG: .populate('reviews').populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that gamestore!');
        return res.redirect('/gamestores')
    }
    res.render('gamestores/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that gamestore!');
        return res.redirect('/gamestores')
    }
    res.render('gamestores/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'Successfully updated gamestore!')
    res.redirect(`../gamestores/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Deleted gamestore!')
    res.redirect('../gamestores');
};