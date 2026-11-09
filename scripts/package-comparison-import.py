"""Package the five existing drafts with a logged-in WordPress admin importer."""
from pathlib import Path
from tempfile import TemporaryDirectory
from subprocess import run
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parent.parent
target = root / 'public/template-preview/wordpress-import/solemart-comparisons.zip'
target.parent.mkdir(parents=True, exist_ok=True)
with TemporaryDirectory(prefix='solemart-comparison-package-') as temporary:
    run(['node', '--conditions=react-server', '--experimental-strip-types',
         str(root / 'scripts/import-comparison-posts.mjs'), '--output', temporary],
        cwd=root, check=True, capture_output=True, text=True)
    articles = json.loads((Path(temporary) / 'comparison-post-drafts.json').read_text())
    assert len(articles) == 5 and all(article['status'] == 'draft' for article in articles)
    files = {
        'solemart-comparison-import.php': (root / 'wordpress/solemart-comparison-import/solemart-comparison-import.php').read_bytes(),
        'articles.json': (json.dumps(articles, ensure_ascii=False, indent=2) + '\n').encode(),
    }
    with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
        for name, content in files.items():
            info = ZipInfo('solemart-comparison-import/' + name, (2026, 11, 9, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, content)
print(target.relative_to(root))
