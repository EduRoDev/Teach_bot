import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from './base.template';

interface WelcomeTemplateProps {
    name: string;
}

export const WelcomeTemplate = ({ name }: WelcomeTemplateProps) => (
    <BaseTemplate preview={`Bienvenido a Teach Bot, ${name}`}>
        <Heading style={styles.heading}>¡Bienvenido, {name}! 🎉</Heading>
        <Text style={styles.text}>
            Nos alegra tenerte en Teach Bot. Estamos aquí para ayudarte a
            optimizar tu aprendizaje con inteligencia artificial.
        </Text>
        <Text style={styles.text}>Con Teach Bot puedes:</Text>
        <Text style={styles.feature}>📄 Subir documentos y extraer resúmenes automáticos</Text>
        <Text style={styles.feature}>🃏 Generar flashcards de estudio</Text>
        <Text style={styles.feature}>✅ Crear quizzes para evaluar tu conocimiento</Text>
        <Text style={styles.feature}>🤖 Chatear con tus documentos</Text>

        <Button style={styles.button} href="https://teachbot.ai">
            Empezar ahora
        </Button>

        <Text style={styles.footer}>
            Si tienes alguna pregunta, no dudes en contactarnos.
        </Text>
    </BaseTemplate>
);

const styles = {
    heading: {
        fontSize: '22px',
        color: '#1f2937',
    },
    text: {
        fontSize: '16px',
        color: '#4b5563',
        lineHeight: '1.6',
    },
    feature: {
        fontSize: '15px',
        color: '#4b5563',
        margin: '8px 0',
        paddingLeft: '8px',
    },
    button: {
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '6px',
        fontWeight: 'bold',
        display: 'block',
        textAlign: 'center' as const,
        marginTop: '24px',
        textDecoration: 'none',
    },
    footer: {
        fontSize: '14px',
        color: '#9ca3af',
        marginTop: '24px',
    },
};