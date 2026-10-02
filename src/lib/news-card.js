// 新闻卡片渲染（入口页与板块页共用，由 Astro 打包进内联 script）
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false });
  } catch (e) {
    return iso;
  }
}

function pad(n) {
  return (n < 10 ? '0' : '') + n;
}

// 双语新闻卡片：中文标题+总结+解读，英文原标题/原摘要小字
export function newsCard(it) {
  var thumb = it.image
    ? '<div class="thumb"><img loading="lazy" src="' + esc(it.image) + '" alt="" /></div>'
    : '';
  var enTitle = it.en_title && it.en_title !== it.zh_title
    ? '<div class="en-title">' + esc(it.en_title) + '</div>'
    : '';
  var take = it.zh_take
    ? '<div class="take"><b>解读</b>' + esc(it.zh_take) + '</div>'
    : '';
  var enSum = it.en_summary
    ? '<p class="en-sum">' + esc(it.en_summary) + '</p>'
    : '';
  var zhSummary = it.zh_summary || it.summary || '';
  return (
    '<a class="news-card" href="' + esc(it.link) + '" target="_blank" rel="noreferrer noopener">' +
    thumb +
    '<div class="card-body">' +
    '<h3>' + esc(it.zh_title || it.title) + '</h3>' +
    enTitle +
    '<div class="news-meta">' +
    esc(it.published ? fmtTime(it.published) : '') +
    '<span class="src">' + esc(it.source || '') + '</span></div>' +
    (zhSummary ? '<p>' + esc(zhSummary) + '</p>' : '') +
    take +
    enSum +
    '</div></a>'
  );
}

// 入口页板块卡片：编号 / 名称 / 条数 / 最新 3 条标题
export function hubCard(ix, meta, c, href) {
  var items = (c && c.items) || [];
  var tops = items
    .slice(0, 3)
    .map(function (it) {
      return '<li>' + esc(it.zh_title || it.title) + '</li>';
    })
    .join('');
  return (
    '<a class="hub-card" href="' + href + '">' +
    '<div class="hub-ix">' + pad(ix + 1) + '</div>' +
    '<div class="hub-main">' +
    '<div class="hub-title">' + esc(meta.label) + '<span class="count">' + items.length + ' 条</span></div>' +
    '<div class="hub-desc">' + esc(meta.desc) + '</div>' +
    (tops ? '<ul class="hub-tops">' + tops + '</ul>' : '') +
    '</div>' +
    '<div class="hub-arrow" aria-hidden="true">→</div>' +
    '</a>'
  );
}
