"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsFlow = void 0;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class CredentialsFlow {
    constructor(client) {
        this.client = client;
    }
    async getToken() {
        const options = { ...this.client.options };
        (0, utils_1.expects)(options, 'clientId', 'clientSecret', 'accessTokenUri');
        const headers = { ...constants_1.DEFAULT_HEADERS };
        const body = {
            grant_type: 'client_credentials',
        };
        if (options.scopes !== undefined) {
            body.scope = options.scopes.join(options.scopesSeparator ?? ' ');
        }
        const clientId = options.clientId;
        const clientSecret = options.clientSecret;
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
        return this.client.createToken(responseData);
    }
}
exports.CredentialsFlow = CredentialsFlow;
//# sourceMappingURL=CredentialsFlow.js.map