import { useEffect, useMemo, useState } from 'react';
import { createTicketWithTriage } from './api/tickets.js';

const tickets = [
  {
    id: 'HD-1048',
    title: 'Sistema de pagamentos indisponível',
    description: 'A equipe financeira não consegue processar pagamentos desde as 08:42.',
    priority: 'Crítica',
    requester: 'Marina Costa',
    initials: 'MC',
    department: 'Financeiro',
    sector: 'FINANCEIRO',
    category: 'Indisponibilidade',
    time: 'Há 12 min',
    sla: '18 min restantes',
    score: 100,
    status: 'Em atendimento',
    openedAt: '08 de outubro de 2026, às 08:42',
    impact: 'Toda a equipe financeira está impedida de processar pagamentos.',
    attachments: [],
    assignee: { name: 'Mariana Silva', username: 'mariana.silva' },
    collaborators: ['Carlos Mendes'],
  },
  {
    id: 'HD-1045',
    title: 'Acesso bloqueado ao painel comercial',
    description: 'Usuários do time comercial recebem erro de permissão após o login.',
    priority: 'Alta',
    requester: 'Rafael Lima',
    initials: 'RL',
    department: 'Comercial',
    sector: 'COMERCIAL',
    category: 'Acesso',
    time: 'Há 34 min',
    sla: '1h 26min restantes',
    score: 80,
    status: 'Aberto',
    openedAt: '08 de outubro de 2026, às 08:20',
    impact: 'O time comercial não consegue consultar clientes ou atualizar negociações.',
    attachments: [],
  },
  {
    id: 'HD-1041',
    title: 'Notebook reiniciando durante reuniões',
    description: 'O equipamento reinicia ao compartilhar a tela em chamadas de vídeo.',
    priority: 'Alta',
    requester: 'Bianca Rocha',
    initials: 'BR',
    department: 'Pessoas',
    sector: 'SUPORTE',
    category: 'Equipamento',
    time: 'Há 1h',
    sla: '2h 04min restantes',
    score: 80,
    status: 'Aberto',
    openedAt: '08 de outubro de 2026, às 07:54',
    impact: 'Uma colaboradora não consegue participar normalmente de reuniões.',
    attachments: [],
  },
  {
    id: 'HD-1039',
    title: 'Erro ao exportar relatório mensal',
    description: 'O arquivo gerado fica em branco quando o período contém mais de 30 dias.',
    priority: 'Média',
    requester: 'Caio Martins',
    initials: 'CM',
    department: 'Operações',
    sector: 'FINANCEIRO',
    category: 'Relatórios',
    time: 'Há 2h',
    sla: '5h 12min restantes',
    score: 50,
    status: 'Aberto',
    openedAt: '08 de outubro de 2026, às 06:48',
    impact: 'O fechamento mensal pode atrasar caso o relatório não seja recuperado.',
    attachments: [],
  },
  {
    id: 'HD-1034',
    title: 'Solicitação de instalação do Figma',
    description: 'Novo integrante precisa do aplicativo para iniciar as atividades de design.',
    priority: 'Baixa',
    requester: 'Lucas Neves',
    initials: 'LN',
    department: 'Produto',
    sector: 'TI',
    category: 'Software',
    time: 'Ontem, 16:20',
    sla: '1 dia restante',
    score: 20,
    status: 'Finalizado',
    openedAt: '07 de outubro de 2026, às 16:20',
    impact: 'O novo integrante consegue trabalhar, mas ainda não iniciou as tarefas de design.',
    attachments: [],
    assignee: { name: 'Administrador', username: 'adm123' },
    collaborators: ['Fernanda Alves'],
    finishedAt: '08 de outubro de 2026, às 09:10',
    finalizedBy: { name: 'Administrador', username: 'adm123' },
    resolution: 'A licença do Figma foi liberada no painel corporativo e a instalação foi concluída no notebook do colaborador.',
  },
];

const sectors = ['TI', 'SUPORTE', 'FINANCEIRO', 'COMERCIAL'];

