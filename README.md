# SanOptics

Esta é uma aplicação estática para serviços de visita domiciliar de uma ótica virtual. O projeto pode ser publicado no Netlify facilmente.

## Estrutura
 - `public/` contém `index.html`, `css/` e `js/` com todos os arquivos estáticos.
 - `lib/` possui as cópias locais do Leaflet (JS e CSS).

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
Use os botões disponíveis para exportar ou importar um arquivo JSON, gerar um PDF profissional (uma visita por página) ou limpar todo o histórico.
O campo de assinatura no formulário permite desenhar com o mouse ou toque, e a assinatura é incluída no PDF gerado.
O título "Histórico de Visitas" exibe, entre parênteses, a quantidade de registros salvos.

## Armazenamento
As imagens enviadas são reduzidas automaticamente antes do salvamento para economizar espaço. Caso o limite de `localStorage` seja atingido, o aplicativo exibirá um aviso sugerindo exportar ou remover visitas antigas. Para evitar exceder a capacidade, somente a foto da receita é mantida no histórico; a imagem utilizada para medir a distância pupilar não é mais armazenada. Fotos do catálogo são compactadas e salvas junto com a visita e também aparecem no PDF exportado, caso existam.

## Experiência do Usuário
Ao confirmar o cadastro de uma visita, uma barra de progresso animada é exibida indicando que o salvamento está em andamento. Ela permanece oculta durante a navegação comum e só aparece quando o botão **Salvar Visita** é pressionado. Assim que o processo termina, a barra desaparece automaticamente.
