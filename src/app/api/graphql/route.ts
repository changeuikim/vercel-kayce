import { createYoga } from '@graphql-yoga/node';
import { schema } from '@/app/graphql';

const yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    graphiql: true,
});

export { yoga as GET, yoga as POST };
