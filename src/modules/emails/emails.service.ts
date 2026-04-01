import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { envs } from 'src/config';
import { EmailInterface } from './interfaces';
import { join } from 'path';
import { readFileSync } from 'fs';


@Injectable()
export class EmailsService {
    private readonly resend: Resend
    private readonly logger = new Logger('App - Modules: Emails');
    constructor() {
        this.resend = new Resend(envs.RESEND_API_KEY)
    }

    async sendEmail({ to, subject, html }: EmailInterface) {
        try {
            const templatePath = join(process.cwd(), 'src/modules/emails/views/email.html');
            const htmlContent = readFileSync(templatePath, 'utf8');

            const response = await this.resend.emails.send({
                from: 'Teach Bot <' + envs.RESEND_FROM_EMAIL + '>',
                to,
                subject,
                html: html || htmlContent
            })

            if (response.error) {
                this.logger.error('Resend Error:', response.error);
                throw new BadRequestException(response.error.message);
            }

            return response;
            
        } catch (error) {
            throw new BadRequestException('Failed to send email')
        }
    }

}
