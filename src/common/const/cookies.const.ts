import { Response } from "express";

export const setRefreshCookie = (res: Response, refreshToken: string) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

export const setSessionCookie = (res: Response, sessionId: string) => {
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}