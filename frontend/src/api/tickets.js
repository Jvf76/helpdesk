export async function createTicketWithTriage({ title, description }) {
  let response;
  try {
    response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ title, description }),
    });
  } catch {
    throw new Error('O backend não está disponível. Inicie a API na porta 8080 e tente novamente.');
  }

  if (!response.ok) {
    throw new Error(response.status === 400
      ? 'Revise o assunto e a descrição do chamado.'
      : 'Não foi possível criar o chamado no servidor.');
  }

  return response.json();
}
