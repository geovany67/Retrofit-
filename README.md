# Simulação 3D — Retrofit elétrico do Edifício Vértice

Projeto interativo de apresentação do TCC. Abre `index.html` em um navegador moderno com suporte a WebGL e conexão com a internet para carregar Three.js e as fontes visuais. Também pode ser servido localmente com `python -m http.server 8000` nesta pasta e acessado em `http://localhost:8000`.

## Controles

- Arraste no modelo para orbitar e use a roda do mouse para aproximar ou afastar.
- Selecione um pavimento no menu ou clique na geometria para isolá-lo; clique novamente para voltar à vista geral.
- Use as opções de camadas para ocultar fluxo elétrico, proteções ou arquitetura.
- Acione os cenários na faixa inferior: operação normal, falta da rede, falha setorial e surto transitório.
- O botão **Planta** troca para a vista superior; **Vista inicial** restaura o enquadramento.

## O que a simulação representa

- Cinco níveis navegáveis: 1º, 2º, 3º, 4º pavimentos e cobertura.
- Laje de referência de 32,50 × 18,00 m, áreas mapeadas por pavimento, quadro de áreas e usos descritos nos arquivos do projeto.
- QGBT, quadros QD-P01 a QD-P04 e QD-COB, prumada, quadro essencial, UPS, bypass, ATS/QTA e grupo gerador.
- Caminho qualitativo da alimentação normal e de reserva, com destaque visual para transferência, isolamento de circuito e DPS.
- Estrutura leve, sem texturas pesadas, iluminação em tempo real, sombras ou pós-processamento.

Os arquivos nativos `.skp` e a documentação estão em `source_files/` para consulta. O cenário 3D é uma reconstrução esquemática guiada pelas dimensões, áreas e usos dos arquivos; não é uma conversão geométrica dos modelos SketchUp. O edifício é visualizado em corte aberto para permitir a leitura dos pavimentos e dos sistemas.

## Dados e limites de engenharia

A documentação adota 380/220 V, 60 Hz como premissa acadêmica; registra 220,5 kW de carga instalada; indica uma UPS na faixa de 30–40 kVA e aponta R$ 463.800 como orçamento básico. Esses valores aparecem como referência documental, não como dimensionamento validado.

Há uma divergência de área que a interface também sinaliza: a documentação técnica informa 4.090 m², o PDF de métricas calcula 2.490 m² e a planilha de pavimentos soma 2.925 m² ao considerar cinco lajes de 585 m².

O material informa 30 mA para DR, mas não especifica todos os circuitos e dispositivos. A cena não calcula correntes de projeto, bitolas, queda de tensão, curto-circuito, seletividade, capacidade de interrupção, autonomia da UPS, partida do gerador ou coordenação de DPS. Os cenários demonstram estados de operação de forma qualitativa, sem reproduzir fenômenos transitórios ou tempos reais de equipamento.

## Pendências técnicas antes de qualquer projeto executivo

1. Confirmar a entrada de energia, o esquema de aterramento e o ponto de conexão com a concessionária.
2. Consolidar as cargas e regimes dos grupos; validar os 220,5 kW e definir demanda/simultaneidade.
3. Resolver a divergência do 2º pavimento (40 ou 42 unidades) e revisar os rótulos identificados nas plantas.
4. Trocar as estimativas internas (±10%) por desenhos arquitetônicos cotados e compatibilizar as cinco plantas nativas `.skp`.
5. Definir sala técnica, posição e especificação do gerador, ATS/QTA, QGBT, UPS, bypass e quadros.
6. Levantar percursos e métodos de instalação; calcular alimentadores e circuitos, queda de tensão, curto-circuito, proteção, seletividade e condições nos modos rede, gerador e UPS.
7. Definir autonomia/cargas críticas, sequência e intertravamentos de transferência, aterramento, equipotencialização, SPDA e DPS conforme estudo aplicável.
8. Validar especificações, cotações, diagramas unifilares e plano de comissionamento com profissional habilitado e documentação normativa vigente.
9. Resolver a divergência de área total (4.090 m² na documentação, 2.490 m² no PDF e 2.925 m² na planilha com a laje da cobertura).

## Fontes usadas

- `documentacao_tecnica_retrofit.docx` — escopo, arquitetura funcional, premissas, cargas consolidadas, UPS, proteções e limitações.
- `quadro_de_areas_pavimentos (1).xlsx` e `Metricas e Distribuicao de Plantas - Projeto Predial.pdf` — dimensões, usos e áreas por pavimento; o próprio material marca as divisões como estimativas por proporção.
- Cinco arquivos SketchUp e imagens do prédio — referências de pavimentos e aparência geral; as posições elétricas do modelo permanecem esquemáticas.
- Referências bibliográficas citadas na documentação técnica: ABNT NBR 5410; série ABNT NBR 5419; IEC 62040-1 e IEC 62040-3; guia de dimensionamento de geradores Cummins, Power Topic 7007; normas de conexão da Enel Distribuição São Paulo. Conferir edições vigentes e aplicabilidade antes de especificar.
