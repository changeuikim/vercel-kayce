export class PrismaCustomError extends Error {
    constructor(
        public code: string,
        message: string,
        public meta?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'PrismaCustomError';
    }
}

export const handlePrismaError = (error: any): never => {
    if (error.code === 'P2002') {
        throw new PrismaCustomError('DUPLICATE_ENTRY', '이미 존재하는 데이터입니다.', {
            fields: error.meta?.target,
        });
    }
    if (error.code === 'P2025') {
        throw new PrismaCustomError('NOT_FOUND', '데이터를 찾을 수 없습니다.', {
            details: error.meta,
        });
    }
    throw error;
};
