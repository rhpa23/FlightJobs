declare const _default: (() => {
    port: number;
    nodeEnv: string;
    database: {
        path: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    frontend: {
        url: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    database: {
        path: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    frontend: {
        url: string;
    };
}>;
export default _default;
