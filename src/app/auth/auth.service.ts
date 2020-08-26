import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { fetchUserData, fetchUserOrdinaryBets, 
         fetchUserCombinedBets, loginUser, 
         addUser, updateUser, updateUserDeposit,
         restorePasswordRequest, updatePassword,
         fetchUserCombinedBetsAll, 
         fetchUserOrdinaryBetsAll,
         fetchUserOrdinaryBetsWon,
         fetchUserOrdinaryBetsLost,
         fetchUserCombinedBetsWon,
         fetchUserCombinedBetsLost } from './graphql';
import { User } from './user';
import { Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
    isAuthenticated = false;
    isAdmin = false;
    authStateListener = new Subject<boolean>();
    adminStateListener = new Subject<boolean>();
    private timer: any;

    constructor(private apollo: Apollo,
                private router: Router) {}

    getAuthStateListener() {
        return this.authStateListener.asObservable();
    }  
    
    getAdminStateListener() {
        return this.adminStateListener.asObservable();
    }

    signupUser(user: User) {
        const { firstname, lastname, email, password, frequency_limit, deposit_limit, deposit_date } = user;
        return this.apollo.mutate({
            mutation: addUser,
            variables: {
                firstname,
                lastname,
                email,
                password,
                frequency_limit,
                deposit_limit,
                deposit_date
            }
        })
    }

    updateUser(user: User) {
        const { _id, firstname, lastname, email, password, frequency_limit, deposit_limit, deposit_date } = user;
        return this.apollo.mutate({
            mutation: updateUser,
            variables: {
                _id,
                firstname,
                lastname,
                email,
                password,
                frequency_limit,
                deposit_limit,
                deposit_date
            }
        })
    }

    loginUser(email: String, password: String) {
        return this.apollo.mutate({
            mutation: loginUser,
            variables: {
                email,
                password
            }
        })  
        .pipe(tap((data: any) => {
            if(!data.errors || data.errors.length <= 0) {
                this.isAuthenticated = true;
                this.authStateListener.next(true);
                if(data.data.loginUser.token.access === "admin") {
                    this.isAdmin = true;
                    this.adminStateListener.next(true);
                }
                const token = data.data.loginUser && data.data.loginUser.token.token;
                const access = data.data.loginUser && data.data.loginUser.token.access;
                const expiresIn = data.data.loginUser && +(data.data.loginUser.token.expiresIn).replace("h", "");
                const id = data.data.loginUser && data.data.loginUser._id;
                const betsCount = data.data.loginUser && data.data.loginUser.betsCount;
                const now = new Date();                  
                const expirationDate = new Date(now.getTime() + expiresIn * 60 * 60 * 1000);
                this.setUserData(token, id, access, expirationDate, betsCount);
                return data;
            }
        }))      
    }

    updateUserDeposit(userId: String, newDeposit: Number, depositFrequency: String) {
        return this.apollo.mutate({
            mutation: updateUserDeposit,
            variables: {
                userId, 
                newDeposit,
                depositFrequency
            }
        })
        .pipe(tap((data: any) => {
            return data;
        }))
    }

    restorePassword(email: String) {
        return this.apollo.mutate({
            mutation: restorePasswordRequest,
            variables: {
                email
            }
        })
        .pipe(tap((data: any) => {
            return data;
        }))
    }

    updatePassword(pass: String, token: String) {
        return this.apollo.mutate({
            mutation: updatePassword,
            variables: {
                pass, 
                token
            }
        })
        .pipe(tap((data: any) => {
            return data;
        }))
    }

    getUser() {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserData,
                variables: {
                    id
                }
            })
            .valueChanges
        }
    }

    // all ordinary
    getUserOrdinaryBetsAll() {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserOrdinaryBetsAll,
                variables: {
                    id
                }
            })
            .valueChanges
        }
    }

    // active ordinary
    getUserOrdinaryBets() {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserOrdinaryBets,
                variables: {
                    id
                }
            })
            .valueChanges
        }
    }

    // archived ordinary won
    getUserOrdinaryBetsWon(limit, page) {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserOrdinaryBetsWon,
                variables: {
                    id, limit, page
                }
            })
            .valueChanges
        }
    }

    // archived ordinary lost
    getUserOrdinaryBetsLost(limit, page) {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserOrdinaryBetsLost,
                variables: {
                    id, limit, page
                }
            })
            .valueChanges
        }
    }

    // active combined all
    getUserCombinedBetsAll() {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserCombinedBetsAll,
                variables: {
                    id
                }
            })
            .valueChanges
        }
    }

    // active combined 
    getUserCombinedBets() {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserCombinedBets,
                variables: {
                    id
                }
            })
            .valueChanges
        }
    }
    
    // archived combined won
    getUserCombinedBetsWon(limit, page) {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserCombinedBetsWon,
                variables: {
                    id, limit, page
                }
            })
            .valueChanges
        }
    }

    // archived combined lost
    getUserCombinedBetsLost(limit, page) {
        const id = localStorage.getItem('id');
        if(this.isAuthenticated) {
            return this.apollo.watchQuery<any>({
                query: fetchUserCombinedBetsLost,
                variables: {
                    id, limit, page
                }
            })
            .valueChanges
        }
    }

    setUserData(token, id, access, expiration, betsCount) {
        localStorage.setItem('token', token);
        localStorage.setItem('id', id);
        localStorage.setItem('access', access);
        localStorage.setItem('expiration', expiration);
        localStorage.setItem('betsCount', JSON.stringify(betsCount)); 
    }

    autoAuthUser() {
        const authInfo = this.getAuthData();
        if(!authInfo) {
          return;
        }
        const now = new Date();
        const expiresIn = authInfo.expiration.getTime() - now.getTime();
        if(expiresIn > 0) {
            this.setAuthTimer(expiresIn / 1000);
            this.isAuthenticated = true;
            this.authStateListener.next(true); 
            if(localStorage.getItem('access') === 'admin') {
                this.isAdmin = true;
                this.adminStateListener.next(true);
            }           
        }
        else {
            this.clearAuthData();
        }
    }
    
    getAuthData() {
        const token = localStorage.getItem('token'),
              expiration = localStorage.getItem('expiration');
              if(!token || !expiration) {
                  return;
              }
              return {
                  token, 
                  expiration: new Date(expiration)
              }
    }

    setAuthTimer(duration: number) {
        this.timer =  setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    logout() {
        this.authStateListener.next(false);
        this.adminStateListener.next(false);
        this.isAuthenticated = false;
        this.isAdmin = false;

        clearTimeout(this.timer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getIfAdmin() {
        return this.isAdmin;
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('access') ;
        localStorage.removeItem('id')
    }
}
