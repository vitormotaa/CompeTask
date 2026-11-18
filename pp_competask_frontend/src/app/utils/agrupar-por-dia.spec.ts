import { agruparPorDia } from './agrupar-por-dia';

describe('agruparPorDia', () => {
  const itens = [
    { nome: 'primeiro', data: new Date(2026, 10, 18, 8) },
    { nome: 'outro dia', data: new Date(2026, 10, 17, 23) },
    { nome: 'segundo', data: new Date(2026, 10, 18, 20) },
    { nome: 'sem data', data: null },
    { nome: 'data inválida', data: new Date('inválida') },
  ];

  it('agrupa por data local e mantém a ordem dos itens dentro do dia', () => {
    const grupos = agruparPorDia(itens, (item) => item.data, 'asc');
    expect(grupos.map((grupo) => grupo.titulo)).toEqual(['17/11/2026', '18/11/2026', 'Sem data']);
    expect(grupos[1].itens.map((item) => item.nome)).toEqual(['primeiro', 'segundo']);
    expect(grupos[2].itens.length).toBe(2);
  });

  it('ordena os dias de notificações do mais recente ao mais antigo', () => {
    const grupos = agruparPorDia(itens, (item) => item.data, 'desc');
    expect(grupos.map((grupo) => grupo.chave)).toEqual(['2026-11-18', '2026-11-17', '']);
  });
});
