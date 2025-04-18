const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },

    // work: {
    //     type: String,
    //     enum: ['devops', 'cloud', 'Developer'],
    //     required: true
    // },
    mobile: {
        type: String,
        required: true

    },

    email: {
        type: String,
        required: true,
         unique: true
    },
    
    address: {
        type: String,     
    },

    adharCardNumber: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{12}$/.test(v);
            },
            message: props => `${props.value} is not a valid Aadhaar number! Must be 12 digits.`
        }

    },
    // username: {
    //     required: true,
    //     type: String
    // },

    password: {
        required: true,
        type: String
    },

    role: {
        type: String,
        enum:  ['voter', 'admin'],
        default: 'voter'
    },

    isVoted: {
        type: Boolean,
        default: false
    }

    


});

userSchema.pre('save', async function(next){
    const user = this;


    if(!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        user.password = hashedPassword;
        next(); 


    }catch(err){
        return next(err);
    }

})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try{
        //use bycrypt to compare the provided password with hashed password

        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;

    }catch(err){
        throw err;
    }
    
}

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ adharCardNumber: 1 }, { unique: true });

const user = mongoose.model('user', userSchema);
module.exports = user;

