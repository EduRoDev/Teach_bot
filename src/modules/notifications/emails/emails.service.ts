import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { envs } from 'src/config';
import { OtpTemplate } from './views/otp.template';
import { WelcomeTemplate } from './views/welcome.template';
import * as React from 'react';
import { render } from '@react-email/render';


@Injectable()
export class EmailsService {
    private readonly resend: Resend;
    private readonly logger = new Logger('App - Modules: Emails');

    constructor() {
        this.resend = new Resend(envs.RESEND_API_KEY);
    }

    private async send(to: string[], subject: string, html: string) {
        const response = await this.resend.emails.send({
            from: `Teach Bot <${envs.RESEND_FROM_EMAIL}>`,
            to,
            subject,
            html,
        });

        if (response.error) {
            this.logger.error('Resend Error:', response.error);
            throw new BadRequestException(response.error.message);
        }

        return response;
    }

    async sendOtp(
        to: string,
        otp: string,
        type: 'verify_email' | 'reset_password' | 'verify_phone'
    ) {
        const subjects = {
            verify_email: 'Verifica tu correo - Teach Bot',
            reset_password: 'Recupera tu contraseña - Teach Bot',
            verify_phone: 'Verifica tu teléfono - Teach Bot',
        };

        const html = await render(
            React.createElement(OtpTemplate, { otp, type })
        );

        return this.send([to], subjects[type], html);
    }

    async sendWelcome(to: string, name: string) {
        const html = await render(
            React.createElement(WelcomeTemplate, { name })
        );

        return this.send([to], '¡Bienvenido a Teach Bot! 🎉', html);
    }
}