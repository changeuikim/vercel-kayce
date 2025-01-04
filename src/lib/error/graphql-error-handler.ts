import { GraphQLError as GQLError } from 'graphql';
import { BaseErrorCode } from '@/lib/error/error-codes';
import { BaseError, withBaseErrorHandler } from '@/lib/error/base-error-handler';

export class GraphQLError extends BaseError {
    constructor(
        code: BaseErrorCode,
        meta?: Record<string, unknown>,
        private path?: string,
        private operation?: string
    ) {
        super(code, meta);
        this.name = 'GraphQLError';
    }

    // GraphQL 형식으로 변환
    toGraphQLError(): GQLError {
        return new GQLError(this.message, {
            extensions: {
                code: this.code,
                meta: this.meta,
                timestamp: new Date().toISOString(),
                path: this.path,
                operation: this.operation,
                ...(process.env.NODE_ENV === 'development' && {
                    debug: this.stack,
                }),
            },
        });
    }

    // BaseError를 GraphQLError로 변환
    static fromBaseError(error: BaseError, path?: string, operation?: string): GraphQLError {
        return new GraphQLError(error.code, error.meta, path, operation);
    }

    // 일반 Error를 GraphQLError로 변환
    static fromError(error: unknown, path?: string, operation?: string): GraphQLError {
        if (error instanceof BaseError) {
            return GraphQLError.fromBaseError(error, path, operation);
        }

        return new GraphQLError(
            'SYS_UNKNOWN_ERROR',
            {
                originalError: error instanceof Error ? error.message : String(error),
            },
            path,
            operation
        );
    }
}

export async function withGraphQLErrorHandler<T>(
    operation: () => Promise<T>,
    path?: string,
    operationName?: string
): Promise<T> {
    try {
        return await withBaseErrorHandler(operation);
    } catch (error) {
        const graphqlError = GraphQLError.fromError(error, path, operationName);
        throw graphqlError.toGraphQLError();
    }
}
