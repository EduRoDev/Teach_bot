import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseTemplateProps {
    preview: string;
    children: React.ReactNode;
}

export const BaseTemplate = ({ preview, children }: BaseTemplateProps) => (
    <Html lang="es">
        <Head />
        <Preview>{preview}</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>
                <Section style={styles.header}>
                    <Text style={styles.logo}>Teach Bot 🤖</Text>
                </Section>

                <Section style={styles.content}>
                    {children}
                </Section>

                <Hr style={styles.hr} />
                <Section style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2026 Leviatan - Teach Bot AI. Todos los derechos reservados.
                    </Text>
                    <Text style={styles.footerText}>
                        Si tienes algún problema, contáctanos en soporte@teachbot.ai
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

const styles = {
    body: {
        backgroundColor: '#f4f7f6',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        margin: '0',
        padding: '0',
    },
    container: {
        maxWidth: '600px',
        margin: '20px auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden' as const,
    },
    header: {
        backgroundColor: '#4f46e5',
        padding: '30px',
        textAlign: 'center' as const,
    },
    logo: {
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0',
    },
    content: {
        padding: '30px',
        color: '#333333',
        lineHeight: '1.6',
    },
    hr: {
        borderColor: '#e5e7eb',
        margin: '0',
    },
    footer: {
        backgroundColor: '#f9fafb',
        padding: '20px',
        textAlign: 'center' as const,
    },
    footerText: {
        color: '#6b7280',
        fontSize: '12px',
        margin: '4px 0',
    },
};