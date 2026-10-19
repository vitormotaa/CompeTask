# CompeTask — funcionalidades de comunidade e lembretes

Este documento registra as mudanças implementadas para gerenciamento de membros e exclusões em comunidades, além do cancelamento de lembretes quando uma tarefa é concluída.

## Resumo

- O backend disponibiliza uma lista de membros ativos de uma comunidade.
- Um membro comum pode sair da comunidade; o administrador da comunidade não pode sair.
- A saída mantém o histórico de mensagens, mas remove os check-ins do usuário naquela comunidade.
- A exclusão de uma comunidade também remove seus registros dependentes.
- Concluir uma tarefa cancela seu lembrete e remove notificações pendentes não lidas.
- O frontend apresenta a nova lista de membros, identifica o administrador e oferece a saída da comunidade aos membros que não são administradores.

## Backend

Código localizado em `pp_competask_backend/pp_competask`.

### Listar membros

**Endpoint:** `GET /api/v1/comunidades/{id}/membros`

- Requer autenticação.
- A resposta contém os membros ativos da comunidade.
- Somente alguém que ainda seja membro ativo pode consultar a lista.
- A lista é ordenada com o administrador primeiro e, em seguida, pelo nome.
- Cada item usa o DTO de membro da comunidade e inclui ID e nome do usuário, indicação de administrador e pontuação.
- Comunidade inexistente resulta em `404 Not Found`; usuário que não pertence à comunidade recebe `403 Forbidden`.

### Sair de uma comunidade

**Endpoint:** `DELETE /api/v1/comunidades/{id}/membros/me`

- Requer autenticação; a identidade do membro vem da sessão autenticada, não de um ID enviado pelo cliente.
- Usuário sem vínculo ativo recebe `404 Not Found`.
- Se o membro for o administrador, a operação é recusada com `409 Conflict`.
- Para um membro comum:
  1. As imagens associadas aos seus check-ins naquela comunidade são removidas do serviço de imagens.
  2. Os check-ins são excluídos e sua pontuação no vínculo é zerada.
  3. Notificações pendentes e não lidas de tarefas comunitárias destinadas a esse membro são removidas.
  4. O vínculo não é apagado: fica inativo e recebe a data/hora de saída. A resposta de sucesso é `204 No Content`.

Manter o vínculo inativo permite preservar o relacionamento histórico do usuário com a comunidade. Mensagens não são apagadas. Caso o usuário volte à comunidade, o vínculo existente é reativado, em vez de criar outro.

As consultas de comunidades do usuário, listagens de membros, validações para enviar mensagens/check-ins e agendamento de lembretes consideram apenas vínculos ativos. A saída também mantém a pontuação do vínculo fora do ranking, pois os check-ins que a originaram foram removidos.

### Mensagens de membros que saíram

As mensagens são preservadas no histórico. O DTO de resposta de mensagem agora contém `autorSaiu`, calculado com base no vínculo ativo do autor naquela comunidade. Isso permite apresentar uma indicação no chat sem excluir ou alterar o conteúdo original da mensagem.

### Excluir comunidade e registros associados

**Endpoint existente:** `DELETE /api/v1/comunidades/{id}`

A exclusão é executada em uma transação de banco de dados e limpa os dados dependentes antes de remover a comunidade:

1. Remove imagens de check-ins vinculados à comunidade.
2. Remove a imagem da comunidade.
3. Remove notificações de tarefas da comunidade, lidas ou não.
4. Exclui os check-ins.
5. Exclui as mensagens.
6. Exclui as tarefas comunitárias.
7. Exclui a comunidade e seus vínculos de membros, que são removidos por cascata da relação configurada no modelo.

Comunidade inexistente resulta em `404 Not Found`. Falha ao excluir imagens resulta em `500 Internal Server Error`.

As chamadas ao serviço externo de imagens não participam da transação do banco. Assim, uma falha externa pode impedir a conclusão da exclusão e a operação não oferece atomicidade entre banco de dados e serviço de imagens.

