# Leviatan v3 Backend

Backend API para la plataforma educativa Leviatan.

Implementado con NestJS, Prisma y PostgreSQL, con autenticacion JWT, sesiones con refresh token por cookies, IA para chat/contenido y un modulo administrativo protegido por rol.

## Stack

- Node.js 22
- NestJS 11
- Prisma 7 + PostgreSQL
- Redis (cache y tokens OTP)
- JWT + Passport
- MinIO/S3 para archivos
- Servicios externos de IA (Gemini, Groq, Cerebras, Python service y Go service)

## Versionado y base URL

- El API usa versionado por URI.
- Prefijo real de rutas: `/v1`.
- Ejemplo local: `http://localhost:3000/v1/auth/login`.

## Modulos principales

- `auth`: registro, login, refresh, logout, 2FA, Google OAuth, recovery.
- `admin`: endpoints administrativos (solo `ADMIN`).
- `education/subject`: materias del usuario.
- `education/documents`: documentos por materia, lectura de archivo y audio.
- `education/summary`: resumen por documento.
- `education/flashcards`: flashcards por documento.
- `education/quiz`: quiz por documento y estadisticas de intentos.
- `education/chat`: chat contextual por documento (normal y stream).
- `education/plan`: plan de estudio por documento.
- `gateway-ai`: streaming de chat general de IA.
- `notifications/emails`: envio de correos (bienvenida, OTP, etc).

## Requisitos

- Node.js `>= 22`
- npm `>= 10`
- PostgreSQL disponible
- Redis disponible
- Variables de entorno completas

## Variables de entorno requeridas

El backend valida variables con Zod al arrancar. Si falta una, la app no inicia.

```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001

DATABASE_URL=postgresql://user:password@localhost:5434/teach_bot
REDIS_URL=redis://localhost:6379

RESEND_API_KEY=...
RESEND_FROM_EMAIL=...

JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_RESET_SECRET=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/v1/auth/google/callback

GROQ_API_KEY=...
CEREBRAS_API_KEY=...
GEMINI_API_KEY_TEXT=...
GEMINI_API_KEY_VOICE=...

GOLANG_SERVICE_URL=http://localhost:8080
PYTHON_SERVICE_URL=http://localhost:8000

MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...

BASE_URL=http://localhost:3000/v1
```

## Instalacion y ejecucion local

1. Instalar dependencias.

```bash
npm install
```

2. Generar cliente Prisma.

```bash
npx prisma generate
```

3. Aplicar migraciones en local.

```bash
npx prisma migrate dev
```

4. Ejecutar en desarrollo.

```bash
npm run start:dev
```

## Build y produccion

```bash
npm run build
npm run start:prod
```

## Docker

Este proyecto incluye `Dockerfile` multi-stage y `start.sh`.

- En runtime se ejecuta `prisma migrate deploy`.
- Luego arranca con `node dist/src/main`.

## Prisma y modelo de datos

Entidad principal:

- `User` con soporte de roles (`USER`, `ADMIN`), estado (`ACTIVE`, `INACTIVE`, `DRAFT`, `BLOCKED`) y proveedor auth (`LOCAL`, `GOOGLE`, etc).
- `Session` para refresh token por dispositivo/sesion.
- `Subject` y `Document` como base de contenido.
- `Summary`, `Flashcard`, `Quiz`, `QuizAttempt`, `QuizAnswer`, `ChatHistory`, `CustomStudyPlan`.

Archivo de esquema: `prisma/schema.prisma`.

## Autenticacion y sesiones

Flujo actual:

- Access token por `Bearer`.
- Refresh token por cookie `httpOnly` (`refreshToken`).
- Session id por cookie `httpOnly` (`sessionId`).
- JWT payload incluye `sub` y `role`.
- Guard de rol habilitado via `RolesGuard` + `@Roles(...)`.

Notas:

- En desarrollo, cookies estan configuradas con `secure: false` y `sameSite: lax`.
- En produccion, ajustar politica de cookies segun dominio/HTTPS.

## Rutas API (resumen)

