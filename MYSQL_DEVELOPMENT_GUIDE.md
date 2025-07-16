# Guia de Desenvolvimento MySQL - PartiuTrip

## Visão Geral

Este guia documenta as melhores práticas e padrões para desenvolvimento com MySQL no projeto PartiuTrip usando Drizzle ORM.

## Incompatibilidades Críticas

### 1. Método `.returning()` - NÃO SUPORTADO

O MySQL não suporta o método `.returning()` presente no PostgreSQL. Todas as operações de INSERT, UPDATE e DELETE devem ser adaptadas.

#### ❌ Padrão PostgreSQL (Incompatível)
```typescript
// ERRO: Não funciona no MySQL
const result = await db.insert(users).values({
  username: 'usuario',
  email: 'email@exemplo.com'
}).returning();
```

#### ✅ Padrão MySQL (Correto)
```typescript
// Inserção sem returning
await db.insert(users).values({
  username: 'usuario',
  email: 'email@exemplo.com'
});

// Para obter dados após inserção, use query separada
const insertedUser = await db
  .select()
  .from(users)
  .where(eq(users.username, 'usuario'))
  .limit(1);
```

## Padrões de Desenvolvimento

### 1. Operações de Inserção

```typescript
// ✅ Padrão correto para inserção
try {
  await db.insert(trips).values({
    title: 'Viagem para Paris',
    destination: 'Paris, França',
    creatorId: userId
  });
  
  console.log('✅ Viagem criada com sucesso');
} catch (error) {
  console.error('❌ Erro ao criar viagem:', error);
  throw error;
}
```

### 2. Operações de Atualização

```typescript
// ✅ Padrão correto para atualização
try {
  await db
    .update(users)
    .set({ 
      averageRating: "4.8",
      totalRatings: 10
    })
    .where(eq(users.id, userId));
    
  console.log('✅ Usuário atualizado com sucesso');
} catch (error) {
  console.error('❌ Erro ao atualizar usuário:', error);
  throw error;
}
```

### 3. Operações de Exclusão

```typescript
// ✅ Padrão correto para exclusão
try {
  await db
    .delete(tripRequests)
    .where(and(
      eq(tripRequests.userId, userId),
      eq(tripRequests.tripId, tripId)
    ));
    
  console.log('✅ Solicitação removida com sucesso');
} catch (error) {
  console.error('❌ Erro ao remover solicitação:', error);
  throw error;
}
```

## Debugging e Logs

### 1. Logs Informativos

```typescript
// ✅ Use logs para debug e monitoramento
console.log('📝 Criando avaliação:', {
  userId,
  targetId,
  rating,
  comment
});

await db.insert(userRatings).values({
  userId,
  targetId,
  rating,
  comment
});

console.log('✅ Avaliação criada com sucesso');
```

### 2. Tratamento de Erros

```typescript
// ✅ Tratamento adequado de erros
try {
  const result = await db.operation();
  console.log('✅ Operação concluída');
} catch (error) {
  console.error('❌ Erro na operação:', error);
  // Trate o erro adequadamente
  throw new Error('Falha na operação do banco de dados');
}
```

## Verificação de Compatibilidade

### Lista de Verificação

- [ ] Todas as operações INSERT removeram `.returning()`
- [ ] Todas as operações UPDATE removeram `.returning()`
- [ ] Todas as operações DELETE removeram `.returning()`
- [ ] Logs adequados foram adicionados para debug
- [ ] Tratamento de erros implementado
- [ ] Queries testadas no ambiente de desenvolvimento

### Comando de Verificação

```bash
# Buscar por uso indevido de .returning()
grep -r "\.returning(" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
```

## Migração de Código Existente

### Passos para Migrar

1. **Identificar**: Encontre todas as ocorrências de `.returning()`
2. **Remover**: Remova o método das queries
3. **Ajustar**: Adicione logs informativos
4. **Testar**: Verifique se as operações funcionam corretamente
5. **Documentar**: Atualize comentários no código

### Exemplo de Migração

```typescript
// ❌ Antes (PostgreSQL)
const newTrip = await db.insert(trips).values({
  title: 'Viagem'
}).returning();

// ✅ Depois (MySQL)
await db.insert(trips).values({
  title: 'Viagem'
});

console.log('✅ Viagem criada com sucesso');
```

## Ferramentas de Desenvolvimento

### 1. Drizzle Kit

```bash
# Sincronizar schema com banco
npm run db:push

# Verificar diferenças
npx drizzle-kit push:mysql
```

### 2. Debug de Queries

```typescript
// Para debug detalhado, use logs
console.log('🔍 Executando query:', {
  table: 'users',
  operation: 'insert',
  data: userData
});
```

## Problemas Comuns e Soluções

### 1. Erro: "returning is not a function"

```typescript
// ❌ Problema
const result = await db.insert(table).values(data).returning();

// ✅ Solução
await db.insert(table).values(data);
console.log('✅ Dados inseridos');
```

### 2. Necessidade de Obter Dados Após Inserção

```typescript
// ✅ Solução: Query separada
await db.insert(users).values({ username: 'test' });

const user = await db
  .select()
  .from(users)
  .where(eq(users.username, 'test'))
  .limit(1);
```

### 3. Operações em Lote

```typescript
// ✅ Para operações em lote
for (const item of items) {
  await db.insert(table).values(item);
}

console.log(`✅ ${items.length} itens inseridos`);
```

## Próximos Passos

1. Revisar todo o código existente
2. Implementar verificações automáticas
3. Treinar equipe nos novos padrões
4. Atualizar documentação de API

---

**Última Atualização**: 16 de julho de 2025
**Status**: ✅ Implementado
**Versão**: 1.0