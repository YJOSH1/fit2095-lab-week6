const mongoose = require('mongoose');

let parcelSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    sender: {
        type: string,
        required: true
    },
    address: {
        type: string,
        required: true
    },
    weight: {
        type: number,
        required: true
    },
    fragile: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Parcel', parcelSchema);