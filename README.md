# Catalogo NY

Guia de deploy no Vercel para este projeto estatico.

## Visao geral

Este projeto:

- usa `index.html` na raiz
- serve assets locais diretamente do repositorio
- gera imagens otimizadas de produtos em `public/products/`
- nao depende de Next, React, Vite ou outro framework de build

## Estrutura importante

- `index.html`
- `assets/catalog-fold.js`
- `assets/catalog-image-manifest.js`
- `scripts/sync-product-images.cjs`
- `data/product-image-sources.json`
- `data/catalog-image-manifest.json`
- `public/products/`

## Fluxo recomendado

O deploy mais estavel para este repositorio e:

1. instalar dependencias
2. gerar ou atualizar as imagens locais
3. versionar os arquivos gerados
4. publicar o site estatico no Vercel

Isso evita depender de imagens externas durante o deploy.

## Preparacao local

Instale as dependencias:

```bash
npm install
```

Gere ou atualize as imagens locais:

```bash
npm run sync:product-images
```

Esse comando:

- baixa as imagens dos produtos
- converte para WebP
- gera thumbnails
- cria fallback local quando uma URL falha
- atualiza o manifesto em `assets/catalog-image-manifest.js`

Antes do deploy, confirme que estes arquivos estao commitados:

- `public/products/*`
- `assets/catalog-image-manifest.js`
- `data/catalog-image-manifest.json`

## Deploy no Vercel pelo dashboard

1. Suba o repositorio para GitHub, GitLab ou Bitbucket.
2. No Vercel, clique em `Add New Project`.
3. Importe o repositorio.
4. Em `Framework Preset`, selecione `Other`.
5. Use estas configuracoes:

```txt
Root Directory: .
Install Command: npm install
Build Command: deixe vazio
Output Directory: deixe vazio
```

6. Clique em `Deploy`.

Como o projeto e estatico e o `index.html` esta na raiz, o Vercel serve os arquivos diretamente do repositorio publicado.

## Deploy no Vercel via CLI

Instale a CLI:

```bash
npm i -g vercel
```

No primeiro deploy:

```bash
vercel
```

Na configuracao inicial:

- confirme o login
- selecione a pasta atual como raiz do projeto
- mantenha `Other` quando o preset for perguntado
- nao informe build command

Para publicar em producao:

```bash
vercel --prod
```

## Quando adicionar produto novo

1. Atualize `data/product-image-sources.json`.
2. Rode:

```bash
npm run sync:product-images
```

3. Revise os arquivos gerados em `public/products/`.
4. Faca commit dos arquivos novos ou alterados.
5. Publique no Vercel.

## Como as imagens sao servidas

O frontend usa caminhos locais como:

```txt
public/products/pf1-sauvage-elixir-60ml.webp
```

Como esses arquivos fazem parte do repositorio publicado, o Vercel os entrega localmente sem depender do servidor de origem da imagem.

## Troubleshooting

### Imagem nao apareceu

Rode novamente:

```bash
npm run sync:product-images
```

Depois confirme se o arquivo existe em `public/products/`.

### URL externa quebrada

O script gera um fallback local para manter o deploy funcional, mas o ideal e corrigir a origem em `data/product-image-sources.json`.

### Vercel tentou rodar um build desnecessario

Deixe `Build Command` vazio e mantenha o preset como `Other`.

### Preciso regenerar tudo do zero

1. Apague os arquivos dentro de `public/products/`.
2. Rode `npm run sync:product-images`.
3. Faca commit dos arquivos gerados novamente.

## Checklist antes do deploy

- `npm install`
- `npm run sync:product-images`
- revisar `public/products/`
- revisar `assets/catalog-image-manifest.js`
- revisar `data/catalog-image-manifest.json`
- commitar os arquivos gerados
- publicar no Vercel

## Opcional

Se quiser evoluir o fluxo depois, os proximos passos mais uteis sao:

- rodar `npm run sync:product-images` no CI antes do deploy
- automatizar a geracao quando novos produtos entrarem no dataset
- adicionar cache/CDN por camada de edge
