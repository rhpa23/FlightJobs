---
trigger: model_decision
---

# Análise Detalhada do Projeto FlightJobs

## Visão Geral

O **FlightJobs** é uma aplicação web legada desenvolvida em .NET Framework 4.5.2, voltada para simulação de aviação (Microsoft Flight Simulator, X-Plane). A aplicação funciona como uma plataforma de gerenciamento de voos virtuais, onde pilotos podem aceitar jobs (voos), gerenciar licenças, criar companhias aéreas virtuais e participar de desafios.

## Tecnologias Envolvidas

### Backend
- **.NET Framework 4.5.2** - Framework principal
- **ASP.NET MVC 5.2.3** - Framework web
- **ASP.NET Web API 5.2.3** - APIs REST
- **Entity Framework 6.4.4** - ORM para acesso a dados
- **ASP.NET Identity 2.2.4** - Autenticação e autorização
- **OWIN 3.0.1** - Middleware pipeline
- **SQLite** - Banco de dados principal (System.Data.SQLite 1.0.119.0)
- **MySQL Connector** - Suporte a MySQL (MySql.Data 8.0.28)

### Frontend
- **Bootstrap 3.3.7** - Framework CSS
- **jQuery 3.0.0** - Biblioteca JavaScript
- **Chart.Mvc** - Gráficos
- **PagedList.Mvc** - Paginação
- **Bootstrap File Input** - Upload de arquivos

### Infraestrutura e Serviços
- **Quartz.NET 3.0.7** - Agendamento de tarefas
- **ELMAH 1.2.2** - Logging de erros
- **Application Insights 2.2.0** - Monitoramento
- **SSH.NET** - Conexões SSH
- **Newtonsoft.Json 13.0.3** - Serialização JSON

## Arquitetura e Fluxo da Aplicação

### Estrutura do Projeto
```
FlightJobs/
├── Controllers/          - Controladores MVC e API
├── Models/              - Models de dados e ViewModels
├── Views/               - Views Razor
├── DTOs/                - Data Transfer Objects
├── App_Start/           - Configurações de inicialização
├── Schedule/            - Jobs agendados
├── Helpers/             - Classes auxiliares
├── Enums/               - Enumerações
└── Util/                - Utilitários

FlightJobs.Domain.Navdata/
├── Entities/            - Entidades de navegação
├── SqLiteDbContext.cs   - Contexto SQLite para dados de aeroportos
└── navdata.sqlite       - Banco de dados com informações de aeroportos
```

### Fluxo Principal da Aplicação

1. **Autenticação**: Usuários se registram/login via ASP.NET Identity
2. **Dashboard**: Home page exibe estatísticas do piloto e jobs pendentes
3. **Search Jobs**: Busca de voos disponíveis por origem/destino
4. **Job Acceptance**: Piloto aceita um job e começa o voo
5. **Flight Completion**: Registro do voo concluído com dados de performance
6. **Payment & Score**: Recebimento do pagamento e pontuação
7. **License Management**: Renovação de licenças de piloto
8. **Airline Creation**: Possibilidade de criar companhias aéreas virtuais

### Componentes Principais

#### Models de Dados
- **JobDbModel**: Representa um voo/job com origem, destino, carga, passageiros, pagamento
- **ApplicationUser**: Usuário do sistema estendido do Identity
- **AirlineDbModel**: Companhias aéreas virtuais
- **StatisticsDbModel**: Estatísticas dos pilotos
- **CertificateDbModel**: Certificados e licenças

#### Controllers
- **HomeController**: Dashboard principal
- **SearchJobsController**: Busca e filtragem de jobs
- **JobApiController**: API para gerenciamento de jobs
- **ProfileController**: Perfil e estatísticas do usuário
- **AirlinesController**: Gestão de companhias aéreas
- **ChallengeController**: Sistema de desafios

#### Banco de Dados
- **SQLite principal**: [FlightJobsLite.db](cci:7://file:///c:/DotNetProjects/FlightJobs/FlightJobs/App_Data/FlightJobsLite.db:0:0-0:0) - Dados da aplicação
- **SQLite Navdata**: [navdata.sqlite](cci:7://file:///c:/DotNetProjects/FlightJobs/FlightJobs.Domain.Navdata/navdata.sqlite:0:0-0:0) - Dados de aeroportos worldwide
- **ASP.NET Identity tables**: Gestão de usuários e roles

### Funcionalidades Específicas

#### Sistema de Jobs/Voos
- Cálculo automático de distâncias entre aeroportos
- Sistema de pagamento baseado em distância e tipo de carga
- Diferenças entre voos econômicos, primeira classe e carga
- Sistema de pontuação (pilot score)

#### Sistema de Licenças
- Licenças de piloto com data de expiração
- Sistema de alertas por e-mail (job agendado)
- Requisitos diferentes para tipos de aeronaves

#### Sistema de Companhias Aéreas
- Usuários podem criar suas próprias virtual airlines
- Sistema de contratos e certificados
- Gestão de FBOs (Fixed-Base Operators)

#### Sistema de Desafios
- Desafios entre usuários
- Tipos diferentes de desafios (civilian, military, rescue)
- Sistema de expiração e pontuação

### Jobs Agendados

1. **WarningEmailJob** (a cada 3 horas): Alertas de expiração de licenças
2. **BackpupJob** (a cada 8 horas): Backup do banco de dados via FTP

### Integrações Externas
- **SimBrief**: Integração para planejamento de voos
- **PayPal**: Sistema de doações
- **Email Service**: Envio de notificações

## Pontos Críticos para Modernização

### Questões Técnicas
- **Framework legado**: .NET Framework 4.5.2 sem suporte
- **Bootstrap 3**: Versão antiga do framework CSS
- **jQuery 3.0**: Versão desatualizada
- **Entity Framework 6**: Poderia migrar para EF Core
- **SQLite**: Limitações para escalabilidade

### Segurança
- Configuração de HTTPS comentada no código
- Potenciais vulnerabilidades em versões antigas
- Necessidade de atualização de pacotes de segurança

### Performance
- Consultas SQL diretas sem otimização
- Falta de caching implementado
- Arquitetura monolítica que pode beneficiar de microserviços

### Manutenibilidade
- Código misturando lógica de negócio e apresentação
- Falta de testes unitários
- Configurações hardcoded no código

### Importante (Regras de Ouro)
- Não se repita - reutilize o mesmo código, use componentes e hooks
- Mantenha simples e limpo (KISS) - evite complexidade desnecessária
- Você não vai precisar disso (YAGNI) - não implemente funcionalidades que você não precisa
- Separação de responsabilidades - mantenha o código organizado e fácil de manter

Este resumo fornece uma base completa para entender a arquitetura atual e planejar a modernização da aplicação FlightJobs.