# SanOptics

Esta é uma aplicação estática para serviços de visita domiciliar de uma ótica virtual. O projeto pode ser publicado no Netlify facilmente.

## Estrutura
- `public/` contém `index.html`.
- `css/` contém `styles.css`.
- `js/` contém `app.js`.

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

Ao abrir o site pela primeira vez, preencha o cadastro inicial informando usuário, senha, nome da ótica e email do responsável. Tudo fica salvo no `localStorage`.
Nos acessos seguintes basta fazer login com o usuário e senha. Se desejar alterar o nome da ótica ou email, utilize a tela de configuração após o login.
As visitas podem ser exportadas em JSON, CSV ou PDF profissional.
