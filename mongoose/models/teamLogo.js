const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamLogoSchema = new Schema({
    team_name: {
        type: String,
        required: true
    },
    logo: {
        path: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        }
    }    
});

module.exports = mongoose.model('TeamLogo', TeamLogoSchema);
