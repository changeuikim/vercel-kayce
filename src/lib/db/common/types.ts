// DB 에러 타입
export type DBError = {
    code: string;
    message: string;
    meta?: Record<string, unknown>;
};
