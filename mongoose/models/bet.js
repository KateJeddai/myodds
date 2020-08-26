const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BetSchema = new Schema({
    team: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        required: true,        
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: 'Game'
    },
    archived: {
        type: Boolean,
        default: false
    },
    won: {
        type: Boolean,
        default: false
    }
});

const CombinedBetSchema = new Schema({
    teams: [{
        gameId: {
            type: String,
            required: true
        },
        team: {
            type: String,
            required: true
        }
    }],
    amount: {
        type: Number,
        required: true,        
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    games: [{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }],
    archived: {
        type: Boolean,
        default: false
    },
    won: {
        type: Boolean,
        default: false
    }
});

CombinedBetSchema.statics.fillArchivedWonField = async function(id, status) {
  const CombinedBet = this;
        try {
            const bet = await CombinedBet.findOne({_id: id});
            if(status === 'won') {
                  bet.archived = true;
                  bet.won = true;
            } else if( status === 'lost') {
                  bet.archived = true;
                  bet.won = false;
            }
            const res = await bet.save();
            return res;
        } catch(err) {
            throw new Error(err);
        }            
}

BetSchema.statics.fillArchivedWonField = async function(id, status) {
    const Bet = this;
          try {
              const bet = await Bet.findOne({_id: id});
              if(status === 'won') {
                    bet.archived = true;
                    bet.won = true;
              } else if( status === 'lost') {
                    bet.archived = true;
                    bet.won = false;
              }
              const res = await bet.save();
              return res;
          } catch(err) {
              throw new Error(err);
          }            
  }

const Bet = mongoose.model('Bet', BetSchema);
const CombinedBet = mongoose.model('CombinedBet', CombinedBetSchema);

module.exports = { Bet, CombinedBet };
