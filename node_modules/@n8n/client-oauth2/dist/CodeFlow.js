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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFlow = void 0;
const qs = __importStar(require("querystring"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class CodeFlow {
    constructor(client) {
        this.client = client;
    }
    getUri(opts) {
        const options = { ...this.client.options, ...opts };
        (0, utils_1.expects)(options, 'clientId', 'authorizationUri');
        const url = new URL(options.authorizationUri);
        const queryParams = {
            ...options.query,
            client_id: options.clientId,
            redirect_uri: options.redirectUri,
            response_type: 'code',
            state: options.state,
            ...(options.scopes ? { scope: options.scopes.join(options.scopesSeparator ?? ' ') } : {}),
        };
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== null && value !== undefined) {
                url.searchParams.append(key, value);
            }
        }
        return url.toString();
    }
    async getToken(urlString, opts) {
        const options = { ...this.client.options, ...opts };
        (0, utils_1.expects)(options, 'clientId', 'accessTokenUri');
        const url = new URL(urlString, constants_1.DEFAULT_URL_BASE);
        if (typeof options.redirectUri === 'string' &&
            typeof url.pathname === 'string' &&
            url.pathname !== new URL(options.redirectUri, constants_1.DEFAULT_URL_BASE).pathname) {
            throw new TypeError('Redirected path should match configured path, but got: ' + url.pathname);
        }
        if (!url.search?.substring(1)) {
            throw new TypeError(`Unable to process uri: ${urlString}`);
        }
        const data = typeof url.search === 'string' ? qs.parse(url.search.substring(1)) : url.search || {};
        const error = (0, utils_1.getAuthError)(data);
        if (error)
            throw error;
        if (options.state && data.state !== options.state) {
            throw new TypeError(`Invalid state: ${data.state}`);
        }
        if (!data.code) {
            throw new TypeError('Missing code, unable to request token');
        }
        const headers = { ...constants_1.DEFAULT_HEADERS };
        const body = {
            code: data.code,
            grant_type: 'authorization_code',
            redirect_uri: options.redirectUri,
        };
        if (options.clientSecret) {
            headers.Authorization = (0, utils_1.auth)(options.clientId, options.clientSecret);
        }
        else {
            body.client_id = options.clientId;
        }
        const requestOptions = (0, utils_1.getRequestOptions)({
            url: options.accessTokenUri,
            method: 'POST',
            headers,
            body,
        }, options);
        const responseData = await this.client.accessTokenRequest(requestOptions);
        return this.client.createToken(responseData);
    }
}
exports.CodeFlow = CodeFlow;
//# sourceMappingURL=CodeFlow.js.map