import { ConfigService } from '@nestjs/config';
interface PlannerRequest {
    destination: string;
    duration: number;
    budget: string;
    interests: string[];
    travelStyle: string;
    guests: number;
    startDate?: string;
}
export declare class AiPlannerService {
    private configService;
    constructor(configService: ConfigService);
    generateItinerary(data: PlannerRequest): Promise<any>;
    private buildPrompt;
    private generateFallbackItinerary;
}
export {};
