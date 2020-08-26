const { GraphQLObjectType, 
        GraphQLID,
        GraphQLList,
        GraphQLString,
        GraphQLInt } = require('graphql');
const Game = require('../mongoose/models/game');
const User = require('../mongoose/models/user');
const TeamLogo = require('../mongoose/models/teamLogo');
const { Bet, CombinedBet } = require('../mongoose/models/bet');
const { GameType, UserType, BetType, CombinedBetType, TeamLogoType } = require('./types');
const { ifAuthenticated } = require('./middleware');


const RootQuery = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        games: {
            type: new GraphQLList(GameType),
            resolve: async (parent, args) => {
                try {
                    const games = await Game.find({game_date: {$gt: new Date().getTime()}});
                    return games.map(game => game._doc);
                } catch(err) {
                    throw new Error('Can\'t fetch games');
                }
            }
        },
        logos: {
            type: new GraphQLList(TeamLogoType),
            resolve: async (parent, args) => {
                try {
                    const logos = await TeamLogo.find();
                    return logos.map(logo => logo._doc);
                } catch(err) {
                    throw new Error('Can\'t fetch logos');
                }
            }
        },
        game: {
            type: GameType,
            args: {
                id: {type: GraphQLID}
            },
            resolve: async (parent, args) => {
                try { 
                    const game = await Game.findById(args.id);
                    return game;
                } catch(err) {
                    throw new Error('Game not found');
                }
            }
        },
        user: {
            type: UserType,
            args: {
                id: {type: GraphQLID}
            },
            resolve: async (parent, args) => {
                try {
                    const user = await User.findById(args.id);
                    return user;
                } catch(err) {
                    throw new Error('User not found');
                }
            }
        },
        // ORDINARY BETS ALL
        ordinaryBetsAll: {
            type: new GraphQLList(BetType),
            args: {
                id: {type: GraphQLID}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try {
                    const ordBets = await Bet.find({user: args.id});
                    const newOrdinaryBets = ordBets.map(async oBet => {
                        const bet = await Bet.findOne({_id: oBet._id})
                                             .populate('game');
                            return bet;
                        });
                    const ordinaryBetsData = await Promise.all(newOrdinaryBets);
                    return ordinaryBetsData;
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        // ORDINARY BETS ACTIVE
        ordinaryBets: {
            type: new GraphQLList(BetType),
            args: {
                id: {type: GraphQLID}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try {
                    const ordBets = await Bet.find({user: args.id, archived: false});
                    const newOrdinaryBets = ordBets.map(async oBet => {
                        const bet = await Bet.findOne({_id: oBet._id})
                                             .populate('game');
                            return bet;
                        });
                    const ordinaryBetsData = await Promise.all(newOrdinaryBets);
                    return ordinaryBetsData;
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        // ORDINARY BETS ARCHIVED
        ordinaryBetsWon: {
            type: new GraphQLList(BetType),
            args: {
                id: {type: GraphQLID},
                limit: {type: GraphQLInt},
                page: {type: GraphQLInt}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try {
                    let ordBetsWon;
                    if(args.limit && args.page) {
                        console.log(args.limit, args.page)
                        const numToSkip = args.limit * (args.page - 1);
                        ordBetsWon = await Bet.find({user: args.id, archived: true, won: true})
                                              .skip(numToSkip)
                                              .limit(args.limit);
                    }
                    else ordBetsWon = await Bet.find({user: args.id, archived: true, won: true});
                    const ordinaryBetsWonPromises = ordBetsWon.map(async oBet => {
                        const bet = await Bet.findOne({_id: oBet._id})
                                             .populate('game');
                            return bet;
                        });
                    const ordinaryBetsWon = await Promise.all(ordinaryBetsWonPromises);
                    return ordinaryBetsWon;                    
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        ordinaryBetsLost: {
            type: new GraphQLList(BetType),
            args: {
                id: {type: GraphQLID},
                limit: {type: GraphQLInt},
                page: {type: GraphQLInt}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try {
                    let ordBetsLost;
                    if(args.limit && args.page) {
                        const numToSkip = args.limit * (args.page - 1);
                        ordBetsLost = await Bet.find({user: args.id, archived: true, won: false})
                                               .skip(numToSkip)
                                               .limit(args.limit);
                    }
                    else ordBetsLost = await Bet.find({user: args.id, archived: true, won: false});
                    const ordinaryBetsLostPromises = ordBetsLost.map(async oBet => {
                        const bet = await Bet.findOne({_id: oBet._id})
                                             .populate('game');
                            return bet;
                        });
                    const ordinaryBetsLost = await Promise.all(ordinaryBetsLostPromises);
                    return ordinaryBetsLost;                    
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        // COMBINED BETS ALL
        combinedBetsAll: {
            type: new GraphQLList(CombinedBetType),
            args: {
                id: {type: GraphQLID}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try { 
                    const combBets = await CombinedBet.find({user: args.id});
                    const newCombinedBetsPromises = combBets.map(async cBet => {
                          const betDataPromises = await CombinedBet.findById(cBet._id)
                                                                   .populate('games');
                                return betDataPromises;
                    })
                    const combinedBetsData = await Promise.all(newCombinedBetsPromises);
                    return combinedBetsData;
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        // COMBINED BETS ACTIVE
        combinedBets: {
            type: new GraphQLList(CombinedBetType),
            args: {
                id: {type: GraphQLID}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try { 
                    const combBets = await CombinedBet.find({user: args.id, archived: false});
                    const newCombinedBetsPromises = combBets.map(async cBet => {
                          const betDataPromises = await CombinedBet.findById(cBet._id)
                                                                   .populate('games');
                                return betDataPromises;
                    })
                    const combinedBetsData = await Promise.all(newCombinedBetsPromises);
                    return combinedBetsData;
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        // COMBINED BETS ARCHIVED
        combinedBetsWon: {
            type: new GraphQLList(CombinedBetType),
            args: {
                id: {type: GraphQLID},
                limit: {type: GraphQLInt},
                page: {type: GraphQLInt}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try {  
                    let combBetsWon;
                    if(args.limit && args.page) {
                        const numToSkip = args.limit * (args.page - 1);                  
                        combBetsWon = await CombinedBet.find({user: args.id, archived: true, won: true})
                                                       .skip(numToSkip)
                                                       .limit(args.limit);  
                    }
                    else combBetsWon = await CombinedBet.find({user: args.id, archived: true, won: true});                     
                    const combinedBetsWonPromises = combBetsWon.map(async cBet => {
                        const betDataPromises = await CombinedBet.findById(cBet._id)
                                                                 .populate('games');
                              return betDataPromises;
                    });
                    const combinedBetsWon = await Promise.all(combinedBetsWonPromises);
                    return combinedBetsWon;
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        },
        combinedBetsLost: {
            type: new GraphQLList(CombinedBetType),
            args: {
                id: {type: GraphQLID},
                limit: {type: GraphQLInt},
                page: {type: GraphQLInt}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                try {
                    let combBetsLost;
                    if(args.limit && args.page) {
                        const numToSkip = args.limit * (args.page - 1);
                        combBetsLost = await CombinedBet.find({user: args.id, archived: true, won: false})
                                                        .skip(numToSkip)
                                                        .limit(args.limit);
                    }
                    else combBetsLost = await CombinedBet.find({user: args.id, archived: true, won: false});
                    const combinedBetsLostPromises = combBetsLost.map(async cBet => {
                        const betDataPromises = await CombinedBet.findById(cBet._id)
                                                                 .populate('games');
                              return betDataPromises;
                    });
                    const combinedBetsLost = await Promise.all(combinedBetsLostPromises);
                    return combinedBetsLost;                   
                } catch(err) {
                    throw new Error('User not found');
                }
            })
        }
    }
});

module.exports = RootQuery;
