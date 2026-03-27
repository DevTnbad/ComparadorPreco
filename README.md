# Compara Preço — versão simples para celular

## Objetivo
Este projeto foi pensado para ajudar pessoas a economizar no mercado de forma rápida e simples.

A ideia é comparar dois ou mais produtos pelo custo por **kilo** ou **litro**, mostrando qual opção é mais vantajosa e quanto pode ser economizado.

## Como funciona
O usuário digita:
- nome do produto
- peso/volume
- unidade: **Litro** ou **Kilo**
- preço
- estabelecimento (opcional)

### Regras de digitação
#### Preço
Digite somente números:
- `5` → `R$ 0,05`
- `55` → `R$ 0,55`
- `550` → `R$ 5,50`

#### Peso/Volume
Digite somente números:
- em **Litro**, o valor é lido como mililitros
  - `350` → `0,350 Litro`
- em **Kilo**, o valor é lido como gramas
  - `1500` → `1,500 Kilo`

## Resultado
Depois de comparar, o sistema:
- ordena do mais barato ao mais caro
- destaca o melhor em verde
- usa amarelo e vermelho para os demais
- mostra o custo por litro ou kilo
- mostra a economia percentual

### Economia percentual
- com **2 itens**: mostra a economia em relação ao mais caro
- com **3 ou mais itens**: mostra a economia em relação ao segundo lugar e ao mais caro

## Histórico
Cada comparação fica salva no próprio celular usando `localStorage`.

O histórico permite:
- ver comparações anteriores
- buscar pelo nome do produto
- apagar todo o histórico do aparelho

## Importante
Esta é a **versão simples**, sem servidor e sem computador.

Tudo funciona:
- direto no celular
- offline depois de instalado e carregado
- sem Flask
- sem SQLite

## Estrutura das pastas
```bash
comparador_preco_pwa_local/
├── index.html
├── history.html
├── style.css
├── app.js
├── history.js
├── storage.js
├── manifest.json
├── service-worker.js
├── README.md
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Como testar
Você pode abrir `index.html` no navegador, mas para instalação como PWA o ideal é servir os arquivos com um servidor estático simples.

Exemplo com Python:
```bash
python -m http.server 8000
```

Depois abra no navegador:
```text
http://127.0.0.1:8000
```

No celular, acesse pelo IP do computador na mesma rede:
```text
http://SEU_IP:8000
```

## Como instalar no Android
1. Abra o projeto no Chrome
2. Toque no menu do navegador
3. Escolha **Adicionar à tela inicial** ou **Instalar app**
4. Confirme

## Próximos passos possíveis
- exportar histórico
- importar histórico
- filtros por data
- gráficos simples de economia
- versão mais robusta com IndexedDB
