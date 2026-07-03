import urllib.request
import json

def fetch_and_save(user, filename):
    url = f'https://firestore.googleapis.com/v1/projects/one-hybrid-app/databases/(default)/documents/users/{user}'
    response = urllib.request.urlopen(url).read()
    doc = json.loads(response)
    nutri = doc['fields'].get('nutrition_history', {}).get('mapValue', {}).get('fields', {}).get('2026-07-02', {})
    if not nutri:
        nutri = doc['fields'].get('nutrition_history', {}).get('mapValue', {}).get('fields', {})
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(nutri, f, indent=2)

fetch_and_save('vitor', 'vitor_nutri_latest.json')
fetch_and_save('gabi', 'gabi_nutri_latest_2.json')
