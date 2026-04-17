
Implemente tela(modal) de FBO management. Ela terá as seguintes funcionalidades:
- Uma lista de 8 aeroportos com as seguintes colunas: [Checkbox de seleção da linha], Airport name, Elevation, Runway Size, Availability, Score to increase, Fuel price (% discount), Ground crew (% discount) e FOB Price.
- Os dados são obtidos e calculados conforme a implementação do legado.
- A ordenação é pelos destinos onde mais são feitos Jobs. Também conforme a implementação do legado.
- Filtro para buscar na lista pelo nome da Airline
- Um botão para contratar o FBO da linha selecionada. Uma tela de confirmação com o texto abaixo:
  - Somente o proprietário tem permissão para alugar um FOB. A sua possui F$ [bank balance da Airline] em saldo bancário para alugar FBOs. Você realmente deseja alugar este FOB?
- Ao confirmar, o valor do FBO será debitado do bank balance da Airline e o FBO contratado fica associado a Airline. Também conforme a implementação do legado.