const demoUsers = {
  adm123: { username: 'adm123', password: 'adm123', name: 'Administrador', initials: 'AD', sector: 'TODOS', role: 'Administrador' },
  ti123: { username: 'ti123', password: 'ti123', name: 'Equipe de TI', initials: 'TI', sector: 'TI', role: 'Analista' },
  suporte123: { username: 'suporte123', password: 'suporte123', name: 'Equipe de Suporte', initials: 'SU', sector: 'SUPORTE', role: 'Analista' },
  financeiro123: { username: 'financeiro123', password: 'financeiro123', name: 'Equipe Financeira', initials: 'FI', sector: 'FINANCEIRO', role: 'Analista' },
  comercial123: { username: 'comercial123', password: 'comercial123', name: 'Equipe Comercial', initials: 'CO', sector: 'COMERCIAL', role: 'Analista' },
};

const priorityClass = {
  Crítica: 'critical',
  Alta: 'high',
  Média: 'medium',
  Baixa: 'low',
};

const priorityLabels = { CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' };
const priorityScores = { CRITICAL: 100, HIGH: 80, MEDIUM: 50, LOW: 20 };
const categoryLabels = { HARDWARE: 'Equipamento', SOFTWARE: 'Software', NETWORK: 'Rede', ACCESS: 'Acesso', OTHER: 'Outros' };

function Icon({ name, size = 20 }) {
  const paths = {
    spark: <><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z"/><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Z"/></>,
    inbox: <><path d="M4 5h16v14H4z"/><path d="M4 14h4l2 2h4l2-2h4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    filter: <><path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/></>,
    logout: <><path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    paperclip: <><path d="m20.5 11.5-8.8 8.8a6 6 0 0 1-8.5-8.5l9.5-9.5a4 4 0 0 1 5.7 5.7l-9.5 9.5a2 2 0 0 1-2.8-2.8l8.8-8.8"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6"/><path d="M17 14a5 5 0 0 1 4 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Preencha usuário e senha para continuar.');
      return;
    }
    const account = demoUsers[username];
    if (!account || account.password !== password) {
      setError('Usuário ou senha incorretos.');
      return;
    }
    setError('');
    onLogin({ username: account.username, name: account.name, initials: account.initials, sector: account.sector, role: account.role });
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Apresentação">
        <div className="brand brand-light"><span className="brand-mark"><Icon name="spark" /></span> Clarity Desk</div>
        <div className="story-copy">
          <p className="eyebrow">SUPORTE QUE FLUI</p>
          <h1>Cada chamado no lugar certo. <em>Desde o início.</em></h1>
          <p>Nossa IA analisa, classifica e prioriza cada solicitação para sua equipe focar no que realmente importa.</p>
          <div className="ai-note"><span><Icon name="spark" size={18} /></span><div><strong>Triagem inteligente com Gemini</strong><small>Prioridade, categoria e contexto em segundos.</small></div></div>
        </div>
        <p className="story-footer">Atendimento claro. Equipes tranquilas.</p>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-brand brand"><span className="brand-mark"><Icon name="spark" /></span> Clarity Desk</div>
          <p className="eyebrow">BEM-VINDO DE VOLTA</p>
          <h2>Acesse sua central</h2>
          <p className="muted">Entre com suas credenciais para acompanhar os chamados.</p>

          <label>Usuário<div className="input-wrap"><Icon name="mail" size={18} /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Digite seu usuário" autoComplete="username" /></div></label>
          <label>Senha<div className="input-wrap"><Icon name="lock" size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password" /></div></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-row"><label className="remember"><input type="checkbox" /> Manter conectado</label><button className="text-button" type="button">Esqueci minha senha</button></div>
          <button className="primary-button" type="submit">Entrar na central <Icon name="arrow" size={18} /></button>
          <div className="demo-accounts"><strong>Acessos de demonstração</strong><span>Administrador: adm123 / adm123</span><span>Setores: ti123, suporte123, financeiro123 ou comercial123</span><span>A senha é igual ao nome do usuário.</span></div>
        </form>
      </section>
    </main>
  );
}

function Modal({ children, onClose, label, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-card ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </section>
    </div>
  );
}

