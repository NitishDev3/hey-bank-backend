const mongoose = require("mongoose");

const capitalize = (str) => {
    if (!str) { return }
    return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        set: capitalize
    },
    lastName: {
        type: String,
        required: true,
        set: capitalize
    },
    fullName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        enum: { values: ["male", "female", "others"], message: "Gender should be Male/Female/Others" }
    },
    city: {
        type: String,
    },
    profilePhotoUrl: {
        type: String,
    },
    isProfileCompleted: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true,
    }
);

//isProfileCompleted will be true if all the required fields are present in the user profile
userSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    const requiredFields = ["age", "gender", "city"];
    const isComplete = requiredFields.every(field => update[field] || this._update[field]);
    update.isProfileCompleted = isComplete;
    next();
});

//fullName will be updated whenever user signs up
userSchema.pre("save", function (next) {
    const { firstName, lastName } = this;
    this.fullName = `${firstName} ${lastName}`;
    next();
})

//fullName will be updated whenever firstName or lastName in profile is updated 
userSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.firstName || update.lastName) {
        update.fullName = `${capitalize(update.firstName) || this._update.firstName} ${capitalize(update.lastName) || this._update.lastName}`;
    }
    next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;