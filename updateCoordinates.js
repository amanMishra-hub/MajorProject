const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();

const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateListingsWithCoordinates() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings to update`);

        for (let listing of listings) {
            if (listing.location) {
                try {
                    let response = await geocodingClient.forwardGeocode({
                        query: `${listing.location}, ${listing.country}`,
                        limit: 1
                    }).send();

                    if (response.body.features.length > 0) {
                        listing.geometry = response.body.features[0].geometry;
                        await listing.save();
                        console.log(`Updated: ${listing.title} - ${listing.location}`);
                    }
                } catch (err) {
                    console.log(`Error geocoding ${listing.title}:`, err.message);
                }
            }
        }

        console.log("All listings updated!");
        mongoose.connection.close();
    } catch (err) {
        console.error("Error:", err);
        mongoose.connection.close();
    }
}

updateListingsWithCoordinates();