function AttachmentList({ attachments = [], preview = false }) {
  if (!attachments.length) return <p className="no-attachments">Nenhum arquivo foi anexado a este chamado.</p>;

  return (
    <div className="attachment-list">
      {attachments.map((attachment) => (
        <a className={`attachment-item ${preview ? 'attachment-preview' : ''}`} href={attachment.url} target="_blank" rel="noreferrer" key={`${attachment.name}-${attachment.size}`}>
          {preview && attachment.type.startsWith('image/') ? <img src={attachment.url} alt={attachment.name} /> : preview && attachment.type.startsWith('video/') ? <video src={attachment.url} muted /> : <span className="attachment-icon"><Icon name={attachment.type.startsWith('video/') ? 'video' : 'image'} /></span>}
          <span><strong>{attachment.name}</strong><small>{(attachment.size / 1024 / 1024).toFixed(1)} MB · abrir arquivo</small></span>
        </a>
      ))}
    </div>
  );
}

function TicketDetailsModal({ ticket, onClose, onAssume, onFinish, onAddCollaborator, currentUser }) {
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorError, setCollaboratorError] = useState('');
  const isAssignedToCurrentUser = ticket.assignee?.username === currentUser.username;
  const isFinalized = ticket.status === 'Finalizado';

  function addCollaborator(event) {
    event.preventDefault();
    const name = collaboratorName.trim();
    if (!name) {
      setCollaboratorError('Informe o nome do colaborador.');
      return;
    }
    if ((ticket.collaborators || []).some((collaborator) => collaborator.toLowerCase() === name.toLowerCase())) {
      setCollaboratorError('Este colaborador já está no chamado.');
      return;
    }
    onAddCollaborator(ticket.id, name);
    setCollaboratorName('');
    setCollaboratorError('');
  }

  return (
    <Modal onClose={onClose} label={`Detalhes do chamado ${ticket.id}`}>
      <div className="modal-header">
        <div><div className="ticket-kicker"><span className={`priority-pill ${priorityClass[ticket.priority]}`}>{ticket.priority}</span><span>{ticket.id}</span><span>•</span><span>{ticket.status}</span></div><h2>{ticket.title}</h2></div>
        <button className="modal-close" onClick={onClose} aria-label="Fechar detalhes"><Icon name="close" /></button>
      </div>
      <div className="modal-body">
        <div className="detail-highlight"><span className="avatar large-avatar">{ticket.initials}</span><span><small>Solicitante</small><strong>{ticket.requester}</strong><span>{ticket.department}</span></span></div>
        <div className={`ownership-card ${ticket.assignee ? 'has-owner' : ''}`}>
          <span className="ownership-icon"><Icon name={ticket.assignee ? 'check' : 'user'} /></span>
          <span><small>Responsável pelo chamado</small><strong>{ticket.assignee?.name || 'Ninguém assumiu ainda'}</strong>{ticket.assignee && <span>{ticket.assignee.username === currentUser.username ? 'Assumido por você' : `Usuário: ${ticket.assignee.username}`}</span>}</span>
        </div>
        <div className="detail-grid">
          <div><small>Aberto em</small><strong>{ticket.openedAt}</strong></div>
          <div><small>Categoria</small><strong>{ticket.category}</strong></div>
          <div><small>Setor responsável</small><strong>{ticket.sector}</strong></div>
          <div><small>Prazo de atendimento</small><strong>{ticket.sla}</strong></div>
          <div><small>Status</small><strong>{ticket.status}</strong></div>
          {ticket.finishedAt && <div><small>Finalizado em</small><strong>{ticket.finishedAt}</strong></div>}
          {ticket.finalizedBy && <div><small>Finalizado por</small><strong>{ticket.finalizedBy.name}</strong></div>}
        </div>
        <div className="detail-section"><span className="detail-label">PROBLEMA INFORMADO</span><p>{ticket.description}</p></div>
        <div className="detail-section"><span className="detail-label">IMPACTO</span><p>{ticket.impact || 'Impacto ainda não informado pelo solicitante.'}</p></div>
        {ticket.resolution && <div className="detail-section resolution-detail"><span className="detail-label"><Icon name="check" size={15} /> COMO FOI CORRIGIDO</span><p>{ticket.resolution}</p><span className="resolution-author">Registrado por {ticket.finalizedBy?.name || 'usuário não identificado'}</span></div>}
        <div className="detail-section">
          <span className="detail-label"><Icon name="users" size={15} /> COLABORADORES</span>
          <p className="section-description">Adicione quem ajudou na análise ou na resolução deste chamado.</p>
          <form className="collaborator-form" onSubmit={addCollaborator}>
            <input value={collaboratorName} onChange={(event) => setCollaboratorName(event.target.value)} maxLength={80} placeholder="Nome do colaborador" aria-label="Nome do colaborador" />
            <button type="submit">+ Adicionar</button>
          </form>
          {collaboratorError && <p className="collaborator-error" role="alert">{collaboratorError}</p>}
          {(ticket.collaborators || []).length > 0 ? <div className="collaborator-list">{ticket.collaborators.map((collaborator) => <span className="collaborator-chip" key={collaborator}><Icon name="user" size={13} /> {collaborator}</span>)}</div> : <p className="no-collaborators">Nenhum colaborador adicionado.</p>}
        </div>
        <div className="detail-section"><span className="detail-label"><Icon name="paperclip" size={15} /> ANEXOS</span><AttachmentList attachments={ticket.attachments} preview /></div>
      </div>
      <div className="modal-footer">
        <button className="secondary-button" onClick={onClose}>Voltar para o quadro</button>
        {!ticket.assignee && <button className="primary-action" onClick={() => onAssume(ticket.id)}>Assumir chamado</button>}
        {ticket.assignee && !isFinalized && isAssignedToCurrentUser && <button className="primary-action finish-action" onClick={() => onFinish(ticket.id)}><Icon name="check" size={16} /> Finalizar chamado</button>}
        {ticket.assignee && !isFinalized && !isAssignedToCurrentUser && <button className="primary-action assigned-action" disabled><Icon name="user" size={16} /> Assumido por {ticket.assignee.name}</button>}
        {isFinalized && <button className="primary-action assigned-action" disabled><Icon name="check" size={16} /> Chamado finalizado</button>}
      </div>
    </Modal>
  );
}

function NewTicketModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ requester: '', department: '', sector: 'TI', title: '', description: '', impact: '' });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addAttachments(event) {
    const files = Array.from(event.target.files || []);
    const invalid = files.find((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'));
    const oversized = files.find((file) => file.size > 20 * 1024 * 1024);
    if (invalid || oversized || attachments.length + files.length > 5) {
      setError(invalid ? 'Envie somente imagens ou vídeos.' : oversized ? 'Cada arquivo pode ter no máximo 20 MB.' : 'Você pode anexar até 5 arquivos.');
      event.target.value = '';
      return;
    }
    setError('');
    setAttachments((current) => [...current, ...files.map((file) => ({ name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) }))]);
    event.target.value = '';
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.requester.trim() || !form.department.trim() || !form.title.trim() || !form.description.trim()) {
      setError('Preencha solicitante, setor de origem, assunto e descrição do problema.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate({ ...form, attachments });
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível abrir o chamado.');
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} label="Abrir novo chamado" wide>
      <div className="modal-header">
        <div><p className="eyebrow">NOVO CHAMADO</p><h2>Conte o que está acontecendo</h2><p className="modal-intro">Quanto mais detalhes você informar, mais precisa será a triagem feita pela IA.</p></div>
        <button className="modal-close" onClick={onClose} aria-label="Fechar formulário"><Icon name="close" /></button>
      </div>
      <form className="ticket-form" onSubmit={submit}>
        <div className="form-grid">
          <label>Nome do solicitante *<input value={form.requester} onChange={(event) => update('requester', event.target.value)} placeholder="Quem precisa de ajuda?" /></label>
          <label>Setor do solicitante *<input value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="Ex.: Recursos Humanos" /></label>
        </div>
        <label>Setor responsável *<select value={form.sector} onChange={(event) => update('sector', event.target.value)}>{sectors.map((sector) => <option value={sector} key={sector}>{sector}</option>)}</select><span className="field-help sector-help">Somente integrantes deste setor e administradores verão o chamado.</span></label>
        <label>Assunto do chamado *<input value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={200} placeholder="Resuma o problema em uma frase" /></label>
        <label>Descreva o problema *<textarea value={form.description} onChange={(event) => update('description', event.target.value)} maxLength={10000} rows={5} placeholder="Explique o que aconteceu, quando começou, o que você tentou fazer e qual mensagem de erro apareceu." /><span className="field-help">{form.description.length}/10.000 caracteres</span></label>
        <label>Qual é o impacto?<textarea value={form.impact} onChange={(event) => update('impact', event.target.value)} rows={3} placeholder="Ex.: toda a equipe está parada ou somente uma atividade foi afetada." /></label>
        <div className="upload-section">
          <div><strong>Fotos ou vídeos</strong><p>Opcional. Anexe até 5 arquivos de no máximo 20 MB cada.</p></div>
          <label className="upload-button"><Icon name="upload" size={18} /> Escolher arquivos<input type="file" accept="image/*,video/*" multiple onChange={addAttachments} /></label>
        </div>
        <AttachmentList attachments={attachments} />
        {error && <p className="form-error ticket-form-error" role="alert">{error}</p>}
        <div className="modal-footer form-footer"><button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button><button type="submit" className="primary-action" disabled={submitting}>{submitting ? 'Classificando com Gemini…' : 'Enviar para triagem'}</button></div>
      </form>
    </Modal>
  );
}

