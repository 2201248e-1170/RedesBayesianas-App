"""Prueba opcional de la interfaz en un navegador real (requiere: pip install playwright && playwright install chromium).
Uso: python3 tests/ui-smoke.py"""
import pathlib, sys
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
fallos = []
def check(cond, msg):
    print(('  ✓ ' if cond else '  ✗ ') + msg)
    if not cond: fallos.append(msg)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1100, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + str(root / 'index.html'))
    pg.wait_for_timeout(600)
    check(pg.evaluate('typeof cytoscape') == 'function', 'Cytoscape cargado')
    check(pg.locator('#cy canvas').count() > 0, 'el grafo se dibuja')
    pg.locator('#variables input[type=checkbox]').nth(0).check()
    pg.locator('#variables select').nth(2).select_option('mojado')
    pg.click('#btn-ejecutar')
    txt = pg.inner_text('#resultado')
    check('0.357688' in txt and '0.448380' in txt, 'P(Lluvia=sí | Pasto=mojado) = 0.357688, P(e) = 0.448380')
    check('Verificación' in txt and '✓' in txt, 'la verificación con enumeración coincide')
    pg.locator('#variables input[type=checkbox]').nth(0).uncheck()
    pg.click('#btn-ejecutar')
    check('al menos una' in pg.inner_text('#mensajes'), 'sin variable de consulta → mensaje de error')
    pg.click('#t-editor'); pg.fill('#editor', '{"nodes":[]}'); pg.click('#btn-aplicar')
    check('entre 3 y 10' in pg.inner_text('#mensajes'), 'red inválida desde el editor → se rechaza')
    check(not errs, 'sin errores de JavaScript en la página')
    b.close()
sys.exit(1 if fallos else 0)
