const addBetsNumberAndUserToGame = (game, user) => {
        game.number_of_bets.users_betted.indexOf(user._id) < 0  && game.number_of_bets.users_betted.push(user._id); 
        let numberOfBets = game.number_of_bets.bets_count ? game.number_of_bets.bets_count : 0;
        numberOfBets = numberOfBets >= 1 ? numberOfBets + 1 : 1;
        game.number_of_bets.bets_count = numberOfBets;        
        return game;
}

module.exports = {addBetsNumberAndUserToGame};
