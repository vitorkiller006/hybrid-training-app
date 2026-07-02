import urllib.request
import json
import os

url = 'https://firestore.googleapis.com/v1/projects/one-hybrid-app/databases/(default)/documents/users/vitor'
response = urllib.request.urlopen(url).read()
doc = json.loads(response)

nutri = doc['fields'].get('nutrition_history', {}).get('mapValue', {}).get('fields', {}).get('2026-07-02', {})
workout = doc['fields'].get('workout_history', {}).get('mapValue', {}).get('fields', {}).get('2026-07-02', {})

with open('vitor_nutri.json', 'w', encoding='utf-8') as f:
    json.dump(nutri, f, indent=2)
    
with open('vitor_workout.json', 'w', encoding='utf-8') as f:
    json.dump(workout, f, indent=2)
