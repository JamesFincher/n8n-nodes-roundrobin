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
exports.ClientOAuth2Token = void 0;
const a = __importStar(require("node:assert"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class ClientOAuth2Token {
    constructor(client, data) {
        this.client = client;
        this.data = data;
        this.tokenType = data.token_type?.toLowerCase() ?? 'bearer';
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expires = new Date();
        this.expires.setSeconds(this.expires.getSeconds() + Number(data.expires_in));
    }
    sign(requestObject) {
        if (!this.accessToken) {
            throw new Error('Unable to sign without access token');
        }
        requestObject.headers = requestObject.headers ?? {};
        if (this.tokenType === 'bearer') {
            requestObject.headers.Authorization = 'Bearer ' + this.accessToken;
        }
        else {
            const parts = requestObject.url.split('#');
            const token = 'access_token=' + this.accessToken;
            const url = parts[0].replace(/[?&]access_token=[^&#]/, '');
            const fragment = parts[1] ? '#' + parts[1] : '';
            requestObject.url = url + (url.indexOf('?') > -1 ? '&' : '?') + token + fragment;
            requestObject.headers.Pragma = 'no-store';
            requestObject.headers['Cache-Control'] = 'no-store';
        }
        return requestObject;
    }
    async refresh(opts) {
        const options = { ...this.client.options, ...opts };
        (0, utils_1.expects)(options, 'clientSecret');
        a.ok(this.refreshToken, 'refreshToken is required');
        const { clientId, clientSecret } = options;
        const headers = { ...constants_1.DEFAULT_HEADERS };
        const body = {
            refresh_token: this.refreshToken,
            grant_type: 'refresh_token',
        };
        if (options.authentication === 'body') {
            body.client_id = clientId;
            body.client_secret = clientSecret;
        }
        else {
            headers.Authorization = (0, utils_1.auth)(clientId, clientSecret);
        }
        const requestOptions = (0, utils_1.getRequestOptions)({
            url: options.accessTokenUri,
            method: 'POST',
            headers,
            body,
        }, options);
        const responseData = await this.client.accessTokenRequest(requestOptions);
        return this.client.createToken({ ...this.data, ...responseData });
    }
    expired() {
        return Date.now() > this.expires.getTime();
    }
}
exports.ClientOAuth2Token = ClientOAuth2Token;
//# sourceMappingURL=ClientOAuth2Token.js.map