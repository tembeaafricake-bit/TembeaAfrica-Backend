export declare class AppController {
    getRoot(): {
        message: string;
        version: string;
        description: string;
        documentation: string;
        status: string;
        timestamp: string;
    };
    healthCheck(): {
        status: string;
        uptime: number;
        timestamp: string;
    };
}