function FinalizeTicketModal({ ticket, currentUser, onClose, onConfirm }) {
  const [resolution, setResolution] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    if (resolution.trim().length < 10) {
      setError('Descreva com um pouco mais de detalhe como o problema foi corrigido.');
      return;
    }
    onConfirm(ticket.id, resolution.trim());
  }

  return (
    <Modal onClose={onClose} label={`Finalizar chamado ${ticket.id}`}>
      <div className="modal-header">
        <div><p className="eyebrow">FINALIZAR CHAMADO</p><h2>Como o problema foi corrigido?</h2><p className="modal-intro">Esse registro ficará visível no histórico para ajudar em atendimentos futuros.</p></div>
        <button className="modal-close" onClick={onClose} aria-label="Cancelar finalização"><Icon name="close" /></button>
      </div>
      <form className="resolution-form" onSubmit={submit}>
        <div className="finalizer-card"><span className="ownership-icon"><Icon name="user" /></span><span><small>Finalizado por</small><strong>{currentUser.name}</strong><span>{currentUser.username}</span></span></div>
        <div className="resolution-ticket"><span>{ticket.id}</span><strong>{ticket.title}</strong></div>
        <label>Descrição da solução *<textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows={6} maxLength={5000} autoFocus placeholder="Explique o que foi feito, qual era a causa e como você confirmou que voltou a funcionar." /><span className="field-help">{resolution.length}/5.000 caracteres</span></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-footer form-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-action finish-action"><Icon name="check" size={16} /> Confirmar finalização</button></div>
      </form>
    </Modal>
  );
}

function TicketCreatedModal({ result, onClose }) {
  const classificationClass = result.triageCompleted ? priorityClass[result.priority] : 'pending';

  return (
    <Modal onClose={onClose} label={`Chamado ${result.id} criado`}>
      <div className={`ticket-created-content ${classificationClass}`}>
        <span className="ticket-created-icon"><Icon name={result.triageCompleted ? 'check' : 'clock'} size={28} /></span>
        <p className="eyebrow">CHAMADO CRIADO</p>
        <h2>Seu chamado foi enviado com sucesso!</h2>
        <p className="ticket-created-id">Protocolo <strong>{result.id}</strong></p>

        {result.triageCompleted ? (
          <div className="ticket-created-classification">
            <span>
              <small>Prioridade definida pela IA</small>
              <strong className={`priority-pill ${priorityClass[result.priority]}`}>{result.priority}</strong>
            </span>
            <span>
              <small>Categoria</small>
              <strong>{result.category}</strong>
            </span>
            <span>
              <small>Setor responsável</small>
              <strong>{result.sector}</strong>
            </span>
          </div>
        ) : (
          <div className="ticket-created-pending">
            <strong>Classificação pendente</strong>
            <span>O chamado foi criado e enviado para {result.sector}, mas o Gemini não respondeu neste momento.</span>
          </div>
        )}

        <p className="ticket-created-help">Você já pode acompanhar o chamado no quadro.</p>
        <button type="button" className="primary-action ticket-created-button" onClick={onClose}>Ver todos os chamados</button>
      </div>
    </Modal>
  );
}

