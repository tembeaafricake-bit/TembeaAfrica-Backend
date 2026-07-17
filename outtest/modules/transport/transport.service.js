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
exports.TransportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transport_schema_1 = require("./schemas/transport.schema");
let TransportService = class TransportService {
    constructor(transportModel) {
        this.transportModel = transportModel;
    }
    async findAll(query) {
        const { page = 1, limit = 20, q, status, type } = query;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (q) {
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { route: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
            ];
        }
        const [data, total] = await Promise.all([
            this.transportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.transportModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const transport = await this.transportModel.findOne({
            $or: [{ _id: id }, { slug: id }, { name: id }],
            isDeleted: false,
        }).lean();
        if (!transport) {
            throw new common_1.NotFoundException('Transport listing not found');
        }
        return transport;
    }
};
exports.TransportService = TransportService;
exports.TransportService = TransportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transport_schema_1.Transport.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TransportService);
//# sourceMappingURL=transport.service.js.map