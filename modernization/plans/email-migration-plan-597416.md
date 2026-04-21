# Plano de Migração do Sistema de Emails - FlightJobs

Migração completa do sistema de envio de emails da aplicação legada ASP.NET para a aplicação modernizada NestJS, com templates profissionais, jobs agendados e arquitetura desacoplada.

## 1. Análise da Aplicação Legada

### 1.1 Configurações de Email (Web.config)
```
SmtpUsername - Usuário SMTP Gmail
SmtpPassword - Senha SMTP Gmail  
SMTP: smtp.gmail.com:587 com SSL
From: flightjobs.net.no.reply@gmail.com
```

### 1.2 Funcionalidades de Email Identificadas

| # | Funcionalidade | Arquivo | Tipo | Frequência |
|---|----------------|---------|------|------------|
| 1 | **Confirmação de Cadastro** | `AccountController.cs:226` | Transacional | On-demand |
| 2 | **Confirmação de Cadastro (API)** | `AuthenticationApiController.cs:138` | Transacional | On-demand |
| 3 | **Reset de Senha** | `AccountController.cs:296` | Transacional | On-demand |
| 4 | **Alerta de Expiração de Licença** | `WarningEmailJob.cs:20-67` | Agendado | A cada 3 horas |
| 5 | **Alerta de Débito da Airline** | `JobApiController.cs:551-597` | Transacional | On-demand (após job) |

### 1.3 Templates de Email Existentes
- `Content/templates/Confirm Email.html` - Template HTML com logo, link de confirmação, botão de doação PayPal

### 1.4 Flags de Controle no Banco
```csharp
// StatisticsDbModel
SendLicenseWarning: boolean      // Usuário quer receber alerta de licença
SendAirlineBillsWarning: boolean // Usuário quer receber alerta de débito
LicenseWarningSent: boolean      // Alerta já foi enviado (evita spam)
AirlineBillsWarningSent: boolean  // Alerta de débito já enviado
```

### 1.5 Scheduler Existente (Quartz)
- **WarningEmailJob**: Executa a cada 3 horas via Quartz Scheduler
- **BackpupJob**: Executa a cada 8 horas (não relacionado a email e será feito em um outro prompt usando a mesma estrutura)

---

## 2. Arquitetura Proposta - Aplicação Modernizada

### 2.1 Estrutura de Módulos

```
backend/src/
├── mail/
│   ├── mail.module.ts              # Módulo NestJS
│   ├── mail.service.ts             # Serviço principal de envio
│   ├── mail.processor.ts           # Processador Bull Queue
│   ├── mail.scheduler.ts           # Jobs agendados
│   ├── templates/
│   │   ├── base.hbs                # Layout base comum
│   │   ├── welcome.hbs             # Boas-vindas/Confirmação
│   │   ├── password-reset.hbs      # Reset de senha
│   │   ├── license-warning.hbs     # Alerta de licença
│   │   └── airline-debt.hbs        # Alerta de débito da airline
│   └── interfaces/
│       ├── mail.interfaces.ts      # Tipagens
│       └── mail-config.interface.ts
├── common/
│   └── filters/
│       └── mail-exception.filter.ts
```

### 2.2 Dependências a Adicionar

```json
{
  "@nestjs-modules/mailer": "^2.0.2",
  "@nestjs/bull": "^11.0.4",
  "@nestjs/schedule": "^6.1.1",
  "bull": "^4.12.0",
  "handlebars": "^4.7.8",
  "nodemailer": "^6.9.7"
}
```

---

## 3. Implementação Detalhada

### 3.1 Configuração de Ambiente (.env)

```env
# SMTP Configuration (mesmos dados do Web.config legado)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=flightjobs.net.no.reply@gmail.com
MAIL_PASS=${SMTP_PASSWORD}
MAIL_FROM=flightjobs.net.no.reply@gmail.com
MAIL_FROM_NAME=FlightJobs

# Queue Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Feature Flags de Segurança
MAIL_SEND_ENABLED=true
MAIL_RATE_LIMIT_PER_HOUR=100
MAIL_MAX_RECIPIENTS_PER_BATCH=50
MAIL_TEST_MODE=false
MAIL_TEST_WHITELIST=admin@flightjobs.net,rhpa23@yahoo.com.br
```

### 3.2 Templates de Email (Handlebars)

Todos os templates seguirão o mesmo design system da aplicação modernizada:

**Layout Base (`base.hbs`)**:
- Header com logo FlightJobs
- Cores: Azul primário `#22b8eb`, fundo escuro `#1a1a2e`
- Ícones: Lucide Icons via CDN
- Footer com links redes sociais e doação
- Botão de unsubscribe

**Redes Sociais a Incluir**:
- Discord: `https://discordapp.com/invite/xmpAWz7`
- YouTube: `https://www.youtube.com/channel/UCBHN8OG2yilRq3SrxAGaIaw`
- Facebook: `https://fb.me/rhpa23`
- Link doação PayPal: `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=44VG35XYRJUCW`

