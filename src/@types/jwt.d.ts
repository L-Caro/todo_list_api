import { userType } from 'src/@types/user';


export interface DecodedAccessTokenType {
  data: {
    ip: string;
    email: string;
    id: number;
  };
}


export interface decodedRefreshTokenType {
  id: (Document<unknown, {}, userType> & userType & { _id: ObjectId; }) | null;
}
