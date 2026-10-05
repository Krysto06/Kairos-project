const rgb = v => `rgb(var(--${v}) / <alpha-value>)`;
tailwind.config = {
  theme:{ extend:{
    colors:{ bg:rgb('bg'), surface:rgb('surface'), ink:rgb('ink'), muted:rgb('muted'), line:rgb('line'), soft:rgb('soft'),
      c:rgb('c'), ci:rgb('ci'), me:rgb('me'), 'me-ink':rgb('me-ink'), edu:rgb('edu'), 'edu-ink':rgb('edu-ink'), fin:rgb('fin'), 'fin-ink':rgb('fin-ink'),
      sk:rgb('sk'), 'sk-ink':rgb('sk-ink'), sty:rgb('sty'), 'sty-ink':rgb('sty-ink'), pro:rgb('pro'), 'pro-ink':rgb('pro-ink'),
      gold:rgb('gold'), warn:rgb('warn'), btn:rgb('btn'), btnink:rgb('btnink') },
    fontFamily:{ display:['"Bricolage Grotesque"','ui-sans-serif','system-ui','sans-serif'], body:['Figtree','ui-sans-serif','system-ui','sans-serif'], mono:['"JetBrains Mono"','ui-monospace','Menlo','monospace'] },
    boxShadow:{ soft:'0 1px 2px rgb(var(--ink) / .04), 0 12px 32px -14px rgb(var(--ink) / .18)', lift:'0 2px 4px rgb(var(--ink) / .05), 0 18px 40px -16px rgb(var(--ink) / .28)' }
  }}
};
