"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtableApi = void 0;
class AirtableApi {
    constructor() {
        this.name = 'airtableApi';
        this.displayName = 'Airtable API';
        this.documentationUrl = 'https://airtable.com/developers/web/api/introduction';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'The Airtable API key to use',
            },
        ];
    }
}
exports.AirtableApi = AirtableApi;
//# sourceMappingURL=AirtableApi.credentials.js.map