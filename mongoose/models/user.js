const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate: {
            validator: function(v) {
                return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(v)
            },
            message: 'Password must be at least 8 characters length and include at least: one uppercase character, one lowercase character, one number and a special character'
        }  
    },
    firstname: {
        type: String,
        required: true,
        minlength: 2
    },
    lastname: {
        type: String,
        required: true,
        minlength: 2
    },
    deposit_limit: {
        type: Number,
        required: true
    },
    deposit_date: {
        type: Date,
        required: true
    },    
    frequency_limit: {
        type: String,
        required: true
    },
    bets: {
        ordinaryBets: [{
            type: Schema.Types.ObjectId,
            ref: 'Bet'
        }],
        combinedBets: [{
            type: Schema.Types.ObjectId,
            ref: 'CombinedBet'
        }]
    },
    token: {
        access: {
            type: String
        },
        token: {
            type: String
        },
        expiresIn: {
            type: String
        }
    },
    confirmToken: {
        type: String
    }      
});

UserSchema.pre('save', function(next) {
    const user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else if(!user.isModified('password')) {
        next();
    }
})

UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;
    return User.findOne({email})
               .then(user => {
                   if(!user) {
                       return Promise.reject('Email or password is incorrect.');
                   }
                   return new Promise((resolve, reject) => {
                        bcrypt.compare(password, user.password, (err, res) => {
                            if(res) {
                                resolve(user);
                            }
                        else {
                            reject("Username or password is incorrect.");
                        }
                    })
                   })
               })
}

UserSchema.methods.createAuthToken = async function(access) {
    const user = this;
    const token = jwt.sign({_id: user._id.toHexString(), access}, 
                            process.env.JWT_SECRET,
                            {expiresIn: '24h'}).toString();
          user.token = { access, token, expiresIn: '24h' };
          try {
            const res = await user.save();
            return res;
          } catch(err) {
            res.status(400).send({errors: "Something went wrong"})
          }
}

module.exports = mongoose.model('User', UserSchema);
