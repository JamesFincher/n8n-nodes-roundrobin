"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientOAuth2 = exports.ResponseError = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = require("https");
const qs = __importStar(require("querystring"));
const ClientOAuth2Token_1 = require("./ClientOAuth2Token");
const CodeFlow_1 = require("./CodeFlow");
const CredentialsFlow_1 = require("./CredentialsFlow");
const utils_1 = require("./utils");
class ResponseError extends Error {
    constructor(status, body, code = 'ESTATUS') {
        super(`HTTP status ${status}`);
        this.status = status;
        this.body = body;
        this.code = code;
    }
}
exports.ResponseError = ResponseError;
const sslIgnoringAgent = new https_1.Agent({ rejectUnauthorized: false });
class ClientOAuth2 {
    constructor(options) {
        this.options = options;
        this.code = new CodeFlow_1.CodeFlow(this);
        this.credentials = new CredentialsFlow_1.CredentialsFlow(this);
    }
    createToken(data, type) {
        return new ClientOAuth2Token_1.ClientOAuth2Token(this, {
            ...data,
            ...(typeof type === 'string' ? { token_type: type } : type),
        });
    }
    async accessTokenRequest(options) {
        let url = options.url;
        const query = qs.stringify(options.query);
        if (query) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + query;
        }
        const requestConfig = {
            url,
            method: options.method,
            data: qs.stringify(options.body),
            headers: options.headers,
            transformResponse: (res) => res,
            validateStatus: (status) => status < 500,
        };
        if (options.ignoreSSLIssues) {
            requestConfig.httpsAgent = sslIgnoringAgent;
        }
        const response = await axios_1.default.request(requestConfig);
        if (response.status >= 400) {
            const body = this.parseResponseBody(response);
            const authErr = (0, utils_1.getAuthError)(body);
            if (authErr)
                throw authErr;
            else
                throw new ResponseError(response.status, response.data);
        }
        if (response.status >= 300) {
            throw new ResponseError(response.status, response.data);
        }
        return this.parseResponseBody(response);
    }
    parseResponseBody(response) {
        const contentType = response.headers['content-type'] ?? '';
        const body = response.data;
        if (contentType.startsWith('application/json')) {
            return JSON.parse(body);
        }
        if (contentType.startsWith('application/x-www-form-urlencoded')) {
            return qs.parse(body);
        }
        throw new Error(`Unsupported content type: ${contentType}`);
    }
}
exports.ClientOAuth2 = ClientOAuth2;
//# sourceMappingURL=ClientOAuth2.js.map