from pathlib import Path

root = Path('dist')
icons = {
    'overview':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    'returns':'<path d="M8 5H5v16h14V5h-3"/><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 11h8M8 15h8"/>',
    'receiving':'<path d="M12 3v11m-4-4 4 4 4-4M4 15v6h16v-6"/>',
    'exceptions':'<path d="m12 3 10 18H2L12 3zM12 9v5M12 17v.1"/>',
    'insights':'<path d="M3 3v18h18M7 17v-5M12 17V8M17 17V5"/>'
}
def svg(name):
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>'

p=root/'demo.html'
s=p.read_text(encoding='utf-8')
start=s.index('<a class="brand')
end=s.index('</a>',start)+4
s=s[:start]+'<a class="brand site-product-logo" href="#overview" aria-label="HPE ReVolve overview"><img class="brand-wordmark" src="assets/hpe-logo.svg" alt="HPE"><span class="product-lockup"><strong>ReVolve</strong><small>Concept prototype</small></span></a>'+s[end:]
for route,glyph in [('overview','◫'),('returns','▤'),('receiving','↓'),('exceptions','⚑'),('insights','↗')]:
    s=s.replace('data-page="'+route+'">'+glyph,'data-page="'+route+'">'+svg(route))
p.write_text(s,encoding='utf-8')

# Version all shared styles so previously opened pages fetch the site-wide theme.
for name in ['index.html','landing.html','demo.html']:
    p=root/name
    s=p.read_text(encoding='utf-8')
    import re
    s=re.sub(r'href="(brand|style|help|landing|animation)\.css(?:\?[^\"]*)?"',r'href="\1.css?v=hpe-site-2"',s)
    p.write_text(s,encoding='utf-8')

# Matching line icons on all four dashboard / insights metric cards.
p=root/'app.js'
s=p.read_text(encoding='utf-8')
prefix="function metricIcon(symbol){const paths="+repr({'▤':icons['returns'],'⚑':icons['exceptions'],'↗':'<path d="M5 19 19 5M5 5h14v14"/>','✓':'<path d="m4 12 5 5L20 6"/>'}).replace("'",'"')+";return '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">'+(paths[symbol]||paths['▤'])+'</svg>';}\n"
# Use JSON serialization rather than rewriting quote characters inside SVG paths.
import json
paths={'▤':icons['returns'],'⚑':icons['exceptions'],'↗':'<path d="M5 19 19 5M5 5h14v14"/>','✓':'<path d="m4 12 5 5L20 6"/>'}
prefix="function metricIcon(symbol){const paths="+json.dumps(paths,ensure_ascii=False)+";return '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">'+(paths[symbol]||paths['▤'])+'</svg>';}\n"
if 'function metricIcon' not in s:
    s=s.replace("'use strict';\n","'use strict';\n"+prefix,1)
s=s.replace('<span class="metric-icon">${i}</span>','<span class="metric-icon">${metricIcon(i)}</span>')
p.write_text(s,encoding='utf-8')
