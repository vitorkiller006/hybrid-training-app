// Base de dados de alimentos (Valores por porção base)
export const FoodDB = {
    // Básicos (por 100g)
    'Mini Pizza Pratty (Massa)': { kcal: 34, p: 1.0, c: 7.0, f: 0.0, fib: 0.2, baseQty: 1, unit: 'unidade' },
    'Queijo Mussarela': { kcal: 300, p: 25.0, c: 3.0, f: 22.0, fib: 0, baseQty: 100, unit: 'g' },
    'Tomate': { kcal: 20, p: 1.0, c: 4.0, f: 0.2, fib: 1.2, baseQty: 100, unit: 'g' },
    'Ganache de Chocolate': { kcal: 100, p: 1.0, c: 10.0, f: 6.0, fib: 1.0, baseQty: 1, unit: 'colher' },
    'Suco Tang (Preparado)': { kcal: 18, p: 0.0, c: 4.0, f: 0.0, fib: 0, baseQty: 200, unit: 'ml' },
    'Arroz Branco (Cozido)': { kcal: 130, p: 2.7, c: 28.1, f: 0.3, fib: 0.4, baseQty: 100, unit: 'g' },
    'Arroz Integral (Cozido)': { kcal: 111, p: 2.6, c: 23.0, f: 0.9, fib: 2.8, baseQty: 100, unit: 'g' },
    'Feijão Carioca (Cozido)': { kcal: 76, p: 4.8, c: 13.6, f: 0.5, fib: 8.5, baseQty: 100, unit: 'g' },
    'Peito de Frango em Cubos': { kcal: 165, p: 31.0, c: 0.0, f: 3.6, fib: 0, baseQty: 100, unit: 'g' },
    'Carne Moída Patinho (Cozida)': { kcal: 219, p: 35.9, c: 0.0, f: 7.3, fib: 0, baseQty: 100, unit: 'g' },
    
    // Ovos e Laticínios
    'Ovo Inteiro (Cozido/Mexido)': { kcal: 155, p: 13.0, c: 1.1, f: 11.0, fib: 0, baseQty: 100, unit: 'g' }, // ~2 ovos
    'Ovo (unidade)': { kcal: 75, p: 6.5, c: 0.5, f: 5.5, fib: 0, baseQty: 1, unit: 'unidade' },
    'Ovo Inteiro (unidade)': { kcal: 75, p: 6.5, c: 0.5, f: 5.5, fib: 0, baseQty: 1, unit: 'unidade' },
    'Whey Protein Concentrado': { kcal: 400, p: 80.0, c: 8.0, f: 6.0, fib: 0, baseQty: 100, unit: 'g' },
    'Leite Integral (Líquido)': { kcal: 62, p: 3.2, c: 4.8, f: 3.2, fib: 0, baseQty: 100, unit: 'ml' },
    
    // Frutas (Por Unidade)
    'Banana Prata (Crua)': { kcal: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, baseQty: 1, unit: 'unidade' },
    'Mexerica Média': { kcal: 45, p: 1.0, c: 11.0, f: 0.0, fib: 2.0, baseQty: 1, unit: 'unidade' },
    
    'Bolo de Laranja': { kcal: 200, p: 2.6, c: 28.3, f: 8.3, fib: 1.0, baseQty: 1, unit: 'pedaço' },
    'Macarrão': { kcal: 157, p: 5.8, c: 30.9, f: 0.9, fib: 1.8, baseQty: 100, unit: 'g' },
    'Macarrão Cozido': { kcal: 157, p: 5.8, c: 30.9, f: 0.9, fib: 1.8, baseQty: 100, unit: 'g' },
    'Brigadeiro': { kcal: 65, p: 1.0, c: 10.0, f: 2.0, fib: 0, baseQty: 1, unit: 'colher' },
    'Pipoca': { kcal: 365, p: 9.0, c: 74.0, f: 4.0, fib: 13.0, baseQty: 100, unit: 'g' },
    'Pipoca de Microondas': { kcal: 430, p: 6.0, c: 50.0, f: 23.0, fib: 8.0, baseQty: 100, unit: 'g' },
    'Oleo de Soja': { kcal: 88, p: 0.0, c: 0.0, f: 10.0, fib: 0, baseQty: 10, unit: 'g' },
    'Óleo de Soja': { kcal: 88, p: 0.0, c: 0.0, f: 10.0, fib: 0, baseQty: 10, unit: 'g' },
    'Azeite de Oliva': { kcal: 88, p: 0.0, c: 0.0, f: 10.0, fib: 0, baseQty: 10, unit: 'g' },
    'Manteiga': { kcal: 71, p: 0.1, c: 0.0, f: 8.1, fib: 0, baseQty: 10, unit: 'g' },
    'Suco de Laranja': { kcal: 110, p: 1.7, c: 25.8, f: 0.5, fib: 0.5, baseQty: 250, unit: 'ml' },
    'Refrigerante Cola Zero': { kcal: 0, p: 0.0, c: 0.0, f: 0.0, fib: 0, baseQty: 350, unit: 'ml' },
    'Whey Iso Pretorian': { kcal: 111, p: 25.0, c: 2.0, f: 0.0, fib: 0, baseQty: 30, unit: 'g' },
    'Molho de Estrogonoffe': { kcal: 300, p: 5.0, c: 15.0, f: 25.0, fib: 0, baseQty: 100, unit: 'g' },
    'Molho de Strogonoff': { kcal: 300, p: 5.0, c: 15.0, f: 25.0, fib: 0, baseQty: 100, unit: 'g' },
    'Frango Cozido': { kcal: 165, p: 31.0, c: 0.0, f: 3.6, fib: 0, baseQty: 100, unit: 'g' },
    'Paçoca': { kcal: 100, p: 2.5, c: 11.2, f: 5.5, fib: 1.0, baseQty: 20, unit: 'g' },
    'Bombom': { kcal: 100, p: 1.0, c: 12.5, f: 5.0, fib: 0.5, baseQty: 1, unit: 'unidade' },
    'Pizza de Marguerita': { kcal: 250, p: 11.0, c: 25.0, f: 10.0, fib: 1.5, baseQty: 1, unit: 'pedaço' },
    'Pizza de Chocolate': { kcal: 325, p: 7.5, c: 42.5, f: 14.0, fib: 2.0, baseQty: 1, unit: 'pedaço' },
    'Guaraná Taubaiana Cristalina': { kcal: 40, p: 0, c: 10.0, f: 0, fib: 0, baseQty: 100, unit: 'ml' },
    'Café Preto com adoçante': { kcal: 0, p: 0, c: 0, f: 0, fib: 0, baseQty: 100, unit: 'ml' },
    
    // Novos Adicionados
    'Nescau': { kcal: 74, p: 0.7, c: 17, f: 0.4, fib: 1.0, baseQty: 20, unit: 'g' }, // ~2 colheres
    'Pão Francês': { kcal: 135, p: 4.0, c: 25.0, f: 1.5, fib: 1.0, baseQty: 1, unit: 'unidade' },
    'Queijo Mussarela': { kcal: 90, p: 7.0, c: 0.5, f: 6.5, fib: 0, baseQty: 30, unit: 'g' },
    'Presunto': { kcal: 45, p: 5.0, c: 0.5, f: 2.5, fib: 0, baseQty: 30, unit: 'g' },
    'Tapioca (Goma)': { kcal: 168, p: 0, c: 42.0, f: 0, fib: 0, baseQty: 50, unit: 'g' },
    'Iogurte Natural': { kcal: 125, p: 7.0, c: 9.0, f: 7.0, fib: 0, baseQty: 170, unit: 'g' },
    'Aveia em Flocos': { kcal: 118, p: 4.3, c: 17.0, f: 2.2, fib: 2.9, baseQty: 30, unit: 'g' },
    'Azeite de Oliva': { kcal: 119, p: 0, c: 0, f: 13.5, fib: 0, baseQty: 13, unit: 'ml' }
};
