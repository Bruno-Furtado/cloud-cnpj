# Descrição do Pull Request
_Descreva de forma clara e objetiva o que foi feito neste PR._

## Contexto
_Explique o motivo dessa mudança e qual problema ou melhoria ela soluciona._
Exemplo:
- **Módulo:** `03-distribution`
- **Impacto:** Correção na normalização dos dados antes da inserção no Firestore

## Alterações principais
- [ ] Adicionada função `normalizeRow()` para conversão de tipos incompatíveis com Firestore
- [ ] Ajustado tratamento de erro para `BigQueryDate` e `Big`
- [ ] Refatoração no `batchWrite()` para evitar exceção `Cannot modify a WriteBatch that has been committed.`

## Como testar
_Adicione instruções claras para testar sua implementação._
1. Execute `npm start`
2. Verifique os logs para erros relacionados à inserção no Firestore
3. Confirme que os dados foram salvos corretamente na coleção Firestore

## Checklist
Antes de marcar o PR como pronto, verifique se:
- [ ] O código segue os padrões definidos no projeto
- [ ] O código foi testado localmente
- [ ] A documentação foi atualizada (se aplicável)
