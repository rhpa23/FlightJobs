# Mail Module - FlightJobs

Módulo completo de envio de emails para a aplicação FlightJobs, substituindo o sistema legado ASP.NET.

## Funcionalidades

### Emails Transacionais
- **Welcome Email**: Enviado quando um usuário se registra
- **Password Reset**: Enviado quando um usuário solicita reset de senha

### Emails Agendados (Cron Jobs)
- **License Warning**: Alerta de expiração de licença do piloto (a cada 3 horas)

### Emails por Evento
- **Airline Debt Alert**: Notificação de débito da airline quando um job é finalizado

## Arquitetura

```
mail/
├── mail.module.ts          # Módulo NestJS
├── mail.service.ts         # Serviço principal de envio
├── mail.processor.ts       # Processador de fila Bull
├── mail.scheduler.ts       # Jobs agendados
├── interfaces/
│   ├── mail.interfaces.ts       # Tipagens de dados
│   └── mail-config.interface.ts # Configurações
└── templates/
    ├── base.hbs            # Layout base comum
    ├── welcome.hbs         # Email de boas-vindas
    ├── password-reset.hbs  # Reset de senha
    ├── license-warning.hbs # Alerta de licença
    └── airline-debt.hbs    # Alerta de débito
```

## Configuração

Adicione ao `.env`:

```env
# SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=flightjobs.net.no.reply@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=flightjobs.net.no.reply@gmail.com
MAIL_FROM_NAME=FlightJobs

# Security Settings
MAIL_SEND_ENABLED=true
MAIL_RATE_LIMIT_PER_HOUR=100
MAIL_TEST_MODE=true
MAIL_TEST_WHITELIST=admin@flightjobs.net

# Redis (para fila)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Uso

### Enviar email de boas-vindas
```typescript
await this.mailService.sendWelcomeEmail({
  userName: 'JohnDoe',
  userEmail: 'john@example.com',
  confirmationLink: 'https://flightjobs.bsite.net/confirm?token=abc',
});
```

### Enviar email de reset de senha
```typescript
await this.mailService.sendPasswordResetEmail({
  userName: 'JohnDoe',
  userEmail: 'john@example.com',
  resetLink: 'https://flightjobs.bsite.net/reset?token=abc',
  expiresIn: '24 hours',
});
```

### Enviar alerta de licença
```typescript
await this.mailService.sendLicenseWarningEmail({
  userId: 'user-guid',
  userName: 'JohnDoe',
  userEmail: 'john@example.com',
  licenses: [
    { name: 'IFR Rating', maturityDate: new Date(), daysUntilExpiry: 5 }
  ],
});
```

### Enviar alerta de débito da airline
```typescript
await this.mailService.sendAirlineDebtEmail({
  userId: 'user-guid',
  userName: 'JohnDoe',
  userEmail: 'john@example.com',
  airlineName: 'Test Air',
  debtValue: 50000,
  debtMaturityDate: new Date(),
  jobDetails: {
    departure: 'KJFK',
    arrival: 'KLAX',
    model: 'Boeing 737-800',
    flightTime: '5h 30m',
    distance: 2500,
    pax: 150,
    cargo: 5000,
  },
});
```

## Templates

Todos os templates usam Handlebars e herdam do layout base (`base.hbs`).

### Helpers disponíveis
- `{{formatDate date}}` - Formata data
- `{{formatCurrency value}}` - Formata como moeda USD
- `{{eq a b}}` - Comparação de igualdade

### Personalização

Os templates incluem:
- Logo FlightJobs com link para o site
- Cores consistentes com o design system (azul #22b8eb)
- Links para redes sociais (Discord, YouTube, Facebook)
- Botão de doação PayPal
- Link de unsubscribe

## Segurança

### Rate Limiting
- Global: 100 emails/hora
- Por usuário: 5 emails/hora

### Modo Teste
Quando `MAIL_TEST_MODE=true`:
- Todos os emails são redirecionados para a whitelist
- Emails fora da whitelist são bloqueados e logados

### Processamento em Fila
Todos os emails são processados via Bull Queue com Redis:
- Retry automático (3 tentativas)
- Backoff exponencial
- Processamento assíncrono não bloqueante

## Jobs Agendados

### License Warning Job
- **Frequência**: A cada 3 horas
- **Descrição**: Busca licenças expirando em 12h e envia alertas
- **Batch size**: 50 usuários por vez
- **Delay entre batches**: 5 segundos

### Reset Warning Flags
- **Frequência**: Diário à meia-noite
- **Descrição**: Reseta flags de alerta enviado para licenças renovadas

## Integrações

### Auth Module
- Envia welcome email após registro
- Envia password reset email via endpoint `/auth/forgot-password`

### Jobs Module
- Envia airline debt alerts quando jobs são finalizados

## Monitoramento

Logs são gerados em todos os eventos:
- Email enfileirado
- Email enviado com sucesso
- Falha no envio (com retry)
- Rate limit atingido

## Migração do Legado

| Funcionalidade Legada | Nova Implementação |
|-----------------------|-------------------|
| `EmailService` (IdentityConfig.cs) | `MailService` |
| `WarningEmailJob` (Quartz) | `MailScheduler` |
| Template HTML estático | Handlebars dinâmico |
| Envio síncrono | Fila Bull assíncrona |
