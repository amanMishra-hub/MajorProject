const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../Cloudconfig.js");
const upload = multer({ storage: storage });



const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedin,
    validateListing,
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing)
);


// New route
router.get("/new", 
isLoggedin, wrapAsync(listingController.newForm));



router
.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(
    isLoggedin,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
)
.delete(
    isLoggedin,
    isOwner,
     wrapAsync(listingController.deleteListing)
    );



// Edit route
router.get("/:id/edit",
    isLoggedin,
    isOwner,
    wrapAsync(listingController.editForm));


module.exports = router;