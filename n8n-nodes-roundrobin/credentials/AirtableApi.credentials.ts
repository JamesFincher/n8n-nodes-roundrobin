import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AirtableApi implements ICredentialType {
	name = 'airtableApi';
	displayName = 'Airtable API';
	documentationUrl = 'https://airtable.com/developers/web/api/introduction';
	properties: INodeProperties[] = [
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