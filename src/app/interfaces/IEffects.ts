
export interface ISound {
    name: string;
    url: string;
    animojiId: string;
    icon?:any;
}

export interface IAnimoji{
    webpSrc:string;
    gifSrc:string;
    alt:any;
    lifeTimeInMS?:number;
}