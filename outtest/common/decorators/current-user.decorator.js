"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES_KEY = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.ROLES_KEY = 'roles';
//# sourceMappingURL=current-user.decorator.js.map