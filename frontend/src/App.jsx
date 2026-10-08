import { useMemo, useState } from 'react';

const tickets = [
  {
    id: 'HD-1048',
    title: 'Sistema de pagamentos indisponível',
    description: 'A equipe financeira não consegue processar pagamentos desde as 08:42.',
    priority: 'Crítica',
    requester: 'Marina Costa',
    initials: 'MC',
    department: 'Financeiro',
    category: 'Indisponibilidade',
    time: 'Há 12 min',
    sla: '18 min restantes',
    score: 100,
  },
  {
    id: 'HD-1045',
    title: 'Acesso bloqueado ao painel comercial',
    description: 'Usuários do time comercial recebem erro de permissão após o login.',
    priority: 'Alta',
    requester: 'Rafael Lima',
    initials: 'RL',
    department: 'Comercial',
    category: 'Acesso',
    time: 'Há 34 min',
    sla: '1h 26min restantes',
    score: 80,
  },
  {
    id: 'HD-1041',
    title: 'Notebook reiniciando durante reuniões',
    description: 'O equipamento reinicia ao compartilhar a tela em chamadas de vídeo.',
    priority: 'Alta',
    requester: 'Bianca Rocha',
    initials: 'BR',
    department: 'Pessoas',
    category: 'Equipamento',
    time: 'Há 1h',
    sla: '2h 04min restantes',
    score: 80,
  },
  {
    id: 'HD-1039',
    title: 'Erro ao exportar relatório mensal',
    description: 'O arquivo gerado fica em branco quando o período contém mais de 30 dias.',
    priority: 'Média',
    requester: 'Caio Martins',
    initials: 'CM',
    department: 'Operações',
    category: 'Relatórios',
    time: 'Há 2h',
    sla: '5h 12min restantes',
    score: 50,
  },
  {
    id: 'HD-1034',
    title: 'Solicitação de instalação do Figma',
    description: 'Novo integrante precisa do aplicativo para iniciar as atividades de design.',
    priority: 'Baixa',
    requester: 'Lucas Neves',
    initials: 'LN',
    department: 'Produto',
    category: 'Software',
    time: 'Ontem, 16:20',
    sla: '1 dia restante',
    score: 20,
  },
];

const priorityClass = {
  Crítica: 'critical',
  Alta: 'high',
  Média: 'medium',
  Baixa: 'low',
};

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
    if (username !== 'adm123' || password !== 'adm123') {
      setError('Usuário ou senha incorretos.');
      return;
    }
    setError('');
    onLogin(username);
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
          <p className="demo-tip">Acesso de demonstração: adm123 / adm123</p>
        </form>
      </section>
    </main>
  );
}

function TicketCard({ ticket }) {
  return (
    <article className={`ticket-card ${priorityClass[ticket.priority]}`}>
      <div className="priority-rail" />
      <div className="ticket-main">
        <div className="ticket-heading">
          <div>
            <div className="ticket-kicker"><span className={`priority-pill ${priorityClass[ticket.priority]}`}>{ticket.priority}</span><span>{ticket.id}</span><span>•</span><span>{ticket.time}</span></div>
            <h3>{ticket.title}</h3>
          </div>
          <button className="round-button" aria-label={`Abrir chamado ${ticket.id}`}><Icon name="arrow" size={19} /></button>
        </div>
        <p className="ticket-description">{ticket.description}</p>
        <div className="ticket-footer">
          <div className="requester"><span className="avatar">{ticket.initials}</span><span><strong>{ticket.requester}</strong><small>{ticket.department}</small></span></div>
          <span className="category">{ticket.category}</span>
          <span className="sla"><Icon name="clock" size={15} /> {ticket.sla}</span>
        </div>
      </div>
    </article>
  );
}

function Dashboard({ username, onLogout }) {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('Todas');
  const sortedTickets = useMemo(() => tickets
    .filter((ticket) => priority === 'Todas' || ticket.priority === priority)
    .filter((ticket) => `${ticket.id} ${ticket.title} ${ticket.requester}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.score - a.score), [query, priority]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Icon name="spark" /></span> Clarity Desk</div>
        <nav aria-label="Navegação principal"><button className="nav-item active"><Icon name="inbox" size={18} /> Chamados <span className="nav-count">5</span></button></nav>
        <div className="top-actions"><button className="icon-button" aria-label="Notificações"><Icon name="bell" /></button><span className="user-avatar">AD</span><span className="user-info"><strong>Administrador</strong><small>{username}</small></span><button className="icon-button logout-button" onClick={onLogout} aria-label="Sair"><Icon name="logout" /></button></div>
      </header>

      <main className="dashboard">
        <section className="page-header">
          <div><p className="eyebrow">CENTRAL DE ATENDIMENTO</p><h1>Olá, João. <span>Vamos resolver?</span></h1><p className="muted">A IA já organizou sua fila. Comece pelos chamados que mais precisam de atenção.</p></div>
          <button className="new-ticket">+ Novo chamado</button>
        </section>

        <section className="summary-grid" aria-label="Resumo dos chamados">
          <div className="summary-card"><span className="summary-label">Fila total</span><strong>5</strong><small>chamados abertos</small></div>
          <div className="summary-card critical-summary"><span className="summary-label">Atenção imediata</span><strong>1</strong><small>chamado crítico</small></div>
          <div className="summary-card"><span className="summary-label">Dentro do SLA</span><strong>92%</strong><small>nos últimos 30 dias</small></div>
          <div className="summary-card ai-summary"><Icon name="spark" /><span><span className="summary-label">Triagem Gemini</span><strong>5 de 5</strong><small>chamados classificados</small></span></div>
        </section>

        <section className="queue-section">
          <div className="queue-title"><div><h2>Fila priorizada</h2><p>A ordem é definida por impacto, urgência e prazo de atendimento.</p></div><span className="ai-badge"><Icon name="spark" size={15} /> Ordenada por IA</span></div>
          <div className="toolbar">
            <div className="search-box"><Icon name="search" size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por chamado, assunto ou solicitante" /></div>
            <label className="select-wrap"><Icon name="filter" size={18} /><select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filtrar por prioridade"><option>Todas</option><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          </div>
          <div className="ticket-list">
            {sortedTickets.map((ticket) => <TicketCard ticket={ticket} key={ticket.id} />)}
            {!sortedTickets.length && <div className="empty-state"><Icon name="search" /><h3>Nenhum chamado encontrado</h3><p>Tente buscar por outro termo ou remover o filtro.</p></div>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  return user ? <Dashboard username={user} onLogout={() => setUser(null)} /> : <Login onLogin={setUser} />;
}
