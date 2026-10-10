# Helpdesk com triagem por IA

API Java 21 / Spring Boot 4.1.1 / Maven, com PostgreSQL, Flyway e Gemini. Testes com JUnit e Mockito.

## Fluxo

1. `POST /api/tickets` valida título (até 200 caracteres) e descrição (até 10.000), ambos obrigatórios e não em branco.
2. Salva o chamado com `triageStatus=PENDING` antes da chamada externa.
3. Envia título e descrição ao Gemini e solicita JSON com prioridade, categoria, confiança e justificativa.
4. Valida os valores e salva as sugestões com `triageStatus=COMPLETED`.
5. Retorna HTTP 201 e `Location: /api/tickets/{id}`.

Se a IA falhar, exceder 15 segundos, não tiver chave configurada ou devolver dados inválidos, o chamado permanece salvo como `PENDING`, com sugestões nulas. O POST ainda retorna 201. Não há transação de banco aberta durante a chamada ao modelo.

`GET /api/tickets/{id}` consulta um chamado; retorna 404 quando não existe. Dados inválidos no POST retornam 400.

| Campo | Valores iniciais |
| --- | --- |
| Prioridade sugerida | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| Categoria sugerida | `HARDWARE`, `SOFTWARE`, `NETWORK`, `ACCESS`, `EMAIL`, `OTHER` |
| Confiança | número entre `0.0` e `1.0` |
| Justificativa | frase curta sobre o impacto |
| Estado da triagem | `PENDING`, `COMPLETED` |

As sugestões ficam separadas de uma futura classificação definitiva. O frontend React oferece login local simples, quadro de chamados ordenado por prioridade e criação com retorno da triagem. Ainda não há autenticação no backend, aprovação humana ou reprocessamento automático. Uma falha de banco ao gravar a sugestão pode retornar erro depois da criação inicial; idempotência será definida em etapa posterior.

## PostgreSQL

Use um servidor PostgreSQL existente ou o Compose incluído (requer Docker). No PowerShell, na pasta do projeto:

```powershell
$env:DB_PASSWORD = Read-Host 'Senha do banco'
docker compose up -d postgres
```

O Compose cria banco e usuário `helpdesk`, com porta exposta em localhost. O volume preserva dados; a senha é aplicada na primeira inicialização do volume.

Para um servidor existente, crie um banco dedicado e configure:

```powershell
$env:DB_URL = 'jdbc:postgresql://localhost:5432/helpdesk'
$env:DB_USERNAME = 'helpdesk'
$env:DB_PASSWORD = Read-Host 'Senha do banco'
```

Flyway cria a tabela `tickets` ao iniciar; Hibernate valida o esquema, sem gerar tabelas automaticamente.

## Gemini

Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e configure a variável no terminal que iniciará a API. Não salve a chave no código ou no Git.

```powershell
$env:GEMINI_API_KEY = Read-Host 'Chave da API Gemini' -MaskInput
# Opcional, caso use outro modelo compatível com saída estruturada:
$env:GEMINI_MODEL = 'gemini-3.8-flash'
```

`-MaskInput` requer PowerShell 7.1 ou superior. Em outras versões, configure a variável pela IDE ou pelas configurações de ambiente do sistema.

| Variável | Padrão |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/helpdesk` |
| `DB_USERNAME` | `helpdesk` |
| `DB_PASSWORD` | Obrigatória |
| `GEMINI_API_KEY` | Vazia: triagem fica pendente |
| `GEMINI_MODEL` | `gemini-3.8-flash` |

A chave segue no header `x-goog-api-key`. Título e descrição são enviados à API do Google como dados não confiáveis; a instrução do sistema manda ignorar comandos presentes no chamado. O Gemini responde em português (`CRITICO`, `ALTA`, `MEDIA`, `BAIXA`; `REDE`, `HARDWARE`, `SOFTWARE`, `ACESSO`, `EMAIL`, `OUTROS`) e a aplicação converte esses valores para os enums usados pela API. Confiança e justificativa também são validadas e persistidas. O modelo é configurável sem mudar o código. As sugestões dependem da interpretação do modelo, não são regras determinísticas de SLA.

## Executar

Com Java 21, Maven 3.6.3+ e banco configurado:

```powershell
mvn spring-boot:run
```

Em outro terminal:

```powershell
$body = @{
    title = 'Sem acesso à rede'
    description = 'Todos os colaboradores estão sem internet e sem acesso aos sistemas internos.'
} | ConvertTo-Json

$ticket = Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/tickets' -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
$ticket
Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/$($ticket.id)"
```

## Testes

```powershell
mvn clean verify
```

Testes unitários e HTTP não exigem banco ou chave. Cobrem persistência antes da IA, sucesso, falha, validação HTTP, resposta inválida, timeout, interrupção e erros do provedor. Mockito simula a chamada ao Gemini; não há consumo de API nos testes.

Os dois testes PostgreSQL executam somente quando `TEST_DB_URL` estiver definida. Use um **banco dedicado de testes**: Flyway aplicará migrações; os registros criados serão removidos ao final.

```powershell
$env:TEST_DB_URL = 'jdbc:postgresql://localhost:5432/helpdesk_test'
$env:TEST_DB_USERNAME = 'helpdesk'
$env:TEST_DB_PASSWORD = Read-Host 'Senha do banco de testes'
mvn verify
```

## Estrutura

- `ticket/controller/`: endpoints REST e tratamento de erros HTTP.
- `ticket/service/`: regras de aplicação dos chamados.
- `ticket/repository/`: acesso ao PostgreSQL com Spring Data JPA.
- `ticket/model/`: entidades e estados do domínio de chamados.
- `ticket/dto/`: contratos de entrada e saída da API.
- `triage/service/`: contrato de triagem usado pela aplicação.
- `triage/model/`: prioridade, categoria e sugestão da triagem.
- `triage/integration/gemini/`: cliente e transporte HTTP do Gemini.
- `triage/config/`: configuração e propriedades do provedor.
- `triage/exception/`: erros específicos da triagem.
- `src/main/resources/db/migration/`: migrações PostgreSQL.
- `src/test/java/br/com/helpdesk/`: testes JUnit / Mockito.

## Referências

- [Saída estruturada do Gemini](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)
- [Spring Boot / Flyway](https://docs.spring.io/spring-boot/how-to/data-initialization.html)
- [Imagem PostgreSQL](https://hub.docker.com/_/postgres)
