/* The issue the Riffle direction turns through: seven pages of a 1990s
   magazine on uncoated, slightly mottled stock. A photo spread of the 1607
   book, the 1607 page typeset, the feature, the first definition city by
   city, Ricci's road, the point, and the back cover. */

import { $$, applyLang, coord, jihe, type Core } from './core';
import { DEFS, PICTURES, ROUTE, SAN_FRANCISCO, SPREAD_ALT } from './data';
import { atlasMark } from './furniture';
import type { PageSpec } from './sheet';

const page = (html: () => string, cls = 'mze-paper'): PageSpec => ({ html, cls, finish: 'matte', mottle: true });

export function editorialPages(core: Core): PageSpec[] {
  const { issue } = core;
  const [la, lo] = coord.site(SAN_FRANCISCO.lat, SAN_FRANCISCO.lon);
  const month = issue.date.replace(/ \d+,/, '');
  return [
    page(
      () => `<div class="mze"><i class="mze-scan"></i>
        <figure class="mze-photo"><img alt="${SPREAD_ALT}" src="${PICTURES.spread}"><i></i></figure>
        <div class="mze-cred">
          <p class="sm"><i>This Page:</i> <span class="zh" lang="zh-Hant">幾何原本</span>, Book I, by <b>Ricci</b> and <b>Xu</b>, Beijing, 1607 • Woodblock print on paper • <i>Story:</i> ${issue.title}, by <b>General Translation</b>.</p>
          <p class="lg">Greek <b>Euclid</b> • Latin <b>Clavius</b> • Voice <b>Matteo Ricci</b> • Brush <b>Xu Guangqi</b></p>
        </div>
        <p class="mze-folio"><b>37</b><span>Atlas</span><span>${month}</span></p></div><i class="grain"></i>`
    ),
    page(() => `<div class="mze-jp">${jihe('Book I, first page · typeset after the Beijing edition of 1607')}</div>`, 'mze-aged'),
    page(
      () => `<div class="mze"><div class="mze-in">
        <p class="mze-kick">Translation</p>
        <h2 class="mze-h1"></h2>
        <p class="mze-dek">Nearly two thousand years after Euclid, a Jesuit and a Ming scholar translated the Elements by talking it through.</p>
        <p class="mze-by">Words <b>General Translation</b> · ${issue.minutes} min read</p>
        <div class="mze-body">
          <p>Matteo Ricci carried a Latin edition of Euclid for nineteen years as he worked his way inland from Macau. It was edited by his old teacher in Rome, Christopher Clavius. In Nanjing he met Xu Guangqi, a scholar-official who would join the Hanlin Academy.</p>
          <p>In the autumn of 1606 the two began to translate. Ricci could not write literary Chinese, and Xu could not read Latin. So Ricci explained each passage aloud, and Xu wrote it down in classical Chinese. They went through the first six books three times, and published them in 1607 as <span class="zh" lang="zh-Hant">幾何原本</span>.</p>
        </div></div><p class="mze-folio rt"><b>39</b></p></div><i class="grain"></i>`
    ),
    page(
      () => `<div class="mze"><div class="mze-in l">
        <p class="mze-kick">Definition I</p>
        <h3 class="mze-h2">The first definition, city by city</h3>
        <p class="mze-sub">Euclid’s first definition in the five languages that carried the Elements, at the city and the year of each version.</p>
        <ol class="mze-defs">${DEFS.map((d, i) => `<li><span class="n">${i + 1}</span><q lang="${d.code}" dir="${d.dir}">${d.text}</q><small><b>${d.city}</b>${d.year}</small></li>`).join('')}</ol>
      </div><p class="mze-folio"><b>40</b></p></div><i class="grain"></i>`
    ),
    page(
      () => `<div class="mze"><div class="mze-in">
        <p class="mze-kick">Journey to Peking</p>
        <h3 class="mze-h2">Nineteen years, six cities</h3>
        <p class="mze-sub">Ricci’s road from the Portuguese post at Macau, inland city by city, to the capital.</p>
        <ol class="mze-route">${ROUTE.map((c) => `<li><b>${c.year}</b><span>${c.name}</span><span class="zh" lang="zh-Hant">${c.zh}</span><span class="km">${Math.round(c.km).toLocaleString('en-US')} km</span></li>`).join('')}</ol>
        <p class="mze-note">Distances are straight-line legs between the cities, added up.</p>
        <div class="mze-read"><a href="${issue.href}">Read the story →</a><p>General Translation<br>${issue.date}</p></div>
      </div><p class="mze-folio rt"><b>41</b></p></div><i class="grain"></i>`
    ),
    page(
      () => `<div class="mze"><i class="mze-dot" aria-hidden="true"></i>
        <div class="mze-pt"><p class="mze-kick">Definition I</p><p class="mze-ptx">A point is that which has no part.</p><p class="mze-ptz" lang="zh-Hant">點者，無分。</p></div>
        <p class="mze-folio"><b>42</b></p></div><i class="grain"></i>`
    ),
    page(
      () => `<div class="mze"><div class="mze-back">
        <div class="mk">${atlasMark('var(--paper)')}<p><b>Atlas</b><span>A press by General Translation</span></p></div>
        <p class="co">No. 01 · ${month}<br>${la}<br>${lo}</p>
      </div></div><i class="grain"></i>`
    ),
  ];
}

/** Sets the feature's headline in the title language, on the pages and on every strip cut from them. */
export function fillTitle(root: HTMLElement, core: Core) {
  const l = core.L();
  $$('.mze-h1', root).forEach((h) => {
    applyLang(h, l);
    h.textContent = l.title;
    h.toggleAttribute('data-long', l.title.length > 57 && l.script === 'latn');
  });
}
