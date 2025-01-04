import { createYoga } from "@graphql-yoga/node";
import { schema } from "@/app/graphql"; // 스키마 가져오기

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  graphiql: true, // Playground 활성화
});

export { yoga as GET, yoga as POST };
