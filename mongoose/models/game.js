const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    first_team: {
        type: String,
        required: true
    },
    second_team: {
        type: String,
        required: true
    },
    firstwin_odds: {
        type: Number,
        required: [true, 'why no odds?']
    },
    secondwin_odds: {
        type: Number,
        required: true
    },
    draw_odds: {
        type: Number,
        required: true
    },
    game_date: {
        type: Date,
        required: true
    },
    game_type: {
        type: String,
        required: true
    },
    game_result: {
        winner: {type: String},
        score: {
                first_team_score: {type: Number},
                second_team_score: {type: Number}
            }
    },
    number_of_bets: {
        users_betted: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        bets_count: {type: Number}
    }
});

module.exports = mongoose.model('Game', GameSchema);
