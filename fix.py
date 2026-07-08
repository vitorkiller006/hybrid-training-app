import re
with open('app.js', 'r', encoding='latin-1') as f:
    content = f.read()
content = content.replace('Caf da Manh', 'Café da Manhã').replace('Almoo', 'Almoço').replace('Po', 'Pão').replace('Feijo', 'Feijão').replace('Moda', 'Moída').replace('adoante', 'adoçante').replace('', 'ã')
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
with open('src/js/store/food-db.js', 'r', encoding='latin-1') as f:
    fdb = f.read()
fdb = fdb.replace('moda', 'moída').replace('Po', 'Pão').replace('Moda', 'Moída').replace('', 'ã')
with open('src/js/store/food-db.js', 'w', encoding='utf-8') as f:
    f.write(fdb)

