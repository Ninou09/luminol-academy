from pathlib import Path
import runpy

path = Path('.github/scripts/apply-enquiry-programme-filter.py')
text = path.read_text()
label = '        "campaign/landing/school programme scope",'
label_index = text.find(label)
if label_index < 0:
    raise SystemExit('programme scope label marker not found')

prefix = text[:label_index]
suffix = text[label_index:]
target = (
    '        "                      activeDeliveryPreference,\\n"\n'
    '        "                      activeTimingPreference,\\n"\n'
)
replacement = (
    '        "                      activeContactPreference,\\n"\n'
    '        "                      activeDeliveryPreference,\\n"\n'
    '        "                      activeTimingPreference,\\n"\n'
)
parts = prefix.rsplit(target, 2)
if len(parts) != 3:
    raise SystemExit('programme scope tail markers not found exactly twice before label')
text = parts[0] + replacement + parts[1] + replacement + parts[2] + suffix
path.write_text(text)
runpy.run_path(str(path), run_name='__main__')
