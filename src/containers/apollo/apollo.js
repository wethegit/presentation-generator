import React from "react";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloLink, ApolloClient, InMemoryCache } from "apollo-boost";
import { Auth } from "aws-amplify";

import AppSyncConfig from "../../aws-exports";

const config = {
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: {
    type: AppSyncConfig.aws_appsync_authenticationType,
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
};

const client = new ApolloClient({
  link: ApolloLink.from([
    createAuthLink(config),
    createSubscriptionHandshakeLink(config),
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default function ApolloWrapper({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
