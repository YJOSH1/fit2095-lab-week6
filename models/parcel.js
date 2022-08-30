const mongoose = require('mongoose');

let parcelSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    sender: {
        type: string,
        required: true,
        validate: {
            validator: function (sender) {
                return sender.length >=3;
            },
            message: 'Sender name must be greater than 3 characters'
        }
    },
    address: {
        type: string,
        required: true,
        validate: {
            validator: function (address) {
                return address.length >=3;
            },
            message: 'Address name must be greater than 3 characters'
        }
    },
    weight: {
        type: number,
        required: true,
        validate: {
            validator: function (weight) {
                return weight > 0;
            },
            message: 'Weight must be greater than 0'
        }
    },
    fragile: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Parcel', parcelSchema);