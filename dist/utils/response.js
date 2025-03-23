"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericResponse = void 0;
const response_1 = require("../types/response");
class GenericResponse {
    constructor() {
        this.status = response_1.ResponseStatus.SUCCESS;
        this.data = null;
        this.message = '';
    }
    setStatus(status) {
        this.status = status;
    }
    setData(data) {
        this.data = data;
    }
    setMessage(message) {
        this.message = message;
    }
}
exports.GenericResponse = GenericResponse;
