export interface ProfileForm {
    name: {
        value: string;
        isTouched: boolean;
        invalid: boolean;
    };
    description: {
        value: string;
        isTouched: boolean;
        invalid: boolean;
    },
    authType: {
        value: string,
        isTouched: boolean;
        invalid: boolean;
    }
    authId?: string;
    defaultKey: boolean;
    auth: {
        isTouched: boolean;
        invalid: boolean;
        invalidAuthType: string,
        values: {
            bearerToken: string,
            basicAuth: {
                username: string,
                password: string
            },
            apiKey: {
                authKey: string,
                authValue: string,
                addTo: "Header" | "Parameter"
            }
        }
    },
}
