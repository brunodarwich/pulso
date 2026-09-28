# Pulso

Página institucional estática. Abra `index.html` ou sirva a pasta com:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Acesse http://127.0.0.1:8765.

## Antes de publicar

- Preencha `whatsappNumber` e/ou `contactEmail` em `scripts/config.js`. Nenhum contato foi inventado. Sem canal configurado, a seção informa a indisponibilidade e oculta os botões específicos. Os demais CTAs levam até essa seção; se só houver e-mail, passam a usar esse canal.
- Após definir o domínio público, substitua `og:image` em `index.html` pela URL absoluta de `assets/images/pulso-social.png`. O arquivo PNG tem 1200 × 630; sua fonte editável está em `assets/images/pulso-social.html`.
- Confirme os textos e o status dos projetos antes da publicação comercial.

## Comportamento

- Desktop: a demonstração inicia uma vez com 35% do palco visível e dura 9 segundos.
- Celular (até 768px): começa estática; o botão inicia a sequência de 6 segundos.
- Sair da área visível ou ocultar a aba pausa a sequência. Voltar retoma somente pausas automáticas; pausas manuais exigem o botão.
- Movimento reduzido: estado final estático, sem controle de reprodução. Mudanças nessa preferência também são atendidas sem recarregar.
- Menu móvel: foco contido, conteúdo de fundo inativo, botão interno de fechar, Escape e restauração do foco. Mudar para desktop fecha o menu e libera a rolagem.

## Verificação

```powershell
node --test tests/animation.test.cjs
```

Os seis testes cobrem movimento reduzido, início manual móvel, duração, limiar de entrada, pausa/retomada, replay e mudança de preferência, além da passagem dos pulsos até as saídas. Capturas de verificação visual ficam em `artifacts/`.
