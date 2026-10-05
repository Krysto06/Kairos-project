function vPerso(){
  return h('section',{class:'view grid gap-5','data-c':'pro'},
    secHead('Perso','Ton plan glow up, ton kit nails et les travaux de la maison. Les dates en rouge sont dépassées.'),
    h('div',{class:'grid gap-5 lg:grid-cols-2'},vList('glow'),h('div',{class:'grid gap-5 content-start'},vList('nails'),vList('bizi'))));
}
