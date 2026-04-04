import { Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from './base.template';

interface OtpTemplateProps {
    otp: string;
    type: 'verify_email' | 'reset_password' | 'verify_phone';
}

const titles = {
    verify_email: 'Verifica tu correo electrónico',
    reset_password: 'Recupera tu contraseña',
    verify_phone: 'Verifica tu número de teléfono',
};

const descriptions = {
    verify_email: 'Usa el siguiente código para verificar tu cuenta:',
    reset_password: 'Usa el siguiente código para restablecer tu contraseña:',
    verify_phone: 'Usa el siguiente código para verificar tu teléfono:',
};

export const OtpTemplate = ({ otp, type }: OtpTemplateProps) => (
    <BaseTemplate preview={titles[type]}>
        <Heading style={styles.heading}>{titles[type]}</Heading>
        <Text style={styles.description}>{descriptions[type]}</Text>

        <Section style={styles.otpBox}>
            <Text style={styles.otpCode}>{otp}</Text>
        </Section>

        <Text style={styles.expiry}>
            Este código expira en <strong>15 minutos</strong>.
        </Text>

        <Section style={styles.warning}>
            <Text style={styles.warningText}>
                ⚠️ Si no solicitaste este código, ignora este mensaje. Tu cuenta está segura.
            </Text>
        </Section>
    </BaseTemplate>
);

const styles = {
    heading: {
        fontSize: '22px',
        color: '#1f2937',
        marginBottom: '8px',
    },
    description: {
        fontSize: '16px',
        color: '#4b5563',
        marginBottom: '24px',
    },
    otpBox: {
        textAlign: 'center' as const,
        margin: '30px 0',
    },
    otpCode: {
        display: 'inline-block',
        fontSize: '42px',
        fontWeight: 'bold',
        letterSpacing: '12px',
        color: '#4f46e5',
        backgroundColor: '#f0f0ff',
        padding: '16px 32px',
        borderRadius: '8px',
        border: '2px dashed #4f46e5',
    },
    expiry: {
        fontSize: '14px',
        color: '#6b7280',
        textAlign: 'center' as const,
    },
    warning: {
        backgroundColor: '#fff8e1',
        borderLeft: '4px solid #f59e0b',
        borderRadius: '4px',
        padding: '12px 16px',
        marginTop: '20px',
    },
    warningText: {
        fontSize: '14px',
        color: '#92400e',
        margin: '0',
    },
};