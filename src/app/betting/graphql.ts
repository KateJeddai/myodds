import gql from 'graphql-tag';

export const getGames = gql`query {
        games {
            _id
            first_team
            second_team
            firstwin_odds
            secondwin_odds
            draw_odds
            game_date
            game_type
        } 
    }`;

export const getGame = gql`query game($id: ID!) {
                            game(id: $id) {
                                _id
                                first_team
                                second_team
                                firstwin_odds
                                secondwin_odds
                                draw_odds
                                game_date
                                game_type
                                game_result {
                                    winner
                                    score {
                                        first_team_score
                                        second_team_score
                                    }
                                }
                    }
}`; 

export const getTeamsLogos = gql`query {
        logos {
            _id
            team_name
            logo {
                path
            }
        }
}`;

export const addGame =  gql`mutation addGame($first_team: String!, $second_team: String!, 
                                      $firstwin_odds: Float!, $secondwin_odds: Float!,
                                      $draw_odds: Float!, $game_date: String!, $game_type: String!) {
                                            addGame(first_team: $first_team, second_team: $second_team, 
                                                    firstwin_odds: $firstwin_odds, secondwin_odds: $secondwin_odds,
                                                    draw_odds: $draw_odds, game_date: $game_date, game_type: $game_type) {
                                                        _id
                                                    }
}`;

export const addTeamLogo = gql`mutation addTeamLogo($file: Upload!, $team_name: String!) {
                                            addTeamLogo(file: $file, team_name: $team_name) {
                                                _id
                                            }
}`;

export const editGame = gql`mutation editGame($id: ID!, $first_team: String, $second_team: String, 
                                       $firstwin_odds: Float, $secondwin_odds: Float,
                                       $draw_odds: Float, $game_date: String, $game_type: String,
                                       $winner: String, $first_team_score: Int, $second_team_score: Int) {
                                            editGame(id: $id, first_team: $first_team, second_team: $second_team, 
                                                     firstwin_odds: $firstwin_odds, secondwin_odds: $secondwin_odds,
                                                     draw_odds: $draw_odds, game_date: $game_date, game_type: $game_type,
                                                     winner: $winner, first_team_score: $first_team_score, second_team_score: $second_team_score) {
                                                        _id
                                                    }
                                       }`;

export const betOnGame = gql`mutation betOnGame($team: String!, $amount: Float!, $userId: ID!, $gameId: ID!) {
                                    betOnGame(team: $team, amount: $amount, userId: $userId, gameId: $gameId) {
                                        _id
                                    }
}`;

export const betOnGameCombined = gql`mutation betOnGameCombined($teams: [TeamInputType]!, $amount: Float!, $userId: ID!, $gameIds: [ID]!) {
                                            betOnGameCombined(teams: $teams, amount: $amount, userId: $userId, gameIds: $gameIds) {
                                                _id
                                            }
}`;
