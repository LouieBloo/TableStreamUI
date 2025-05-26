export interface ILoginPayload {
    email: string;
    password: string;
}

export interface ISignupPayload {
    name: string;
    email: string;
    password: string;
}

export interface IUser{
    name: string;
    email: string;
    profileSettings?:IProfileSettings;
    createdAt?: Date;
    lastNameUpdate?:Date;
}

export interface IUpdateUserPayload {
    name?: string;
    profileSettings?:IProfileSettings;
}

export interface IProfileSettings{
    icon?:IProfileIcon;
}

export interface IProfileIcon{
    id?:string;
    color?:string;
    label?:string;//front end only
}