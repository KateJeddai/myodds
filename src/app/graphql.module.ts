import {NgModule} from '@angular/core';
import {ApolloModule, APOLLO_OPTIONS} from 'apollo-angular';
import {HttpLinkModule, HttpLink} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {setContext} from 'apollo-link-context';
import {ApolloLink} from 'apollo-link';
import { HttpClientModule } from '@angular/common/http';

const uri = 'graphql';

export function createApollo(httpLink: HttpLink) {
    const basic = setContext((operation, context) => ({
      headers: {
        Accept: 'charset=utf-8'
      }
    }));
    
    let link;
    link = httpLink.create({ uri });    
    
    // const token = localStorage.getItem('token');   
    // if(token){
    //     const auth = setContext((operation, context) => ({
    //       headers: {
    //         Authorization:`Bearer ${localStorage.getItem('token')}`
    //       }
    //     }));
    //     link = ApolloLink.from([basic, auth, httpLink.create({ uri })]);
    // }
 
    return {
      link,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all'
        }
      }
    };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule, HttpClientModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