### 3.3 Serviço de Email (mail.service.ts)

```typescript
interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  attachments?: Array<{ filename: string; path: string }>;
  priority?: 'high' | 'normal' | 'low';
}

// Métodos específicos:
- sendWelcomeEmail(user: User, confirmationToken: string)
- sendPasswordResetEmail(user: User, resetToken: string)
- sendLicenseWarningEmail(user: User, licenses: License[])
- sendAirlineDebtEmail(user: User, airline: Airline, job: Job)
```

### 3.4 Processamento em Background (Bull Queue)

```typescript
// mail.processor.ts
@Processor('mail-queue')
export class MailProcessor {
  @Process('send-mail')
  async handleSendMail(job: Job<SendMailOptions>) {
    // Implementação idempotente com retry
  }
  
  @OnQueueFailed()
  handleError(job: Job, error: Error) {
    // Log e alerta para admin
  }
}
```

### 3.5 Jobs Agendados

```typescript
// mail.scheduler.ts
@Injectable()
export class MailScheduler {
  @Cron('0 */3 * * *') // A cada 3 horas (mesma frequência do legado)
  async handleLicenseWarningJob() {
    // Busca licenças expirando em 12h
    // Envia emails em lotes de 50
    // Reseta flag LicenseWarningSent após expiração
  }
}
```

---

## 4. Medidas de Segurança Anti-Spam

### 4.1 Rate Limiting
```typescript
// Throttle por usuário: máximo 5 emails por hora
// Throttle global: máximo 100 emails por hora
// Rate limit por IP no endpoint de disparo
```

### 4.2 Modo Teste/Whitelist
```typescript
if (config.MAIL_TEST_MODE) {
  // Redireciona todos os emails para whitelist
  // Loga tentativas de envio para emails fora da lista
}
```

### 4.3 Validações
- Verificar email confirmado antes de enviar
- Respeitar flags SendLicenseWarning / SendAirlineBillsWarning
- Flag LicenseWarningSent evita reenvio até renovação da licença
- Debounce: mínimo 24h entre alertas do mesmo tipo

### 4.4 Batch Processing
```typescript
// Processa emails em lotes para evitar sobrecarga
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 5000; // 5s
```

---

## 5. Migração de Dados

### 5.1 Novos Campos na Tabela Statistics
```typescript
// entity/statistics.entity.ts
@Column({ default: true })
sendLicenseWarning: boolean;

@Column({ default: true })
sendAirlineBillsWarning: boolean;

@Column({ default: false })
licenseWarningSent: boolean;

@Column({ default: false })
airlineBillsWarningSent: boolean;
```

### 5.2 Endpoint de Unsubscribe
```typescript
// profile.controller.ts
@Get('email/unsubscribe')
async unsubscribe(@Query('token') token: string, @Query('type') type: string) {
  // Valida token JWT
  // Atualiza flag correspondente
  // Retorna página de confirmação
}
```

---

## 6. Cronograma de Implementação

| Fase | Descrição |
|------|-----------|
| 1 | Setup do módulo mail + dependências |
| 2 | Templates base + layout comum |
| 3 | Serviço de email + queue |
| 4 | Templates específicos (4 templates) |
| 5 | Jobs agendados (license warning) |
| 6 | Integração auth (welcome, reset) |
| 7 | Integração job completion (debt alert) |
| 8 | Testes + segurança anti-spam |

---

## 7. Testes Recomendados

### 7.1 Unit Tests
- Template rendering com dados mock
- Rate limiting
- Filtro de whitelist

### 7.2 Integration Tests
- Envio real para Mailtrap (ambiente dev)
- Job scheduler funcionando
- Queue processamento

### 7.3 Teste de Carga
```bash
# Simula 1000 emails em fila
npm run test:mail:load
```

---

## 8. Checklist Pré-Deploy

- [ ] MAIL_TEST_MODE=true no ambiente de staging
- [ ] Whitelist configurada apenas com emails internos
- [ ] Rate limits ativos
- [ ] Logs de email configurados
- [ ] Monitoramento de fila (Bull Dashboard)
- [ ] Alerta para admin em caso de falha massiva
- [ ] Backup da config de SMTP verificado

---

## 9. Referências de Código Legado

| Funcionalidade | Arquivo | Linhas |
|----------------|---------|--------|
| EmailService | `App_Start/IdentityConfig.cs` | 19-43 |
| WarningJob | `Schedule/WarningEmailJob.cs` | 1-69 |
| ConfirmTemplate | `Content/templates/Confirm Email.html` | 1-30 |
| RegisterEmail | `AccountController.cs` | 223-226 |
| ResetPassword | `AccountController.cs` | 294-296 |
| AirlineDebt | `JobApiController.cs` | 551-597 |
| JobScheduler | `Global.asax.cs` | 45-63 |
