const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export function money(n, currency) {
  const s = nf.format(Math.round(n || 0));
  return currency === '$' ? '$' + s : s + ' ' + currency;
}
export const percent = p => Math.round((p || 0) * 100) + ' %';
export const longDate = d => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
export const monthYear = d => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d);
