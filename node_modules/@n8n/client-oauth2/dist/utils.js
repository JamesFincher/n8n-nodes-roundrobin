"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
exports.expects = expects;
exports.getAuthError = getAuthError;
exports.auth = auth;
exports.getRequestOptions = getRequestOptions;
const constants_1 = require("./constants");
function expects(obj, ...keys) {
    for (const key of keys) {
        if (obj[key] === null || obj[key] === undefined) {
            throw new TypeError('Expected "' + key + '" to exist');
        }
    }
}
class AuthError extends Error {
    constructor(message, body, code = 'EAUTH') {
        super(message);
        this.body = body;
        this.code = code;
    }
}
exports.AuthError = AuthError;
function getAuthError(body) {
    const message = constants_1.ERROR_RESPONSES[body.error] ?? body.error_description ?? body.error;
    if (message) {
        return new AuthError(message, body);
    }
    return undefined;
}
function toString(str) {
    return str === null ? '' : String(str);
}
function auth(username, password) {
    return 'Basic ' + Buffer.from(toString(username) + ':' + toString(password)).toString('base64');
}
function getRequestOptions({ url, method, body, query, headers }, options) {
    const rOptions = {
        url,
        method,
        body: { ...body, ...options.body },
        query: { ...query, ...options.query },
        headers: headers ?? {},
        ignoreSSLIssues: options.ignoreSSLIssues,
    };
    if (rOptions.headers.Authorization === '') {
        delete rOptions.headers.Authorization;
    }
    return rOptions;
}
//# sourceMappingURL=utils.js.map