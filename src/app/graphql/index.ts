import { makeExecutableSchema } from '@graphql-tools/schema';
import userSchema from '@/app/graphql/schemas/user.graphql';
import { userResolvers } from '@/app/graphql/resolvers/user';

export const schema = makeExecutableSchema({
    typeDefs: [userSchema],
    resolvers: [userResolvers],
});
