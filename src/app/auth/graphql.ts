import gql from 'graphql-tag';

export const addUser = gql`mutation signupUser($email: String!, $password: String!, $firstname: String!,
                                               $lastname: String!, $deposit_limit: Int!, $deposit_date: String!, 
                                               $frequency_limit: String!) {
                                        signupUser(email: $email, password: $password, firstname: $firstname, lastname: $lastname,
                                                    deposit_limit: $deposit_limit, deposit_date: $deposit_date, frequency_limit: $frequency_limit) {
                                                        _id
                                                        email
                                                        frequency_limit
                                                        deposit_date
                                                        deposit_limit
                                                    }
}`;

export const loginUser = gql`mutation loginUser($email: String!, $password: String!) {
                                        loginUser(email: $email, password: $password) {
                                                    _id
                                                    token {
                                                        access
                                                        token
                                                        expiresIn
                                                    }
                                                    betsCount {
                                                        ordBetsWon
                                                        ordBetsLost
                                                        combBetsWon
                                                        combBetsLost
                                                    }
                                                }
}`;

export const updateUser = gql`mutation updateUserData($_id: ID!, $email: String!, $password: String!, $firstname: String!,
                                        $lastname: String!, $deposit_limit: Int!, $deposit_date: String!, 
                                        $frequency_limit: String!) {
                                            updateUserData(_id: $_id, email: $email, password: $password, firstname: $firstname, lastname: $lastname,
                                            deposit_limit: $deposit_limit, deposit_date: $deposit_date, frequency_limit: $frequency_limit) {
                                                _id
                                                email
                                                frequency_limit
                                                deposit_date
                                                deposit_limit
                                            }
}`;

export const updateUserDeposit = gql`mutation updateUserDeposit($userId: ID!, $newDeposit: Int!, $depositFrequency: String!) {
                                                updateUserDeposit(userId: $userId, newDeposit: $newDeposit, depositFrequency: $depositFrequency) {
                                                    _id
                                                }
}`;

export const restorePasswordRequest = gql`mutation restorePasswordRequest($email: String!) {
                                                      restorePasswordRequest(email: $email) {
                                                        _id
                                                      }
}`;

export const updatePassword = gql`mutation updatePassword($pass: String!, $token: String!) {
                                                updatePassword(pass: $pass, token: $token) {
                                                    _id
                                                }
}`;

export const fetchUserData = gql`query user($id: ID!) {
                                        user(id: $id) {
                                            _id
                                            email
                                            firstname
                                            lastname
                                            deposit_limit
                                            deposit_date
                                            frequency_limit                                        
                                        }
}`; 

export const fetchUserOrdinaryBetsAll = gql`query ordinaryBetsAll($id: ID!) {
    ordinaryBetsAll(id: $id) {
        _id
        team
        amount
        user {
            _id
        }
        game {
            _id
            first_team
            second_team
            game_date
            game_type
            firstwin_odds
            secondwin_odds
            draw_odds
            game_result {
                winner
                score {
                    first_team_score
                    second_team_score
                }
            }
        }
    }
}`;

export const fetchUserOrdinaryBets = gql`query ordinaryBets($id: ID!) {
                                            ordinaryBets(id: $id) {
                                                _id
                                                team
                                                amount
                                                user {
                                                    _id
                                                }
                                                game {
                                                    _id
                                                    first_team
                                                    second_team
                                                    game_date
                                                    game_type
                                                    firstwin_odds
                                                    secondwin_odds
                                                    draw_odds
                                                    game_result {
                                                        winner
                                                        score {
                                                            first_team_score
                                                            second_team_score
                                                        }
                                                    }
                                                }
                                            }
}`;

export const fetchUserOrdinaryBetsWon = gql`query ordinaryBetsWon($id: ID!, $limit: Int!, $page: Int!) {
    ordinaryBetsWon(id: $id, limit: $limit, page: $page) {
        _id
        team
        amount
        user {
            _id
        }
        game {
            _id
            first_team
            second_team
            game_date
            game_type
            firstwin_odds
            secondwin_odds
            draw_odds
            game_result {
                winner
                score {
                    first_team_score
                    second_team_score
                }
            }
        }
    }
}`;

export const fetchUserOrdinaryBetsLost = gql`query ordinaryBetsLost($id: ID!, $limit: Int!, $page: Int!) {
    ordinaryBetsLost(id: $id, limit: $limit, page: $page) {
        _id
        team
        amount
        user {
            _id
        }
        game {
            _id
            first_team
            second_team
            game_date
            game_type
            firstwin_odds
            secondwin_odds
            draw_odds
            game_result {
                winner
                score {
                    first_team_score
                    second_team_score
                }
            }
        }
    }
}`;

export const fetchUserCombinedBetsAll = gql`query combinedBetsAll($id: ID!) {
    combinedBetsAll(id: $id) {
        _id
        teams {
            gameId
            team
        }
        amount
        user {
            _id
        }
        games {
            _id
            first_team
            second_team
            game_date
            game_type
            firstwin_odds
            secondwin_odds
            draw_odds
            game_result {
                winner
                score {
                    first_team_score
                    second_team_score
                }
            }
        }
    }
}`;

export const fetchUserCombinedBets = gql`query combinedBets($id: ID!) {
                                            combinedBets(id: $id) {
                                                _id
                                                teams {
                                                    gameId
                                                    team
                                                }
                                                amount
                                                user {
                                                    _id
                                                }
                                                games {
                                                    _id
                                                    first_team
                                                    second_team
                                                    game_date
                                                    game_type
                                                    firstwin_odds
                                                    secondwin_odds
                                                    draw_odds
                                                    game_result {
                                                        winner
                                                        score {
                                                            first_team_score
                                                            second_team_score
                                                        }
                                                    }
                                                }
                                            }
}`;

export const fetchUserCombinedBetsWon = gql`query combinedBetsWon($id: ID!, $limit: Int!, $page: Int!) {
    combinedBetsWon(id: $id, limit: $limit, page: $page) {
        _id
        teams {
            gameId
            team
        }
        amount
        user {
            _id
        }
        games {
            _id
            first_team
            second_team
            game_date
            game_type
            firstwin_odds
            secondwin_odds
            draw_odds
            game_result {
                winner
                score {
                    first_team_score
                    second_team_score
                }
            }
        }
    }
}`;

export const fetchUserCombinedBetsLost = gql`query combinedBetsLost($id: ID!, $limit: Int!, $page: Int!) {
    combinedBetsLost(id: $id, limit: $limit, page: $page) {
        _id
        teams {
            gameId
            team
        }
        amount
        user {
            _id
        }
        games {
            _id
            first_team
            second_team
            game_date
            game_type
            firstwin_odds
            secondwin_odds
            draw_odds
            game_result {
                winner
                score {
                    first_team_score
                    second_team_score
                }
            }
        }
    }
}`;
