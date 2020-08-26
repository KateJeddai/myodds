const { GraphQLObjectType, 
        GraphQLID,
        GraphQLFloat,
        GraphQLString,
        GraphQLList,
        GraphQLInt,
        GraphQLInputObjectType,
        GraphQLNonNull,
        GraphQLBoolean } = require('graphql');

const IdType = new GraphQLObjectType({
    name: 'Id',
    fields: () => ({
        _id: {type: GraphQLID}
    })
})

const FileType = new GraphQLObjectType({
    name: 'File',
    fields: () => ({
      id: {type: GraphQLID},
      path: {type: GraphQLString},
      filename: {type: GraphQLString},
      mimetype: {type: GraphQLString}
    })
});

const TeamLogoType = new GraphQLObjectType({
    name: 'TeamLogo',
    fields: () => ({
      _id: {type: GraphQLID},
      logo: {type: FileType},
      team_name: {type: GraphQLString}
    })
});

const ScoreType = new GraphQLObjectType({
    name: 'Score',
    fields: () => ({
        first_team_score: {type: GraphQLInt},
        second_team_score: {type: GraphQLInt}
    })
});

const GameResultType = new GraphQLObjectType({
    name: 'Result',
    fields: () => ({
        winner: {type: GraphQLString},
        score: {type: ScoreType}
    })
});

const NumberOfBetsType = new GraphQLObjectType({
    name: 'BetsNumber',
    fields: () => ({
        _id: {type: GraphQLID},
        users_betted: {type: new GraphQLList(IdType)},
        bets_count: {type: GraphQLFloat}
    })
})

const GameType = new GraphQLObjectType({
    name: 'Game',
    fields: () => ({
        _id: {type: GraphQLID},
        first_team: {type: GraphQLString},
        second_team: {type: GraphQLString},
        firstwin_odds: {type: GraphQLFloat},
        secondwin_odds: {type: GraphQLFloat},
        draw_odds: {type: GraphQLFloat},
        game_date: {type: GraphQLString},
        game_type: {type: GraphQLString},
        game_result: {type: GameResultType},
        number_of_bets: {type: NumberOfBetsType}       
    })
});

const BetType = new GraphQLObjectType({
    name: 'Bet',
    fields: () => ({
        _id: {type: GraphQLID},
        team: {type: GraphQLString},
        amount: {type: GraphQLFloat},
        user: {type: UserType},
        game: {type: GameType},
        archived: {type: GraphQLBoolean},
        won: {type: GraphQLBoolean}
    })
});

const TeamType = new GraphQLObjectType({
    name: 'TeamType',
    fields: () => ({
        gameId: {type: GraphQLID},
        team: {type: GraphQLString}
    })
});

const TeamInputType = new GraphQLInputObjectType({
    name: 'TeamInputType',
    fields: () => ({
        gameId: {type: GraphQLID},
        team: {type: GraphQLString}
    })
});

const CombinedBetType = new GraphQLObjectType({
    name: 'CombinedBet',
    fields: () => ({
        _id: {type: GraphQLID},
        teams: {type: GraphQLList(TeamType)},
        amount: {type: GraphQLFloat},
        user: {type: UserType},
        games: {type: GraphQLList(GameType)},
        archived: {type: GraphQLBoolean},
        won: {type: GraphQLBoolean}
    })
})

const TokenType = new GraphQLObjectType({
    name: 'Token',
    fields: () => ({
        _id: {type: GraphQLID},
        access: {type: GraphQLString},
        token: {type: GraphQLString},
        expiresIn: {type: GraphQLString}
    })
})

const BetsCountType = new GraphQLObjectType({
    name: 'BetsCount',
    fields: () => ({
        ordBetsWon: {type: GraphQLInt},
        ordBetsLost: {type: GraphQLInt},
        combBetsWon: {type: GraphQLInt},
        combBetsLost: {type: GraphQLInt}
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: {type: GraphQLID},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        firstname: {type: GraphQLString},
        lastname: {type: GraphQLString},
        deposit_limit: {type: GraphQLInt},
        deposit_date: {type: GraphQLString},
        frequency_limit: {type: GraphQLString},
        bets: {type: new GraphQLList(IdType)},
        betsCount: {type: BetsCountType},
        token: {type: TokenType},
        confirmToken: {type: GraphQLString}
    })
})

module.exports = {
    GameType, 
    BetType, 
    CombinedBetType, 
    UserType, 
    TeamInputType,
    FileType,
    TeamLogoType 
};
