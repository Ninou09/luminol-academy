from pathlib import Path

path = Path('apps/admin/app/enquiries/page.tsx')
text = path.read_text()
old = '''                        activeAttention,
                      )}'''
new = '''                        activeAttention,
                        activeOwner,
                      )}'''
count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected one status-link owner anchor, found {count}')
path.write_text(text.replace(old, new, 1))
