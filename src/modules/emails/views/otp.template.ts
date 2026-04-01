export const otpTemplate = (otp: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación - Teach Bot</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4f46e5;
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .otp-box {
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            display: inline-block;
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 12px;
            color: #4f46e5;
            background-color: #f0f0ff;
            padding: 16px 32px;
            border-radius: 8px;
            border: 2px dashed #4f46e5;
        }
        .warning {
            background-color: #fff8e1;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
            margin-top: 20px;
        }
        .footer {
            background-color: #f9fafb;
            color: #6b7280;
            text-align: center;
            padding: 20px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Teach Bot 🤖</h1>
        </div>
        <div class="content">
            <h2>Verifica tu correo electrónico</h2>
            <p>Hola, usa el siguiente código para verificar tu cuenta:</p>
            <div class="otp-box">
                <span class="otp-code">${otp}</span>
            </div>
            <p>Este código expira en <strong>15 minutos</strong>.</p>
            <div class="warning">
                ⚠️ Si no solicitaste este código, ignora este mensaje. Tu cuenta está segura.
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2026 Leviatan - Teach Bot AI. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;