function TicketCard({ ticket, onOpen, onDragStart, onDragEnd }) {
  return (
    <article className={`ticket-card ${priorityClass[ticket.priority]}`} draggable onDragStart={(event) => onDragStart(event, ticket.id)} onDragEnd={onDragEnd} title="Arraste para mudar a etapa do chamado">
      <div className="priority-rail" />
      <div className="ticket-main">
        <div className="ticket-heading">
          <div>
            <div className="ticket-kicker"><span className={`priority-pill ${priorityClass[ticket.priority]}`}>{ticket.priority}</span><span>{ticket.id}</span><span>•</span><span>{ticket.time}</span></div>
            <h3>{ticket.title}</h3><span className="drag-hint">Arraste para mover</span>
          </div>
          <div className="open-ticket-action"><span>Ver detalhes</span><button className="round-button" onClick={() => onOpen(ticket)} aria-label={`Ver detalhes do chamado ${ticket.id}`} title="Ver informações completas"><Icon name="arrow" size={19} /></button></div>
        </div>
        <p className="ticket-description">{ticket.description}</p>
        <div className="ticket-footer">
          <div className="requester"><span className="avatar">{ticket.initials}</span><span><strong>{ticket.requester}</strong><small>{ticket.department}</small></span></div>
          <span className="category">{ticket.category}</span>
          <span className="sector-badge">{ticket.sector}</span>
          {ticket.assignee && <span className="assignee-badge"><Icon name="user" size={13} /> {ticket.assignee.name}</span>}
          <span className="sla"><Icon name="clock" size={15} /> {ticket.sla}</span>
        </div>
      </div>
    </article>
  );
}