Todas con prefijo `/v1`.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/Logout`
- `POST /auth/send-verify-email`
- `POST /auth/verify-email`
- `POST /auth/forgot-password`
- `POST /auth/verify-reset-otp`
- `PUT /auth/reset-password`
- `POST /auth/2fa/generate`
- `POST /auth/2fa/enable`
- `POST /auth/2fa/verify`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/admin/ping` (solo `ADMIN`)

### Admin (solo ADMIN)

- `GET /admin/overview`
- `GET /admin/users?page=1&limit=10&search=`
- `GET /admin/subjects?page=1&limit=10&search=`
- `GET /admin/documents?page=1&limit=10&search=`

### Subject

- `POST /subject`
- `GET /subject`
- `GET /subject/:id`
- `GET /subject/:id/documents`
- `PATCH /subject/:id`
- `DELETE /subject/:id`

### Documents

- `POST /documents/:subjectId` (multipart/form-data con `file`)
- `GET /documents/:id`
- `GET /documents/:id/file`
- `DELETE /documents/:id`
- `POST /documents/:id/audio`

### Summary

- `POST /summary/:documentId`
- `GET /summary/:documentId`

### Flashcards

- `POST /flashcards/generate/:documentId`
- `GET /flashcards/:documentId`
- `DELETE /flashcards/:id`

### Quiz

- `POST /quiz/:documentId/generate`
- `GET /quiz/:documentId`
- `POST /quiz/:id/attempt`
- `GET /quiz/:id/attempts`

### Chat

- `GET /chat/:documentId`
- `POST /chat/:documentId`
- `POST /chat/:documentId/stream`

### Plan

- `POST /plan/:documentId`
- `GET /plan/:documentId`
- `DELETE /plan/:id`

### AI Gateway

- `POST /ai/chat` (streaming)

## Pruebas de endpoints

Esta seccion sirve como guia rapida para QA manual en local o en ambiente desplegado.

### Variables recomendadas en Postman

Crear un Environment con estas variables:

- `baseUrl`: `http://localhost:3000/v1`
- `accessToken`: se llena despues de login
- `subjectId`: id de materia para pruebas
- `documentId`: id de documento para pruebas
- `quizId`: id de quiz para pruebas

Header comun para endpoints protegidos:

- `Authorization: Bearer {{accessToken}}`

### Flujo minimo de smoke test

1. Health funcional basico:
	 - `POST /auth/register` o `POST /auth/login` debe responder sin error.
2. Autenticacion:
	 - Guardar `accessToken` de login en variable.
3. CRUD base de estudio:
	 - Crear materia.
	 - Crear documento asociado a la materia.
4. Generacion de contenido:
	 - Resumen, flashcards y quiz sobre el documento.
5. Admin:
	 - Con usuario normal, `GET /admin/overview` debe devolver `403`.
	 - Con usuario ADMIN, `GET /admin/overview` debe devolver `200`.

### Ejemplos en formato JSON

#### 1) Register

```json
{
	"name": "Register",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/auth/register",
		"headers": {
			"Content-Type": "application/json"
		},
		"body": {
			"name": "John",
			"lastName": "Doe",
			"email": "john@example.com",
			"password": "StrongPass123"
		}
	},
	"expected": {
		"status": 201,
		"body": {
			"accessToken": "<jwt>"
		}
	}
}
```

#### 2) Login

```json
{
	"name": "Login",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/auth/login",
		"headers": {
			"Content-Type": "application/json"
		},
		"body": {
			"email": "john@example.com",
			"password": "StrongPass123"
		}
	},
	"expected": {
		"status": 201,
		"body": {
			"accessToken": "<jwt>"
		},
		"cookies": ["refreshToken", "sessionId"]
	}
}
```

#### 3) Listar materias con token

```json
{
	"name": "Get Subjects",
	"request": {
		"method": "GET",
		"url": "{{baseUrl}}/subject",
		"headers": {
			"Authorization": "Bearer {{accessToken}}"
		}
	},
	"expected": {
		"status": 200,
		"bodyType": "array"
	}
}
```

#### 4) Crear materia

