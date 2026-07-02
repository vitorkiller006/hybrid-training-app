import urllib.request
import json

url = 'https://firestore.googleapis.com/v1/projects/one-hybrid-app/databases/(default)/documents/users/gabi'
response = urllib.request.urlopen(url).read()
doc = json.loads(response)

nutri = doc['fields'].get('nutrition_history', {}).get('mapValue', {}).get('fields', {}).get('2026-07-02', {})
if not nutri:
    nutri = doc['fields'].get('nutrition_history', {}).get('mapValue', {}).get('fields', {})

with open('gabi_nutri_latest.json', 'w', encoding='utf-8') as f:
    json.dump(nutri, f, indent=2)
