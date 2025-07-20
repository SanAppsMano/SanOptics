# SanOptics

Esta é uma aplicação estática para serviços de visita domiciliar de uma ótica virtual. O projeto pode ser publicado no Netlify facilmente.

## Estrutura
 - `public/` contém `index.html`, `css/` e `js/` com todos os arquivos estáticos.

## Deploy no Netlify
1. Faça login em sua conta Netlify e crie um novo site a partir deste repositório.
2. Defina a pasta de publicação como `public`.
3. Não é necessário comando de build. Apenas publique.
4. Para usar Netlify Forms, os formulários já possuem o atributo `netlify`. Os envios ficam acessíveis no painel do Netlify.

## Rodando localmente
Se preferir testar antes do deploy, basta abrir o arquivo `public/index.html` em
seu navegador ou rodar um pequeno servidor HTTP. Exemplo usando Python 3:

```bash
cd public
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador.

Não há tela de login: ao abrir o site é possível cadastrar visitas imediatamente. Os dados ficam salvos no `localStorage` do navegador.
Use os botões disponíveis para exportar ou importar um arquivo JSON, gerar um PDF profissional (uma visita por página) ou limpar todo o histórico. Ao exportar, os nomes dos arquivos incluem a data e hora atuais no formato `Visitas_DD-MM-YYYY_HH:MM:SS.pdf` ou `Exportado_DD-MM-YYYY_HH:MM:SS.json`.
Também é possível compartilhar esses arquivos diretamente com outros aplicativos, como o WhatsApp, por meio do botão **Compartilhar**, disponível na seção de histórico (requer suporte ao Web Share API no navegador).
A área de assinatura permanece visível o tempo todo. Utilize o ícone de lápis para habilitar a edição, o de lixeira para limpar e o de check para concluir. A assinatura é incluída no PDF gerado.
O título "Histórico de Visitas" exibe, entre parênteses, a quantidade de registros salvos.

## Armazenamento
As imagens enviadas são reduzidas automaticamente antes do salvamento para economizar espaço. Caso o limite de `localStorage` seja atingido, o aplicativo exibirá um aviso sugerindo exportar ou remover visitas antigas. Para evitar exceder a capacidade, somente a foto da receita é mantida no histórico; a imagem utilizada para medir a distância pupilar não é mais armazenada. Fotos do catálogo são compactadas e salvas junto com a visita e também aparecem no PDF exportado, caso existam.

## Medição e calibragem da DP
Para medir a distância pupilar sem usar objetos externos, fotografe o rosto de frente e marque no canvas as duas bordas de uma íris.
Assumindo uma largura média de 12&nbsp;mm para a íris, o aplicativo calcula o fator de escala e, em seguida, toque nos centros das pupilas para obter o valor real em milímetros.
Os pontos usados para marcar a íris aparecem em azul, enquanto os das pupilas ficam vermelhos.

## Experiência do Usuário
Ao confirmar o cadastro de uma visita, uma barra de progresso animada é exibida indicando que o salvamento está em andamento. Ela permanece oculta durante a navegação comum e só aparece quando o botão **Salvar Visita** é pressionado. Assim que o processo termina, a barra desaparece automaticamente.