### Lembretes e tarefas concluídas

Quando uma tarefa é marcada como concluída — seja pela atualização da tarefa ou pelo endpoint de alternância de conclusão — o backend:

- limpa a data e a hora do lembrete;
- remove notificações ainda não lidas associadas à tarefa;
- mantém notificações já lidas como histórico.

Ao reabrir uma tarefa, o lembrete removido não é restaurado automaticamente; será necessário configurá-lo novamente.

Para tarefas de comunidade, o processamento periódico considera somente membros ativos e não cria uma notificação para um membro que já fez check-in daquela tarefa. Um check-in também remove a notificação pendente e não lida daquele usuário para a tarefa.

### Persistência e compatibilidade

O vínculo de membro passou a armazenar estado ativo (`ativo`, com valor padrão `true`) e data/hora de saída (`dataSaida`). Com `ddl-auto: update`, o Hibernate pode adicionar as novas colunas ao banco existente na inicialização da aplicação. Ambientes com estratégia de migração própria devem incluir essas colunas na respectiva migração antes de implantar a aplicação.

## Frontend

Código localizado em `pp_competask_frontend`.

### Aba de membros

A tela de detalhe da comunidade agora tem a aba **Membros**. Ela:

- consulta `GET /api/v1/comunidades/{id}/membros`;
- mostra nome e pontuação dos membros ativos;
- identifica o usuário atual com “Você”;
- destaca o administrador da comunidade;
- informa o estado de carregamento e apresenta mensagem caso não seja possível obter a lista.

### Ação de saída

Na aba **Membros**, usuários que não são administradores veem a ação **Sair da comunidade**. A interface:

- pede confirmação antes de continuar;
- informa que os check-ins do usuário naquela comunidade serão excluídos;
- mostra o estado “Saindo...” durante a requisição;
- chama `DELETE /api/v1/comunidades/{id}/membros/me`;
- em caso de sucesso, desconecta o chat e retorna à lista de comunidades;
- em caso de falha, mantém a tela e apresenta a mensagem de erro.

O botão não é exibido para o administrador. A regra de negócio também é validada no backend, portanto não depende da interface para ser aplicada.

### Chat

O modelo de mensagem reconhece o campo opcional `autorSaiu`. Quando o backend indica que o autor não pertence mais à comunidade, a mensagem é acompanhada da indicação **(saiu da comunidade)**. O histórico e o conteúdo das mensagens continuam visíveis.

## Arquivos principais

### Backend

- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/controller/ComunidadeController.java`
- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/service/ComunidadeService.java`
- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/service/TarefaService.java`
- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/service/CheckinService.java`
- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/service/MensagemService.java`
- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/service/NotificacaoService.java`
- `pp_competask_backend/pp_competask/src/main/java/br/cefetmg/pp_competask/model/MembroComunidade.java`
- Repositórios de comunidade, membros, check-ins, mensagens, tarefas e notificações.

### Frontend

- `pp_competask_frontend/src/app/pages/comunidade-detalhe/comunidade-detalhe.page.ts`
- `pp_competask_frontend/src/app/pages/comunidade-detalhe/comunidade-detalhe.page.html`
- `pp_competask_frontend/src/app/pages/comunidade-detalhe/comunidade-detalhe.page.scss`
- `pp_competask_frontend/src/app/services/comunidades.service.ts`
- `pp_competask_frontend/src/app/models/comunidade.model.ts`

## Validação realizada

- `mvnw clean compile` do backend: concluído com sucesso.
- `npm run build` do frontend: concluído com sucesso.
- `mvnw test` não concluiu porque o teste de contexto depende de PostgreSQL em `localhost:5432`, indisponível no ambiente de validação.
- A build do frontend apresenta avisos de limite de tamanho CSS em páginas, incluindo a tela de detalhe da comunidade; a build, porém, termina com sucesso.
