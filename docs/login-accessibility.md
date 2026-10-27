# Login dividido, pódio 3D e acessibilidade

Implementação local em 27/10/2026. Esta revisão é publicada apenas como preview na branch `feat/login-accessibility`, a pedido do responsável. A produção permanece na versão anterior.

## Componentes

- `artifacts/startup-institution-platform/src/pages/login.tsx`: apresentação do login em tela dividida. Usa o estado e as ações reais de `identity-page.tsx`; não implementa outra autenticação.
- `src/features/login/InteractivePodium.tsx`: cena Three.js + `@react-three/fiber`, com iluminação por tema e reação ao ponteiro, foco do botão de entrada e digitação no guia. Sem campos de senha fictícios. Os blocos decorativos não representam resultados ou projetos reais.
- `src/features/accessibility/AccessibilityPanel.tsx`: painel com tema claro/escuro/sistema, modo tranquilo, texto ampliado, ajustes de cores e restauração de preferências.
- `AccessibilityProvider.tsx`: preferências validadas no localStorage, tema do dispositivo e movimento reduzido. Não guarda dados de conta.
- `src/features/login/ConciergeChat.tsx`: guia textual com respostas prontas, identificado como guia. A opção de IA só aparece quando a API declara configuração disponível.
- `src/components/ui`: controles shadcn/ui sobre Radix para Button, Label, Switch e Tooltip, além de Input. Foram restaurados apenas os necessários. Não há formulário de senha/cadastro próprio nem necessidade de React Hook Form neste fluxo Google.
- `src/features/login/login.css`: tokens compartilhados com Tailwind, temas e estilos responsivos. Framer Motion anima a entrada e a transição de fundo; movimento reduzido ou modo tranquilo eliminam as animações.

Caminhos `src/*` acima são relativos ao frontend principal.

## Acessibilidade e desempenho

- Login Google e ajuda funcionam sem áudio, câmera, microfone ou comandos de voz.
- Erros usam ícone e texto com anúncio acessível; a conversa usa região de log com anúncios educados.
- Foco visível, labels, landmarks, painel modal nativo com Escape e restauração do foco.
- Alt+Shift+A abre as opções; Alt+Shift+L leva ao botão de entrada, quando disponível. A disponibilidade dos atalhos também depende do navegador e sistema operacional.
- Texto ampliado e espaçamentos maiores no modo tranquilo, sem reduzir intencionalmente o contraste do texto.
- Os ajustes para protanopia, deuteranopia, tritanopia e acromatopsia são opcionais e restauráveis. São realces visuais aproximados, não tratamentos ou correções clinicamente calibradas. Não substituem texto, ícones ou contraste.
- Three.js é carregado separadamente. Movimento reduzido e modo tranquilo evitam até o download desse módulo. No celular, o visual estático é o padrão, com ativação 3D opcional.
- WebGL usa renderização sob demanda, DPR limitado, sem recursos/fontes 3D remotos nem animação contínua. Há visual estático para indisponibilidade de WebGL/carregamento.
- A autenticação e o painel foram separados do bundle público para evitar que a página inicial carregue o fluxo 3D/SDK de login.

Não se trata de certificação WCAG nem comprovação de compatibilidade com todos os leitores de tela. Safari/iOS e tecnologias assistivas reais continuam exigindo homologação.

## Concierge e IA: estado real

A ajuda guiada funciona localmente por texto e botões. Não é apresentada como IA generativa, não consulta contas e não declara ter enviado pedidos ou recuperado senhas.

Há integração real preparada no Express em `src/routes/concierge.ts`, usando AI SDK 7. O servidor não fornece ferramentas, banco, dados institucionais ou ações de autenticação ao modelo. Ele responde somente com orientações textuais. O modelo é configurado no servidor, nunca enviado pelo navegador.

A geração está **desativada por padrão**, pois não foi confirmado um provedor/cota/orçamento. Não foi feita chamada real a modelos nem contratado serviço. Testes usam gerador simulado. O guia continua utilizável com IA desativada ou indisponível.

Configuração opcional, somente após aprovação de custos e privacidade:

```dotenv
CONCIERGE_ENABLED=false
CONCIERGE_MODEL=
CONCIERGE_ALLOWED_ORIGIN=
AI_GATEWAY_API_KEY=
```

1. Escolher um modelo de texto existente no catálogo atual do AI Gateway e confirmar acesso, preços e limites. O catálogo foi consultado nesta rodada; nenhum modelo foi escolhido automaticamente.
2. Configurar orçamento rígido no serviço/provedor antes de habilitar uso público. Não presumir que cota gratuita seja ilimitada ou que renovará.
3. Definir `CONCIERGE_ALLOWED_ORIGIN` como a origem exata da aplicação (sem caminho), `CONCIERGE_MODEL` como o identificador real e as credenciais somente no backend. Na Vercel pode ser usado OIDC; localmente, a chave Gateway. Nunca usar `VITE_*` para credenciais de IA.
4. Revisar retenção de conversas e finalidade/consentimento aplicáveis. A UI avisa para não enviar senhas/documentos/dados pessoais e a opção de geração é voluntária.
5. Só então habilitar a flag e testar uma requisição real autorizada. Confirmar consumo e resposta antes de anunciar a geração como disponível.

A API limita histórico, texto, papéis, tempo, saída, concorrência e tentativas por instância; recusa outras origens, entradas inválidas e campos extras. As respostas protegidas contra cache não expõem detalhes do provedor. O limitador em memória **não é cota global em serverless**: requer limite financeiro no Gateway e controle de abuso distribuído antes de ativar IA publicamente. A verificação de Origin não é autenticação nem impede clientes externos que falsifiquem cabeçalhos.

Não há recuperação de conta via conversa, envio de e-mail ou concessão de acesso pelo modelo. A recuperação continua no Google e a aprovação continua na gestão institucional.

## Verificação

- `pnpm run build:vercel`: tipos e build de frontend/API.
- `pnpm test:routing`: 23 testes HTTP, sendo 17 anteriores e 6 novos do concierge. Testam configuração desativada, origem, validação, resposta real do gerador injetado, erro sem detalhes privados e limite de tentativas. Não chamam IA real.
- `python3 scripts/login-browser.py`: temas/persistência, atalhos, preferências, modo tranquilo, guia, dispositivos pequenos, download evitado com movimento reduzido e cena WebGL em Chromium com renderização de software. Não mede desempenho de GPU em aparelhos reais.
- `python3 scripts/workspace-browser.py`: regressão dos 23 cenários existentes, incluindo seis perfis, falhas de identidade e permissões, formulários e navegação.

Os testes de navegador usam fixtures de identidade e API, sem credenciais reais ou escrita no banco. Capturas ficam em `/tmp/catapimba-login`. Nenhuma migration, política RLS, regra de negócio institucional ou contrato de sessão foi alterado.
