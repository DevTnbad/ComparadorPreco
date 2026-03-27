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

## Como instalar no Android
1. Abra o projeto no Chrome https://devtnbad.github.io/ComparadorPreco/
2. Toque no menu do navegador
3. Escolha **Adicionar à tela inicial** ou **Instalar app**
4. Confirme

## Próximos passos possíveis
- exportar histórico
- importar histórico
- filtros por data
- gráficos simples de economia
- versão mais robusta com IndexedDB
