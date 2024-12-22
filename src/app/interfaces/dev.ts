export interface IMongoImage{
    _id:string;
    imageName: string;
    imageLocation: string;
    imageType: string;
    status: string;
    presignedUrl:string;
    possibleOracleIds:string[];
    votesToDelete:number;
    votesNotSure:number;
    createdAt: Date;
    updatedAt: Date;
}