export function centralizarAbaSelecionada(obterAbas: () => HTMLElement | undefined): void {
  requestAnimationFrame(() => {
    const abas = obterAbas();
    const selecionada = abas?.querySelector<HTMLElement>('button[aria-pressed="true"]');
    if (abas && selecionada) {
      const area = abas.getBoundingClientRect();
      const botao = selecionada.getBoundingClientRect();
      abas.scrollLeft += botao.left - area.left - (area.width - botao.width) / 2;
    }
  });
}
