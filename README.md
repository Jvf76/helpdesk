# Helpdesk

Esqueleto inicial de um sistema de helpdesk com triagem por IA. Os requisitos de negócio serão definidos na próxima etapa.

## Stack

- Java 21
- Spring Boot 4.1.1 com Spring Web MVC
- Maven 3.6.3 ou superior
- JUnit e Mockito, incluídos pelo `spring-boot-starter-test`

## Estrutura

```text
helpdesk/
├── pom.xml
├── src/main/java/br/com/helpdesk/HelpdeskApplication.java
├── src/main/resources/application.yml
└── src/test/java/br/com/helpdesk/HelpdeskApplicationTests.java
```

Coordenadas Maven: `br.com.helpdesk:helpdesk:0.0.1-SNAPSHOT`.

## Executar

Na pasta do projeto, com o JDK 21 configurado em `JAVA_HOME` e Maven no `PATH`:

```sh
mvn spring-boot:run
```

O servidor usa a porta 8080 por padrão. Ainda não existem endpoints; uma requisição à raiz retorna HTTP 404.

## Testar e empacotar

```sh
mvn test
mvn clean verify
java -jar target/helpdesk-0.0.1-SNAPSHOT.jar
```

O teste inicial verifica o carregamento do contexto Spring e é um teste de integração básico. Os testes unitários com Mockito serão adicionados junto às regras de negócio, usando `@ExtendWith(MockitoExtension.class)`, `@Mock` e `@InjectMocks` quando necessário.

## Próxima etapa

Definir os requisitos de chamados e triagem, a organização dos módulos, a persistência, a autenticação e o provedor de IA. Este esqueleto ainda não implementa essas funcionalidades.

## Referências

- [Requisitos do Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html)
- [Dependências de testes, incluindo Mockito](https://docs.spring.io/spring-boot/reference/testing/test-scope-dependencies.html)
