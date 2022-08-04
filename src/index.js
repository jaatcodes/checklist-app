import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

const client = new ApolloClient({
    uri: "https://crud-j8.hasura.app/v1/graphql",
    headers: {
        "x-hasura-admin-secret":
            "8GLwhq52ufD6qBmqnKXrk5AWOQJ2WcrXTZjNLJBcdi4kZRSV49Yo0grmrkeaIVc7",
    },
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById("root"),
);
