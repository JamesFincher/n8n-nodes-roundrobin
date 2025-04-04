import type { ClientOAuth2 } from './ClientOAuth2';
import type { ClientOAuth2Token } from './ClientOAuth2Token';
export declare class CredentialsFlow {
    private client;
    constructor(client: ClientOAuth2);
    getToken(): Promise<ClientOAuth2Token>;
}
