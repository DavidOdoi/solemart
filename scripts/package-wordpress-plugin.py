"""Build the downloadable WordPress plugin using only the Python standard library."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent.parent
source = root / 'wordpress' / 'solemart-guide-fields'
target = root / 'public' / 'downloads' / 'solemart-guide-fields.zip'
target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for name in ('solemart-guide-fields.php', 'editor.js', 'editor.css', 'schema.json'):
        info = ZipInfo(f'solemart-guide-fields/{name}', (2026, 10, 21, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (source / name).read_bytes())
print(target.relative_to(root))
