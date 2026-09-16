export interface LoginRequest {
    email?: string
    password?: string
    mobile: string
    year: string
    month: string
    day: string
  app:string
}

export interface UserData {
    uid: number
    confirmed: string
    email: string
    msisdn: number
    admin: boolean
    firstname: string
    lastname: string
    role: string
    service: string
    creation: string
}

export interface AuthData extends UserData{
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
}


