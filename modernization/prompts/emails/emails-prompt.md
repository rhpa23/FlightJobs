Analise o todo o envio de emails da aplcação legada e  monte um plano para fazer a migração para a modernizada. Rastrei e liste todas as funcionalidades que eviam email e acrescente referencias. Algumas considerações:
-  Criar e utilizar todos os templates de emails com o mesmo layout, logo, cores e estilos da aplicação modernziada. A aparencia deve ser profissional e incentivar o uso da aplicação.
- Nos templates usar icones. Colocar sempre os links para as redes sociais e o de doação também.
- Fazer tudo de forma organizada e com separação de responsabilidades e acoplamento. Reuso para futuras funcionalidades que enviam email.
- Use o dados de configuração de email encontrados no Web.config do legado.
- **Importante** alguns alertas enviados por email, como por exemplo: Alertas de expiração de licenças, são disparados a cada 3 horas fazendo uma busca por licenças expiradas no banco. Por isso, tarefas em segundo plano devem ser geradas para atender  esse requisito.
- O plano deve ser completo e deve ir alem da análise feita na implementação antiga, trazendo soluções fora da caixa. 
- Como se trata de envio de emails para uma base de usuários muito grande, a implementação tem que ser feita com cautela para evitar envio de emails em massa, mesmo durante os testes iniciais.