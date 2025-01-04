import { Resolvers } from "../generated/types";

export const userResolvers: Resolvers = {
  Query: {
    users: () => [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ],
  },
};
