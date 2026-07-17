import { AiPlannerService } from './ai-planner.service';
export declare class AiPlannerController {
    private aiPlannerService;
    constructor(aiPlannerService: AiPlannerService);
    generate(body: {
        destination: string;
        duration: number;
        budget: string;
        interests: string[];
        travelStyle: string;
        guests: number;
        startDate?: string;
    }): Promise<any>;
}
