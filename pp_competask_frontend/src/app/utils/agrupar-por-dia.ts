export interface GrupoDia<T> {
  chave: string;
  titulo: string;
  itens: T[];
}

export function identificarGrupoDia<T>(_indice: number, grupo: GrupoDia<T>): string {
  return grupo.chave;
}

export function chaveDoDia(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

export function agruparPorDia<T>(
  itens: T[],
  obterData: (item: T) => Date | null,
  ordem: 'asc' | 'desc',
): GrupoDia<T>[] {
  const grupos = new Map<string, GrupoDia<T>>();

  for (const item of itens) {
    const data = obterData(item);
    const valida = data && !Number.isNaN(data.getTime());
    const chave = valida ? chaveDoDia(data) : '';
    let grupo = grupos.get(chave);
    if (!grupo) {
      grupo = {
        chave,
        titulo: valida ? data.toLocaleDateString('pt-BR') : 'Sem data',
        itens: [],
      };
      grupos.set(chave, grupo);
    }
    grupo.itens.push(item);
  }

  return [...grupos.values()].sort((a, b) => {
    if (!a.chave) return 1;
    if (!b.chave) return -1;
    return ordem === 'asc' ? a.chave.localeCompare(b.chave) : b.chave.localeCompare(a.chave);
  });
}

export function agruparPorMes<T>(itens: T[], obterData: (item: T) => Date | null, mesVisivel: Date): GrupoDia<T>[] {
  const porDia = new Map(agruparPorDia(itens, obterData, 'asc').map((grupo) => [grupo.chave, grupo]));
  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate();
  const grupos: GrupoDia<T>[] = [];
  for (let dia = 1; dia <= quantidadeDias; dia++) {
    const data = new Date(ano, mes, dia);
    const chave = chaveDoDia(data);
    grupos.push(porDia.get(chave) ?? { chave, titulo: data.toLocaleDateString('pt-BR'), itens: [] });
  }
  const semData = porDia.get('');
  if (semData) grupos.push(semData);
  return grupos;
}
