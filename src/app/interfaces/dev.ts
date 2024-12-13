export interface IMongoImage{
    _id:string;
    imageName: string;
    imageLocation: string;
    imageType: string;
    status: string;
    presignedUrl:string;
    createdAt: Date;
    updatedAt: Date;
}