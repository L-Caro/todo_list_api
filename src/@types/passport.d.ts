// Strategy
export type DoneFunction = ( error: any, user?: any, info?: any ) => void;


// Google
export interface googleProfileType {
  id: string,
  displayName: string,
  email: string
}
