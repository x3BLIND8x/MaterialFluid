"""Fetch the official pinned Vazirmatn RD font and license. Icons are fetched separately by fetch-icons.py."""
from pathlib import Path
import urllib.request
root = Path(__file__).resolve().parents[1]
def fetch(url,target):
 target.parent.mkdir(parents=True,exist_ok=True)
 target.write_bytes(urllib.request.urlopen(url,timeout=40).read())
fetch('https://raw.githubusercontent.com/rastikerdar/vazirmatn/v33.003/Round-Dots/fonts/webfonts/Vazirmatn-RD%5Bwght%5D.woff2',root/'public/fonts/vazirmatn-rd.woff2')
fetch('https://raw.githubusercontent.com/rastikerdar/vazirmatn/v33.003/OFL.txt',root/'licenses/vazirmatn.txt')
print('Fetched official Vazirmatn RD font.')
