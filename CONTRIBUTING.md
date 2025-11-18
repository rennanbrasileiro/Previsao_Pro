# 🤝 Guia de Contribuição - PrevisãoPro

Obrigado por considerar contribuir com o PrevisãoPro! Este guia ajudará você a entender como contribuir efetivamente.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Posso Contribuir?](#como-posso-contribuir)
3. [Processo de Desenvolvimento](#processo-de-desenvolvimento)
4. [Padrões de Código](#padrões-de-código)
5. [Estrutura de Commits](#estrutura-de-commits)
6. [Pull Requests](#pull-requests)
7. [Reportando Bugs](#reportando-bugs)
8. [Sugerindo Melhorias](#sugerindo-melhorias)

---

## 📜 Código de Conduta

### Nossos Compromissos

- Ser respeitoso e inclusivo
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros

### Comportamentos Inaceitáveis

- Linguagem ou imagens sexualizadas
- Comentários ofensivos ou depreciativos
- Assédio público ou privado
- Publicar informações privadas de terceiros

---

## 🛠️ Como Posso Contribuir?

### Reportar Bugs

Antes de reportar um bug:
1. Verifique se já não foi reportado
2. Verifique se não foi corrigido na versão mais recente
3. Colete informações sobre o bug

**Template de Bug Report:**

```markdown
### Descrição
Descrição clara do problema

### Como Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

### Comportamento Esperado
O que deveria acontecer

### Comportamento Atual
O que está acontecendo

### Screenshots
Se aplicável, adicione screenshots

### Ambiente
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Versão: [ex: 2.0.0]

### Informações Adicionais
Qualquer contexto adicional
```

---

### Sugerir Melhorias

**Template de Feature Request:**

```markdown
### Descrição da Feature
Descrição clara da funcionalidade

### Problema que Resolve
Qual problema esta feature resolve?

### Solução Proposta
Como deveria funcionar?

### Alternativas Consideradas
Outras abordagens que você considerou?

### Contexto Adicional
Screenshots, mockups, exemplos
```

---

### Contribuir com Código

1. **Fork o Repositório**
   ```bash
   git clone https://github.com/seu-usuario/previsao-pro.git
   cd previsao-pro
   ```

2. **Criar Branch**
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b bugfix/meu-bugfix
   ```

3. **Fazer Alterações**
   - Escreva código limpo e documentado
   - Siga os padrões do projeto
   - Adicione testes se aplicável

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: adiciona minha feature"
   ```

5. **Push**
   ```bash
   git push origin feature/minha-feature
   ```

6. **Criar Pull Request**
   - Descreva suas alterações
   - Referencie issues relacionadas
   - Aguarde review

---

## 🔄 Processo de Desenvolvimento

### Setup do Ambiente

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Inicializar banco de dados
./scripts/init-db.sh

# Iniciar desenvolvimento
npm run dev
```

### Estrutura de Branches

```
main           → Produção (protegida)
develop        → Desenvolvimento (base para features)
feature/*      → Novas funcionalidades
bugfix/*       → Correções de bugs
hotfix/*       → Correções urgentes em produção
release/*      → Preparação para release
```

### Workflow

```
1. Criar issue descrevendo a tarefa
2. Criar branch a partir de develop
3. Desenvolver a feature/fix
4. Escrever testes (se aplicável)
5. Atualizar documentação
6. Criar PR para develop
7. Aguardar review
8. Fazer ajustes se necessário
9. Merge após aprovação
```

---

## 📝 Padrões de Código

### TypeScript

**Usar tipos explícitos:**
```typescript
// ❌ Evitar
const items = [];

// ✅ Correto
const items: PrevisaoItem[] = [];
```

**Interfaces para objetos:**
```typescript
// ✅ Correto
interface User {
  id: number;
  name: string;
  email: string;
}
```

**Enums para constantes:**
```typescript
// ✅ Correto
enum Status {
  Pendente = 'pendente',
  Pago = 'pago',
  Atrasado = 'atrasado'
}
```

---

### React

**Componentes Funcionais:**
```typescript
// ✅ Correto
export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return <div>...</div>;
}
```

**Props tipadas:**
```typescript
// ✅ Correto
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}
```

**Hooks na ordem:**
```typescript
// ✅ Correto
function MyComponent() {
  // 1. useState
  const [state, setState] = useState();
  
  // 2. useEffect
  useEffect(() => {}, []);
  
  // 3. Custom hooks
  const data = useAPI();
  
  // 4. Handlers
  const handleClick = () => {};
  
  // 5. Render
  return <div>...</div>;
}
```

---

### Tailwind CSS

**Ordem de classes:**
```tsx
// ✅ Correto (Layout → Spacing → Typography → Colors → Effects)
<div className="flex items-center p-4 text-lg font-bold text-blue-600 rounded-lg shadow-md">
```

**Usar componentes para estilos repetidos:**
```tsx
// ❌ Evitar
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// ✅ Correto - Criar componente
<Button variant="primary">
```

---

### SQL

**Sempre usar prepared statements:**
```typescript
// ❌ Evitar
await db.prepare(`SELECT * FROM users WHERE id = ${id}`).all();

// ✅ Correto
await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).all();
```

**Nomear índices:**
```sql
-- ✅ Correto
CREATE INDEX idx_competencias_condominio ON competencias(condominio_id);
```

---

### Documentação

**Comentários úteis:**
```typescript
// ❌ Evitar - comentário óbvio
// Incrementa contador
counter++;

// ✅ Correto - explica o porquê
// Incrementa contador para trigger de recálculo automático
counter++;
```

**JSDoc para funções complexas:**
```typescript
/**
 * Calcula o rateio proporcional de valores entre centros de custo
 * @param valorTotal - Valor total a ser rateado
 * @param centros - Array de centros de custo com suas áreas
 * @param areaTotal - Área total do condomínio em m²
 * @returns Array de objetos com centro e valor proporcional
 */
export function calcularRateio(
  valorTotal: number,
  centros: CentroCusto[],
  areaTotal: number
): RateioResult[] {
  // ...
}
```

---

## 📦 Estrutura de Commits

### Conventional Commits

Formato: `<tipo>(<escopo>): <descrição>`

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Tarefas gerais
- `ci`: Integração contínua
- `build`: Build system

**Exemplos:**

```bash
# Features
git commit -m "feat(pagamentos): adiciona sistema de alertas automáticos"
git commit -m "feat(docs): adiciona geração de faturas em PDF"

# Fixes
git commit -m "fix(calc): corrige cálculo de taxa por m² para valores decimais"
git commit -m "fix(ui): resolve problema de layout em telas pequenas"

# Docs
git commit -m "docs(api): atualiza documentação de endpoints"
git commit -m "docs(readme): adiciona seção de troubleshooting"

# Refactor
git commit -m "refactor(components): extrai lógica de cálculo para hook customizado"

# Performance
git commit -m "perf(query): adiciona índice para melhorar performance de busca"

# Tests
git commit -m "test(calc): adiciona testes para função de rateio"

# Chore
git commit -m "chore(deps): atualiza dependências"
```

### Mensagens de Commit

**Boas práticas:**

✅ Use o imperativo ("adiciona" não "adicionado")
✅ Primeira linha com até 50 caracteres
✅ Deixe uma linha em branco antes do corpo
✅ Use corpo para explicar "o que" e "por que" (não "como")
✅ Referencie issues: `Refs #123` ou `Closes #123`

**Exemplo completo:**

```
feat(pagamentos): adiciona comparação projetado x executado

Implementa sistema de comparação entre valores previstos
e valores efetivamente pagos, calculando a variação percentual
por categoria.

Features incluídas:
- Cálculo automático de variações
- Visualização em tabela
- Gráficos de comparação
- Alertas para variações > 10%

Closes #45
Refs #12
```

---

## 🔀 Pull Requests

### Antes de Criar PR

✅ Código compila sem erros
✅ Testes passam (se houver)
✅ Lint passa (`npm run lint`)
✅ Documentação atualizada
✅ Commits bem formatados
✅ Branch atualizada com develop

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix (correção que não quebra funcionalidade existente)
- [ ] Nova feature (funcionalidade que não quebra existente)
- [ ] Breaking change (mudança que quebra funcionalidade existente)
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Código está comentado onde necessário
- [ ] Documentação atualizada
- [ ] Testes adicionados/atualizados
- [ ] Lint passa
- [ ] Build está funcionando

## Screenshots (se aplicável)
Adicione screenshots

## Issues Relacionadas
Closes #123
Refs #456
```

### Review Process

1. **Autor cria PR**
   - Preenche template
   - Marca revisores
   - Aguarda feedback

2. **Revisores analisam**
   - Testam localmente
   - Verificam código
   - Deixam comentários

3. **Autor faz ajustes**
   - Responde comentários
   - Faz alterações solicitadas
   - Pede nova revisão

4. **Aprovação e Merge**
   - Mínimo 1 aprovação
   - CI passa
   - Merge para develop

---

## 🐛 Reportando Bugs

### Antes de Reportar

1. ✅ Atualize para versão mais recente
2. ✅ Busque issues existentes
3. ✅ Tente reproduzir em ambiente limpo
4. ✅ Colete logs e screenshots

### Informações Necessárias

```markdown
### Resumo
Descrição de uma linha

### Descrição Detalhada
Explicação completa do problema

### Passos para Reproduzir
1. Passo 1
2. Passo 2
3. Erro aparece

### Comportamento Esperado
O que deveria acontecer

### Comportamento Atual
O que está acontecendo

### Screenshots/Logs
Cole aqui

### Ambiente
- OS: Windows 10
- Browser: Chrome 120
- Versão do App: 2.0.0
- Node: 20.x

### Possível Solução (opcional)
Sugestão de como corrigir

### Contexto Adicional
Informações relevantes
```

---

## 💡 Sugerindo Melhorias

### Antes de Sugerir

1. ✅ Verifique o roadmap
2. ✅ Busque sugestões similares
3. ✅ Considere se faz sentido para o projeto
4. ✅ Prepare exemplos e mockups

### Template de Sugestão

```markdown
### Feature/Melhoria
Nome da feature

### Problema
Que problema resolve?

### Solução Proposta
Como deveria funcionar?

### Benefícios
- Benefício 1
- Benefício 2

### Alternativas
Outras opções consideradas

### Impacto
- Performance
- UX
- Manutenibilidade

### Mockups/Exemplos
Adicione aqui

### Prioridade Sugerida
- [ ] Crítica
- [ ] Alta
- [ ] Média
- [ ] Baixa
```

---

## 🎯 Áreas para Contribuir

### Fáceis (Good First Issue)

- 📝 Melhorar documentação
- 🐛 Corrigir typos
- 🎨 Melhorar acessibilidade
- ✅ Adicionar testes
- 🌍 Tradução

### Médias

- 🧩 Criar novos componentes
- 📊 Adicionar gráficos
- 🎨 Melhorar UI/UX
- ⚡ Otimizar performance
- 📱 Melhorar responsividade

### Avançadas

- 🏗️ Arquitetura
- 🔒 Segurança
- 🚀 Performance crítica
- 📡 Novas APIs
- 🧪 Testes E2E

---

## 📚 Recursos Úteis

### Documentação

- [README.md](README.md) - Visão geral
- [DOCUMENTATION.md](DOCUMENTATION.md) - Documentação técnica
- [API Docs](docs/api.md) - Documentação de APIs

### Links Importantes

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Hono Docs](https://hono.dev/)

### Comunicação

- GitHub Issues - Bugs e features
- GitHub Discussions - Discussões gerais
- Pull Requests - Code review

---

## ❓ FAQ

**P: Posso trabalhar em qualquer issue?**
R: Sim, mas comente na issue primeiro para evitar trabalho duplicado.

**P: Quanto tempo leva para revisar um PR?**
R: Geralmente 2-3 dias úteis.

**P: Preciso assinar algum CLA?**
R: Não, contribuições são livres.

**P: Como funciona o versionamento?**
R: Seguimos Semantic Versioning (MAJOR.MINOR.PATCH).

**P: Onde reporto problemas de segurança?**
R: Envie email para security@previsaopro.com (não use issues públicas).

---

## 🏆 Reconhecimento

Todos os contribuidores são listados no arquivo [CONTRIBUTORS.md](CONTRIBUTORS.md).

Contribuições são classificadas em:
- 💻 Code
- 📖 Documentation  
- 🎨 Design
- 🐛 Bug reports
- 💡 Ideas

---

## 📞 Ajuda

Precisa de ajuda?

- 📧 Email: dev@previsaopro.com
- 💬 GitHub Discussions
- 📚 Documentação

---

**Obrigado por contribuir! 🎉**

Sua contribuição ajuda a tornar o PrevisãoPro melhor para todos.
