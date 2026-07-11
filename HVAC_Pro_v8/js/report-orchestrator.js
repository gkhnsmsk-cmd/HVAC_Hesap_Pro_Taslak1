// Gsem Mep Pro — Rapor Orkestratörü (report-orchestrator.js)
// Kapak + İçindekiler + anlatım bölümleri + EKLER (disiplin cetvelleri) -> tek rapor HTML.
// SAF (DOM'suz) — headless test edilebilir. "Rapor Al" bunu çağırır, sonucu yazdırır.
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function styleBlock() {
    return '<style>'
      + 'body{font-family:"Times New Roman",serif;font-size:11pt;color:#111;margin:0;}'
      + '.gm-cover{height:60vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-bottom:3px solid #003366;}'
      + '.gm-brand{font-family:Arial,sans-serif;font-size:30pt;font-weight:bold;color:#003366;letter-spacing:2px;}'
      + '.gm-proj{font-size:20pt;margin-top:24px;}.gm-sub{font-size:14pt;color:#333;margin-top:8px;}.gm-date{margin-top:16px;color:#666;}'
      + '.gm-h1{font-family:Arial,sans-serif;font-size:15pt;font-weight:bold;color:#003366;border-bottom:2px solid #003366;padding-bottom:4px;margin:14px 0 10px;}'
      + '.gm-h2{font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;color:#003366;margin:14px 0 6px;}'
      + '.gm-p{text-align:justify;line-height:1.5;margin:6px 0;}'
      + '.gm-toc td{padding:4px 0;border-bottom:1px dotted #ccc;font-size:11pt;}'
      + '.page-break{page-break-before:always;}'
      + '</style>';
  }

  // narrative: [{no,title,text}], appendices: [{title, html}]
  function buildReportHtml(project, narrative, appendices) {
    project = project || {}; narrative = narrative || []; appendices = appendices || [];
    var h = '<div class="gm-cover">'
      + '<div class="gm-brand">Gsem Mep Pro</div>'
      + '<div class="gm-proj">' + esc(project.proje_adi || '—') + '</div>'
      + '<div class="gm-sub">Mekanik Tesisat Hesap Raporu</div>'
      + '<div class="gm-date">' + esc(project.sehir || '') + (project.sehir && project.tarih ? ' · ' : '') + esc(project.tarih || '') + '</div>'
      + '</div>';

    h += '<div class="page-break"></div><div class="gm-h1">İÇİNDEKİLER</div><table class="gm-toc" style="width:100%;border-collapse:collapse;">';
    narrative.forEach(function (s) { h += '<tr><td>' + esc(s.no) + '. ' + esc(s.title) + '</td></tr>'; });
    appendices.forEach(function (a, i) { h += '<tr><td>EK-' + (i + 1) + ': ' + esc(a.title) + '</td></tr>'; });
    h += '</table>';

    h += '<div class="page-break"></div><div class="gm-h1">MEKANİK TESİSAT TEKNİK RAPORU</div>';
    narrative.forEach(function (s) {
      h += '<div class="gm-h2">' + esc(s.no) + '. ' + esc(s.title) + '</div>';
      String(s.text || '').split(/\n{2,}|\r\n\r\n/).forEach(function (p) {
        if (p.trim()) h += '<p class="gm-p">' + esc(p.trim()) + '</p>';
      });
    });

    appendices.forEach(function (a, i) {
      h += '<div class="page-break"></div><div class="gm-h1">EK-' + (i + 1) + ': ' + esc(a.title) + '</div>';
      h += (a.html || '');
    });
    return h;
  }

  // Tam yazdırılabilir belge (stil + gövde)
  function buildFullDoc(project, narrative, appendices) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Gsem Mep Pro — '
      + esc((project && project.proje_adi) || 'Rapor') + '</title>' + styleBlock()
      + '</head><body>' + buildReportHtml(project, narrative, appendices) + '</body></html>';
  }

  var api = { buildReportHtml: buildReportHtml, buildFullDoc: buildFullDoc, styleBlock: styleBlock };
  if (typeof window !== 'undefined') window.ReportOrchestrator = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
