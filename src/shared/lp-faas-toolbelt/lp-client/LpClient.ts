import { RequestPromiseOptions } from 'request-promise-native';
import { ICsdsClient } from '../csds-client/ICsdsClient';
import { ISecretClient } from '../secret-storage/IsecretClient';
import { defaultAppKeySecretName } from '../shared/const';
import { createOauthClient, createOauthHeader } from '../shared/oauthGenerator';
import { LpServices } from './LpServices';

export interface ILpClientOptions extends RequestPromiseOptions {
    appKeySecretName?: string;
}

export interface IApiKeyCredentials {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
}

export const lpClientFactory = (csdsClient: ICsdsClient, secretClient: ISecretClient, httpClient: any): ILpClient => {
    const getAppKeyCredentials = async (secretName): Promise<IApiKeyCredentials> => {
        try {
            const { value } = await secretClient.readSecret(secretName);

            return value;
        } catch (error) {
            throw new Error(`Could not fetch App Key credentials from secret storage: ${error.message}`);
        }
    };

    const getOauthHeader = (request, { consumerKey, consumerSecret, token, tokenSecret }: IApiKeyCredentials) => {
        const oauthClient = createOauthClient({
            consumerKey,
            consumerSecret,
        });

        return createOauthHeader(
            oauthClient,
            {
                token,
                tokenSecret,
            },
            request,
        );
    };

    return async (
        service: LpServices | string,
        path: string,
        { appKeySecretName = defaultAppKeySecretName, method = 'GET', ...options }: ILpClientOptions,
    ): Promise<any> => {
        const host = await csdsClient.get(service);

        if (!host) {
            throw new Error(`Service "${service}" could not be found.`);
        }

        const baseUrl = `https://${host}`;
        const apiKeyCreds = await getAppKeyCredentials(appKeySecretName);

        const requestOptions = { ...options, baseUrl, method, uri: path };

        const oauthHeader = getOauthHeader(
            {
                url: `${baseUrl}${path}`,
                method: requestOptions.method,
                body: requestOptions.body,
            },
            apiKeyCreds,
        );

        requestOptions.headers = {
            ...requestOptions.headers,
            ...oauthHeader,
        };

        return httpClient(`${baseUrl}${path}`, requestOptions);
    };
};

export type ILpClient = (service: LpServices | string, path: string, options: ILpClientOptions) => Promise<any>;
