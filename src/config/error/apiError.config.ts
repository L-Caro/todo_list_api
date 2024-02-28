interface ApiErrorType {
  message: string,
  infos: {
    statusCode: number
  }
}


export class ApiError extends Error {
  infos: {
    statusCode: number;
  };

  constructor( { message, infos }: ApiErrorType ) {
    super( message );
    this.name = 'ApiError';
    this.infos = infos;
  }
};
