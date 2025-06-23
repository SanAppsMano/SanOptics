# SanOptics

Esta é uma aplicação estática para serviços de visita domiciliar de uma ótica virtual. O projeto pode ser publicado no Netlify facilmente.

## Estrutura
- `public/` contém `index.html`, `manifest.json` e `service-worker.js`.
- `css/` contém `styles.css`.
- `js/` contém `app.js`.

## Deploy no Netlify
1. Faça login em sua conta Netlify e crie um novo site a partir deste repositório.
2. Defina a pasta de publicação como `public`.
3. Não é necessário comando de build. Apenas publique.
4. Habilite HTTPS e conferência de PWA no painel do Netlify.
5. Para usar Netlify Forms, os formulários já possuem o atributo `netlify`. Os envios ficam acessíveis no painel do Netlify.

Após login com o usuário padrão `@Sandes` e senha `Sandes@123`, cadastre as informações de administrador e comece a registrar visitas.