```json
{
	"name": "Create Subject",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/subject",
		"headers": {
			"Authorization": "Bearer {{accessToken}}",
			"Content-Type": "application/json"
		},
		"body": {
			"name": "Matematicas",
			"description": "Materia de prueba"
		}
	},
	"expected": {
		"status": 201,
		"save": {
			"subjectId": "response.id"
		}
	}
}
```

#### 5) Crear documento

```json
{
	"name": "Create Document",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/documents/{{subjectId}}",
		"headers": {
			"Authorization": "Bearer {{accessToken}}"
		},
		"bodyType": "form-data",
		"formData": {
			"title": "Documento de prueba",
			"file": "./archivo.pdf"
		}
	},
	"expected": {
		"status": 201,
		"body": {
			"message": "Document created successfully",
			"document": {
				"id": "<number>",
				"title": "Documento de prueba"
			}
		},
		"save": {
			"documentId": "response.document.id"
		}
	}
}
```

#### 6) Generar resumen

```json
{
	"name": "Generate Summary",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/summary/{{documentId}}",
		"headers": {
			"Authorization": "Bearer {{accessToken}}"
		}
	},
	"expected": {
		"status": 201
	}
}
```

#### 7) Generar quiz y enviar intento

```json
{
	"name": "Generate Quiz",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/quiz/{{documentId}}/generate",
		"headers": {
			"Authorization": "Bearer {{accessToken}}"
		}
	},
	"expected": {
		"status": 201,
		"save": {
			"quizId": "response.id"
		}
	}
}
```

```json
{
	"name": "Submit Quiz Attempt",
	"request": {
		"method": "POST",
		"url": "{{baseUrl}}/quiz/{{quizId}}/attempt",
		"headers": {
			"Authorization": "Bearer {{accessToken}}",
			"Content-Type": "application/json"
		},
		"body": {
			"answers": [
				{
					"questionId": 1,
					"selectedOption": "A"
				}
			],
			"timeTaken": 120
		}
	},
	"expected": {
		"status": 201
	}
}
```

#### 8) Validar acceso admin

Usuario normal (debe fallar):

```json
{
	"name": "Admin Overview With USER",
	"request": {
		"method": "GET",
		"url": "{{baseUrl}}/admin/overview",
		"headers": {
			"Authorization": "Bearer {{userToken}}"
		}
	},
	"expected": {
		"status": 403
	}
}
```

Usuario admin (debe pasar):

```json
{
	"name": "Admin Overview With ADMIN",
	"request": {
		"method": "GET",
		"url": "{{baseUrl}}/admin/overview",
		"headers": {
			"Authorization": "Bearer {{adminToken}}"
		}
	},
	"expected": {
		"status": 200
	}
}
```

### Casos esperados por endpoint

- `401 Unauthorized`: token ausente/invalido/expirado.
- `403 Forbidden`: usuario autenticado sin permisos de rol.
- `404 Not Found`: ids inexistentes (materia/documento/quiz).
- `422 Unprocessable Entity`: validacion de archivo o body invalido.

### Recomendacion para equipo

- Mantener una coleccion de Postman con carpetas por modulo: `auth`, `admin`, `subject`, `documents`, `summary`, `flashcards`, `quiz`, `chat`, `plan`.
- Agregar tests basicos en Postman para status code y estructura minima de respuesta.
- Versionar la coleccion en el repositorio para evitar divergencias entre entornos.

## Convenciones importantes del proyecto

- Respuestas historicas no siempre vienen envueltas en `{ data: ... }`; algunos endpoints retornan arrays directos.
- En submit de quiz statistics, enviar solo `answers` y `timeTaken` en body para el endpoint de intento.
- Varios endpoints dependen de `req.user.userId` inyectado por JWT strategy.

## Scripts utiles

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
```

## Checklist rapido para nuevos devs

1. Clonar repo.
2. Crear `.env` con todas las variables.
3. Levantar PostgreSQL + Redis + servicios auxiliares.
4. `npm install`.
5. `npx prisma migrate dev`.
6. `npm run start:dev`.
7. Probar `POST /v1/auth/login`.
8. Para admin endpoints, usar usuario con rol `ADMIN`.

