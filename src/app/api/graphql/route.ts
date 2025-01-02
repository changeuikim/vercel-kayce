import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from '@/app/graphql/resolvers';
import { typeDefs } from '@/app/graphql/schema';
import { NextRequest } from 'next/server';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    fetchAPI: { Response },
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{}> } // Next.js 15의 새로운 타입 시그니처
) {
    const resolvedParams = await params;
    return yoga.handleRequest(request, { params: resolvedParams });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
    const resolvedParams = await params;
    return yoga.handleRequest(request, { params: resolvedParams });
}
