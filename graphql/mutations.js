const { GraphQLObjectType, 
        GraphQLID,
        GraphQLFloat,
        GraphQLString,
        GraphQLInt,
        GraphQLList } = require('graphql');
const { GraphQLUpload } = require('graphql-upload');
const Game = require('../mongoose/models/game');
const User = require('../mongoose/models/user');
const TeamLogo = require('../mongoose/models/teamLogo');
const { Bet, CombinedBet } = require('../mongoose/models/bet');
const { GameType, UserType, BetType, CombinedBetType, TeamInputType, FileType, TeamLogoType  } = require('./types');
const { ifAuthenticated, ifAdmin } = require('./middleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {addBetsNumberAndUserToGame} = require('./helpers');
const {sendMailToRestorePass} = require('../nodemailer/nodemailer');
const { createWriteStream, unlink } = require('fs');
const path = require('path');


const checkIfBetsOutdated = (combinedBetsData) => {
    const archivedBetsData = combinedBetsData.filter(bet => {
          const now = new Date().getTime();
          const archivedGames = bet.games.filter(game => {
              return game.game_date < now;
          });
          const lostGames = archivedGames.filter(game => {
              for(let i = 0; i < bet.teams.length; i++) {
                if(bet.teams[i].gameId === game._id) {
                    if(bet.teams[i].team !== game.game_result.winner) {
                        return game;
                    }
                }
              }  
          })          
          if(archivedGames.length === bet.games.length || lostGames.length > 0) {
               return bet;
          }   
    })
    return archivedBetsData;
}

const checkIfCombinedBetWon = (bet) => {
    const {games, teams} = bet;
    const gamesWon = games.filter(game => {
        for(let i = 0; i < teams.length; i++) {
            if(teams[i].gameId == game._id) {
                if(teams[i].team == game.game_result.winner) {
                    return game;
                }
            }
        } 
    })
    if(gamesWon.length === games.length) {
        return true;
    } else return false;
}

const addArchivedWonFieldsToOrdinaryBet = async (userId) => {
    const user = await User.findById(userId)
                           .populate('bets.ordinaryBets');
                           
    const ordinaryBets = user.bets.ordinaryBets.filter(bet => !bet.archived);
    if(ordinaryBets.length > 0) {
        const ordinaryBetsWithGamesPromises = ordinaryBets.map(async bet => {
            const betDataPromises = await Bet.findById(bet._id)
                                             .populate('game');
            return betDataPromises;                              
        })
        const ordinaryBetsWithGames = await Promise.all(ordinaryBetsWithGamesPromises);
        const ordinaryBetsArchived = ordinaryBetsWithGames.filter(bet => bet.game.game_date < new Date().getTime());

        let ordinaryBetsArchivedWon = ordinaryBetsArchived.filter(bet => {
            if(bet.game.game_result.winner === bet.team) {
                return bet;
            }
        });
        let ordinaryBetsArchivedLost = ordinaryBetsArchived.filter(bet => {
            if(bet.game.game_result.winner !== bet.team) {
                return bet;
            }
        });

        const ordinaryBetsWonPromises = ordinaryBetsArchivedWon.map(async bet => {
            const betDataPromise = await Bet.fillArchivedWonField(bet._id, 'won');
            return betDataPromise;
        });
        ordinaryBetsArchivedWon = await Promise.all(ordinaryBetsWonPromises);

        const ordinaryBetsLostPromises = ordinaryBetsArchivedLost.map(async bet => {
            const betDataPromise = await Bet.fillArchivedWonField(bet._id, 'lost');
            return betDataPromise;
        });
        ordinaryBetsArchivedLost = await Promise.all(ordinaryBetsLostPromises);
        return {lost:  ordinaryBetsArchivedLost, won: ordinaryBetsArchivedWon};
    }
}

const addArchivedWonFieldsToCombinedBet = async (userId) => {
    const user = await User.findById(userId)
                           .populate('bets.combinedBets');
    const combinedBets = user.bets.combinedBets.filter(bet => !bet.archived);
    if(combinedBets.length > 0) {
        const combinedBetsWithGamesPromises = combinedBets.map(async cBet => {
                    const betDataPromises = await CombinedBet.findById(cBet._id)
                                                             .populate('games');
                    return betDataPromises;
            })
            let combinedBetsData = await Promise.all(combinedBetsWithGamesPromises);
                combinedBetsData = checkIfBetsOutdated(combinedBetsData);

            let combinedBetsDataWon = combinedBetsData.filter((bet) => checkIfCombinedBetWon(bet));                      
            let combinedBetsDataLost = combinedBetsData.filter((bet) => !checkIfCombinedBetWon(bet));
           
            const combinedBetsDataWonPromises = combinedBetsDataWon.map(async bet => {
                const betToUpdatePromise = await CombinedBet.fillArchivedWonField(bet._id, 'won');                         
                return betToUpdatePromise;
            });
            combinedBetsDataWon = await Promise.all(combinedBetsDataWonPromises);

            const combinedBetsDataLostPromises = combinedBetsDataLost.map(async bet => {
                const betToUpdatePromise = await CombinedBet.fillArchivedWonField(bet._id, 'lost');                         
                return betToUpdatePromise;
            });
            combinedBetsDataLost = await Promise.all(combinedBetsDataLostPromises);
            return {lost: combinedBetsDataLost, won: combinedBetsDataWon};
    }
} 


const RootMutation = new GraphQLObjectType({
    name: 'MutationType',
    fields: {
        addGame: {
            type: GameType,
            args: {
                first_team: {type: GraphQLString},
                second_team: {type: GraphQLString},
                firstwin_odds: {type: GraphQLFloat},
                secondwin_odds: {type: GraphQLFloat},
                draw_odds: {type: GraphQLFloat},
                game_date: {type: GraphQLString},
                game_type: {type: GraphQLString}  
            },
            resolve: ifAdmin(async(root, args, options) => {
                try {
                    const newGame = new Game({
                        first_team: args.first_team,
                        second_team: args.second_team,
                        firstwin_odds: +args.firstwin_odds,
                        secondwin_odds: +args.secondwin_odds,
                        draw_odds: +args.draw_odds,
                        game_date: args.game_date,
                        game_type: args.game_type
                    }); 
                    const res = await newGame.save();
                    return res;
                } 
                catch(err) {
                    console.log(err);
                    throw new Error(err);
                }
            })            
        },
        addTeamLogo: {
            type: TeamLogoType,
            args: {            
              file: {type: GraphQLUpload},
              team_name: {type: GraphQLString}
            },
            async resolve (root, args, options) {
                const file = await args.file;
                const { createReadStream, filename, mimetype } = file;
                const stream = createReadStream();  
                const path = '../client/backend/images/' + filename;
                const dbPath = options.imagePath + '' + filename;
                const fileData = { filename, mimetype, path };
                await new Promise((resolve, reject) => {
                    console.log(path)
                    const writeStream = createWriteStream(path);
                    // When the upload is fully written, resolve the promise.
                    writeStream.on('finish', resolve);
                    // If there's an error writing the file, remove the partially written file and reject the promise.
                    writeStream.on('error', (error) => {
                        unlink(path, () => {
                            console.log(error)
                            reject(error);
                        });
                    });
                    // In node <= 13, errors are not automatically propagated between piped
                    // streams. If there is an error receiving the upload, destroy the write
                    // stream with the corresponding error.
                    stream.on('error', (error) => writeStream.destroy(error));
                    // Pipe the upload into the write stream.
                    stream.pipe(writeStream);
                });
                const logo = new TeamLogo({
                    team_name: args.team_name,
                    logo: {
                        path: dbPath, filename, mimetype
                    }
                })
                const res = await logo.save();
                return res;
            }
        },
        editGame: {
            type: GameType,
            args: {
                id: {type: GraphQLID},
                first_team: {type: GraphQLString},
                second_team: {type: GraphQLString},
                firstwin_odds: {type: GraphQLFloat},
                secondwin_odds: {type: GraphQLFloat},
                draw_odds: {type: GraphQLFloat},
                game_date: {type: GraphQLString},
                game_type: {type: GraphQLString},
                winner: {type: GraphQLString},
                first_team_score: {type: GraphQLInt},
                second_team_score: {type: GraphQLInt}
            },
            resolve: ifAdmin(async(root, args, options) => {
                let updatedData;
                try {
                    if(args.winner) {
                        updatedData = {
                            game_result: {
                                winner: args.winner,
                                score: {
                                    first_team_score: args.first_team_score,
                                    second_team_score: args.second_team_score
                                }
                            }
                        }
                    }
                    else if(!args.winner) {
                        updatedData = {
                            first_team: args.first_team,
                            second_team: args.second_team,
                            firstwin_odds: +args.firstwin_odds,
                            secondwin_odds: +args.secondwin_odds,
                            draw_odds: +args.draw_odds,
                            game_date: args.game_date,
                            game_type: args.game_type
                        };
                    }
                    const updatedGame = await Game.findOneAndUpdate({_id: args.id}, updatedData, {new: true});
                    return updatedGame;
                } 
                catch(err) {
                    console.log(err);
                    throw new Error(err);
                }
            })
        },
        betOnGame: {
            type: BetType,
            args: {
                team: {type: GraphQLString},
                amount: {type: GraphQLFloat},
                gameId: {type: GraphQLID},
                userId: {type: GraphQLID}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                console.log(args)
                try {
                    const user = await User.findById(args.userId);
                    const game = await Game.findById(args.gameId);                    
                    const newBet = new Bet({
                        team: args.team,
                        amount: args.amount,
                        game: args.gameId,
                        user: args.userId
                    });
                    const bet = await newBet.save();  
                    user.bets.ordinaryBets.push(bet._id);
                    user.deposit_limit = user.deposit_limit - args.amount;
                    await user.save();

                    game.number_of_bets.users_betted.indexOf(user._id) < 0  && game.number_of_bets.users_betted.push(user._id);
                    let numberOfBets = game.number_of_bets.bets_count;
                    numberOfBets = numberOfBets >= 1 ? numberOfBets + 1 : 1;
                    game.number_of_bets.bets_count = numberOfBets;
                    await game.save();
                    console.log(bet)
                    return bet;                          
                } catch(err) {
                    console.log(err);
                    throw new Error('Something went wrong');
                }
            })
        },
        betOnGameCombined: {
            type: CombinedBetType,
            args: {
                teams: {type: new GraphQLList(TeamInputType)},
                amount: {type: GraphQLFloat},
                gameIds: {type: new  GraphQLList(GraphQLID)},
                userId: {type: GraphQLID}
            },
            resolve: ifAuthenticated(async(root, args, options) => {
                const newCombinedBet = new CombinedBet({
                    teams: args.teams,
                    amount: args.amount,
                    games: args.gameIds,
                    user: args.userId
                });
                try {
                    const bet = await newCombinedBet.save();
                    const user = await User.findById(args.userId);
                    user.bets.combinedBets.push(bet._id);
                    user.deposit_limit = user.deposit_limit - args.amount;
                    await user.save();

                    const gamePromises = args.gameIds.map(async id => {
                        const game = await Game.findById(id);
                        return game;
                    })
                    const games = await Promise.all(gamePromises);  
                    const updatedAnsSavedGamesPromises = games.map(async (game) => {
                            const updatedGame = addBetsNumberAndUserToGame(game, user);
                            const res = await updatedGame.save();
                            return game;
                          })
                     const updatedAndSavedGames = await Promise.all(updatedAnsSavedGamesPromises);
                     return bet;
                } catch(err) {
                    console.log(err);
                    throw new Error('Something went wrong');
                }
            })
        },
        signupUser: {
            type: UserType,
            args: {
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                firstname: {type: GraphQLString},
                lastname: {type: GraphQLString},
                deposit_limit: {type: GraphQLInt},
                deposit_date: {type: GraphQLString},
                frequency_limit: {type: GraphQLString}
            },
            async resolve (root, args, options) {
                try {
                    const ifPresent = await User.findOne({email: args.email});
                    if(ifPresent) {
                        throw new Error('User with this email already exists');
                    }
                    const newUser = new User({
                        email: args.email,
                        password: args.password,
                        firstname: args.firstname,
                        lastname: args.lastname,
                        deposit_limit: args.deposit_limit,
                        deposit_date: args.deposit_date,
                        frequency_limit: args.frequency_limit
                    });
                    const res = await newUser.save();
                    return res;
                    
                } catch(err) {
                    throw new Error (err.message);
                }
            }
        },
        loginUser: {
            type: UserType,
            args: {
                email: {type: GraphQLString},
                password: {type: GraphQLString}
            },
            async resolve (root, args, options) {
               try {
                    const user = await User.findByCredentials(args.email, args.password);  
                    if(!user) {
                        throw new Error('Authentication data is incorrect.');
                    }
                    let access = args.email === "katia_sm_1983@rambler.ru" ? 'admin' : 'user';
                        const userWithToken = await user.createAuthToken(access); 

                    const combinedBetsDataUpdated = await addArchivedWonFieldsToCombinedBet(user._id);
                    const ordinaryBetsDataUpdated = await addArchivedWonFieldsToOrdinaryBet(user._id);

                    const ordBetsWon = await Bet.find({user: user._id, archived: true, won: true})
                                                .countDocuments();
                    const ordBetsLost = await Bet.find({user: user._id, archived: true, won: false})
                                                 .countDocuments();
                    const combBetsWon = await CombinedBet.find({user: user._id, archived: true, won: true})
                                                         .countDocuments();
                    const combBetsLost = await CombinedBet.find({user: user._id, archived: true, won: false})
                                                          .countDocuments();

                    return {_id: user._id, token: userWithToken.token, betsCount: { ordBetsWon,
                                                                                    ordBetsLost,
                                                                                    combBetsWon,
                                                                                    combBetsLost}};
                } catch(err) {
                    console.log(err);
                    throw new Error(err);
                }
            }
        },
        updateUserData: {
            type: UserType,
            args: {
                _id: {type: GraphQLID},
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                firstname: {type: GraphQLString},
                lastname: {type: GraphQLString},
                deposit_limit: {type: GraphQLInt},
                deposit_date: {type: GraphQLString},
                frequency_limit: {type: GraphQLString}
            },
            async resolve (root, args, options) {
                try {
                    const user = await User.findById(args._id);
                    const ifUser = await bcrypt.compare(args.password, user.password);
                    if(!ifUser) {
                        user.password = args.password;
                        await user.save();
                    }  
                    const updatedUserData = {
                        email: args.email,
                        firstname: args.firstname,
                        lastname: args.lastname,
                        deposit_limit: args.deposit_limit,
                        deposit_date: args.deposit_date,
                        frequency_limit: args.frequency_limit
                    };
                    const updatedUser = await User.findOneAndUpdate({_id: args._id}, updatedUserData, {new: true}); 
                    return updatedUser;   
                } catch(err) {
                    throw new Error(err);
                }
            }
        },
        updateUserDeposit: {
            type: UserType,
            args: {
                userId: {type: GraphQLID},
                newDeposit: {type: GraphQLInt},
                depositFrequency: {type: GraphQLString}
            },
            async resolve (root, args, options) {
                try {
                    const user = await User.findById(args.userId);
                    if(!user) {
                        throw new Error('User not found.');
                    }
                    user.deposit_limit = args.newDeposit;
                    user.deposit_date = "" + new Date().getTime();
                    user.frequency_limit = args.depositFrequency;
                    const res = await user.save();
                    console.log('user', res)
                    return res;
                } catch(err) {
                    console.log(err);
                    throw new Error(err);
                }
            }
        },
        restorePasswordRequest: {
            type: UserType,
            args: {
                email: {type: GraphQLString}
            },        
            async resolve (root, args, options) {
                try {
                    const user = await User.findOne({email: args.email});
                    if(!user) {
                        throw new Error('User not found.');
                    }
                    const token = jwt.sign({username: user.lastname}, 
                                            process.env.JWT_SECRET, 
                                            { expiresIn: '24h' }).toString();
                        
                    const newUser = await User.findOneAndUpdate({email: args.email}, { '$set': { confirmToken: token }}, {new: true});
                    sendMailToRestorePass(newUser, options.host);
                    return newUser;
                } catch(err) {
                    console.log(err);
                    throw new Error(err); 
                }
            }
        },
        updatePassword: {
            type: UserType,
            args: {
                pass: {type: GraphQLString},
                token: {type: GraphQLString}
            },
            async resolve (root, args, options) {
                try {
                    const user = await User.findOne({confirmToken: args.token});
                    user.password = args.pass;
                    const res = await user.save();
                    return res;
                } catch(err) {
                    console.log(err);
                    throw new Error(err);
                }
            }
        }
    } 
    
});

module.exports = RootMutation;
