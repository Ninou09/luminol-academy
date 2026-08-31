from pathlib import Path
import runpy

path = Path('.github/scripts/apply-enquiry-programme-filter.py')
text = path.read_text()
old = '        3,\n        "campaign/landing/school programme scope",'
new = '        4,\n        "campaign/landing/school programme scope",'
if text.count(old) != 1:
    raise SystemExit('programme scope expected-count marker not found exactly once')
path.write_text(text.replace(old, new, 1))
runpy.run_path(str(path), run_name='__main__')
