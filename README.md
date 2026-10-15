# FCMOZ — FC Mobile Moçambique (v1.0)

Portal responsivo de notícias, eventos, códigos promocionais e comunidade de fãs.

## Ficheiros
- `index.html` — estrutura do site
- `style.css` — design responsivo
- `app.js` — filtros, tentativa de feeds públicos e comentários locais
- `manifest.json` e `assets/icon.svg` — base para instalação como PWA
- `firebase.example.js` — exemplo de configuração futura, não carregado

## Abrir no Acode
1. Extrai `FCMOZ-v1.zip` no telemóvel.
2. Abre a pasta `FCMOZ` no Acode.
3. Abre `index.html` e usa a pré-visualização.
4. Mantém todos os ficheiros e a pasta `assets` juntos.

## Publicar no GitHub Pages
1. Cria um repositório no GitHub chamado `fcmoz`.
2. Carrega todos os ficheiros e a pasta `assets` para a raiz do repositório.
3. Abre **Settings → Pages**.
4. Em **Build and deployment**, escolhe **Deploy from a branch**, branch `main`, pasta `/ (root)`, e guarda.
5. Espera pela publicação; o GitHub mostra o endereço do site na secção Pages.

## Notícias automáticas — importante
O site tenta carregar feeds públicos via RSS2JSON. A disponibilidade, o formato dos feeds, CORS e limites do serviço externo podem mudar. Se não houver resposta, aparecem cartões informativos de demonstração, claramente identificados como tal. Isto não é um sistema de notícias garantido em tempo real. Para uma solução estável, usa uma API/feed autorizado e, idealmente, uma função de backend que valide e normalize as fontes. Não copies conteúdo integral sem autorização.

## Códigos
A área não inventa códigos. O visitante é encaminhado para o portal oficial de resgate da EA. Só adiciona códigos após confirmação de fonte fiável, prazo e condições.

## Comentários
Nesta versão os comentários usam `localStorage`: só aparecem no navegador/dispositivo onde foram publicados. Não são enviados a um servidor. Para comentários partilhados, login, moderação e painel de administração, configura Firebase Authentication + Cloud Firestore e regras de segurança. Não publiques credenciais privadas.

## App Android
Esta pasta é uma PWA/site estático. Para APK, primeiro publica o site e depois empacota o URL com uma ferramenta de confiança. A instalação PWA depende de HTTPS e do suporte do navegador. Um `manifest.json` sozinho não cria um APK.

## Marca
FCMOZ é um projeto independente de fãs, não afiliado nem patrocinado pela Electronic Arts. EA SPORTS e FC Mobile são marcas dos respetivos proprietários.