function Dashboard({ user, onLogout }) {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('Todas');
  const [ticketItems, setTicketItems] = useState(tickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [ticketToFinalize, setTicketToFinalize] = useState(null);
  const [draggedTicketId, setDraggedTicketId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [creationNotice, setCreationNotice] = useState(null);
  const visibleTickets = useMemo(() => user.sector === 'TODOS' ? ticketItems : ticketItems.filter((ticket) => ticket.sector === user.sector), [ticketItems, user.sector]);
  const sortedTickets = useMemo(() => [...visibleTickets]
    .filter((ticket) => priority === 'Todas' || ticket.priority === priority)
    .filter((ticket) => `${ticket.id} ${ticket.title} ${ticket.requester}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.score - a.score), [query, priority, visibleTickets]);

  async function createTicket(data) {
    const triage = await createTicketWithTriage({ title: data.title.trim(), description: data.description.trim() });
    const words = data.requester.trim().split(/\s+/);
    const triageCompleted = triage.triageStatus === 'COMPLETED';
    const priority = triageCompleted ? priorityLabels[triage.suggestedPriority] : 'Média';
    const newTicket = {
      ...data,
      id: `HD-${triage.id.slice(0, 8).toUpperCase()}`,
      apiId: triage.id,
      priority,
      requester: data.requester.trim(),
      initials: words.slice(0, 2).map((word) => word[0]).join('').toUpperCase(),
      department: data.department.trim(),
      category: triageCompleted ? categoryLabels[triage.suggestedCategory] : 'Aguardando IA',
      time: 'Agora',
      sla: '8h restantes',
      score: triageCompleted ? priorityScores[triage.suggestedPriority] : 50,
      status: triageCompleted ? 'Aberto' : 'Aguardando triagem',
      openedAt: 'Agora mesmo',
      impact: data.impact.trim() || 'Impacto não informado.',
      assignee: null,
      collaborators: [],
    };
    setTicketItems((current) => [newTicket, ...current]);
    setCreatingTicket(false);
    setCreationNotice({ id: newTicket.id, sector: newTicket.sector, triageCompleted, priority: newTicket.priority, category: newTicket.category });
  }

  function assumeTicket(ticketId) {
    const assignee = { name: user.name, username: user.username };
    setTicketItems((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, assignee, status: 'Em atendimento' } : ticket));
    setSelectedTicket((current) => current?.id === ticketId ? { ...current, assignee, status: 'Em atendimento' } : current);
  }

  function addCollaborator(ticketId, collaborator) {
    setTicketItems((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, collaborators: [...(ticket.collaborators || []), collaborator] } : ticket));
    setSelectedTicket((current) => current?.id === ticketId ? { ...current, collaborators: [...(current.collaborators || []), collaborator] } : current);
  }

  function requestFinish(ticketId) {
    const ticket = ticketItems.find((item) => item.id === ticketId);
    if (!ticket || ticket.status === 'Finalizado') return;
    setSelectedTicket(null);
    setTicketToFinalize(ticket);
  }

  function finishTicket(ticketId, resolution) {
    const finishedAt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
    const finalizedBy = { name: user.name, username: user.username };
    const sourceTicket = ticketItems.find((ticket) => ticket.id === ticketId);
    if (!sourceTicket) return;
    const updatedTicket = { ...sourceTicket, status: 'Finalizado', finishedAt, finalizedBy, resolution, assignee: sourceTicket.assignee || finalizedBy };
    setTicketItems((current) => current.map((ticket) => ticket.id === ticketId ? updatedTicket : ticket));
    setTicketToFinalize(null);
    setSelectedTicket(updatedTicket);
  }

  function moveTicket(ticketId, targetColumn) {
    const ticket = ticketItems.find((item) => item.id === ticketId);
    if (!ticket) return;
    if (targetColumn === 'done') {
      requestFinish(ticketId);
      return;
    }
    if (targetColumn === 'running') {
      const assignee = ticket.assignee || { name: user.name, username: user.username };
      setTicketItems((current) => current.map((item) => item.id === ticketId ? { ...item, status: 'Em atendimento', assignee, finishedAt: null, finalizedBy: null, resolution: null } : item));
      return;
    }
    setTicketItems((current) => current.map((item) => item.id === ticketId ? { ...item, status: 'Aberto', assignee: null, finishedAt: null, finalizedBy: null, resolution: null } : item));
  }

  function startDragging(event, ticketId) {
    setDraggedTicketId(ticketId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', ticketId);
  }

  function dropTicket(event, targetColumn) {
    event.preventDefault();
    const ticketId = event.dataTransfer.getData('text/plain') || draggedTicketId;
    if (ticketId) moveTicket(ticketId, targetColumn);
    setDraggedTicketId(null);
    setDragOverColumn(null);
  }

  const kanbanColumns = [
    { key: 'open', title: 'Chamados', description: 'Aguardando atendimento', className: 'open-column', items: sortedTickets.filter((ticket) => ticket.status !== 'Em atendimento' && ticket.status !== 'Finalizado') },
    { key: 'running', title: 'Em execução', description: 'Sendo resolvidos agora', className: 'running-column', items: sortedTickets.filter((ticket) => ticket.status === 'Em atendimento') },
    { key: 'done', title: 'Finalizados', description: 'Atendimentos concluídos', className: 'done-column', items: sortedTickets.filter((ticket) => ticket.status === 'Finalizado') },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Icon name="spark" /></span> Clarity Desk</div>
        <nav aria-label="Navegação principal"><button className="nav-item active"><Icon name="inbox" size={18} /> Chamados <span className="nav-count">{visibleTickets.length}</span></button></nav>
        <div className="top-actions"><span className="current-sector">{user.sector === 'TODOS' ? 'Todos os setores' : user.sector}</span><button className="icon-button" aria-label="Notificações"><Icon name="bell" /></button><span className="user-avatar">{user.initials}</span><span className="user-info"><strong>{user.name}</strong><small>{user.role} · {user.username}</small></span><button className="icon-button logout-button" onClick={onLogout} aria-label="Sair"><Icon name="logout" /></button></div>
      </header>

      <main className="dashboard">
        <section className="page-header">
          <div><p className="eyebrow">CENTRAL DE ATENDIMENTO · {user.sector === 'TODOS' ? 'VISÃO GERAL' : user.sector}</p><h1>Olá, {user.name.split(' ')[0]}. <span>Vamos resolver?</span></h1><p className="muted">{user.sector === 'TODOS' ? 'Você está vendo os chamados de todos os setores.' : `Esta fila mostra somente os chamados destinados ao setor ${user.sector}.`}</p></div>
          <button className="new-ticket" onClick={() => setCreatingTicket(true)}>+ Novo chamado</button>
        </section>

        <section className="summary-grid" aria-label="Resumo dos chamados">
          <div className="summary-card"><span className="summary-label">Total no quadro</span><strong>{visibleTickets.length}</strong><small>chamados do seu acesso</small></div>
          <div className="summary-card critical-summary"><span className="summary-label">Atenção imediata</span><strong>{visibleTickets.filter((ticket) => ticket.priority === 'Crítica' && ticket.status !== 'Finalizado').length}</strong><small>chamado crítico ativo</small></div>
          <div className="summary-card"><span className="summary-label">Dentro do SLA</span><strong>92%</strong><small>nos últimos 30 dias</small></div>
          <div className="summary-card ai-summary"><Icon name="spark" /><span><span className="summary-label">Triagem Gemini</span><strong>{visibleTickets.filter((ticket) => ticket.status !== 'Aguardando triagem').length} de {visibleTickets.length}</strong><small>chamados classificados</small></span></div>
        </section>

        <section className="queue-section">
          <div className="queue-title"><div><h2>Quadro de chamados</h2><p>Arraste os cartões entre as etapas ou use a seta para abrir todas as informações.</p></div><span className="ai-badge"><Icon name="spark" size={15} /> Priorizado por IA</span></div>
          <div className="toolbar">
            <div className="search-box"><Icon name="search" size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por chamado, assunto ou solicitante" /></div>
            <label className="select-wrap"><Icon name="filter" size={18} /><select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filtrar por prioridade"><option>Todas</option><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          </div>
          <div className="kanban-board">
            {kanbanColumns.map((column) => <section className={`kanban-column ${column.className} ${dragOverColumn === column.key ? 'drag-over' : ''}`} key={column.key} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverColumn(column.key); }} onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget) && setDragOverColumn(null)} onDrop={(event) => dropTicket(event, column.key)}>
              <div className="kanban-column-header"><span className="column-dot" /><div><h3>{column.title}</h3><p>{column.description}</p></div><span className="column-count">{column.items.length}</span></div>
              <div className="kanban-column-list">
                {column.items.map((ticket) => <TicketCard ticket={ticket} onOpen={setSelectedTicket} onDragStart={startDragging} onDragEnd={() => { setDraggedTicketId(null); setDragOverColumn(null); }} key={ticket.id} />)}
                {!column.items.length && <div className="kanban-empty"><span><Icon name="inbox" size={18} /></span><p>Nenhum chamado nesta etapa.</p></div>}
              </div>
            </section>)}
          </div>
        </section>
      </main>
      {selectedTicket && <TicketDetailsModal ticket={selectedTicket} currentUser={user} onAssume={assumeTicket} onFinish={requestFinish} onAddCollaborator={addCollaborator} onClose={() => setSelectedTicket(null)} />}
      {creatingTicket && <NewTicketModal onClose={() => setCreatingTicket(false)} onCreate={createTicket} />}
      {creationNotice && <TicketCreatedModal result={creationNotice} onClose={() => setCreationNotice(null)} />}
      {ticketToFinalize && <FinalizeTicketModal ticket={ticketToFinalize} currentUser={user} onClose={() => setTicketToFinalize(null)} onConfirm={finishTicket} />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  return user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Login onLogin={setUser} />;
}
