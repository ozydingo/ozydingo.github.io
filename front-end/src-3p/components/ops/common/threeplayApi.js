import { graphqlPath } from "./paths";

class ThreeplayApi {
  constructor() {
    this.endpoint = graphqlPath;
  }

  request(query, variables) {
    return fetch(this.endpoint, {
      body: JSON.stringify({
        query,
        variables: JSON.stringify(variables),
      }),
      method: "POST",
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }

  json(query, variables) {
    return this.request(query, variables).then(r => r.json());
  }
}

export const threeplayApi = new ThreeplayApi();
