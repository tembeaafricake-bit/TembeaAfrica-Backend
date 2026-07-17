"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPlannerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_planner_service_1 = require("./ai-planner.service");
const throttler_1 = require("@nestjs/throttler");
let AiPlannerController = class AiPlannerController {
    constructor(aiPlannerService) {
        this.aiPlannerService = aiPlannerService;
    }
    generate(body) {
        return this.aiPlannerService.generateItinerary(body);
    }
};
exports.AiPlannerController = AiPlannerController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Generate an AI travel itinerary' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiPlannerController.prototype, "generate", null);
exports.AiPlannerController = AiPlannerController = __decorate([
    (0, swagger_1.ApiTags)('ai-planner'),
    (0, common_1.Controller)('ai-planner'),
    __metadata("design:paramtypes", [ai_planner_service_1.AiPlannerService])
], AiPlannerController);
//# sourceMappingURL=ai-planner.controller.js.map