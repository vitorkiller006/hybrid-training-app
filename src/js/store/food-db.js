// Base de dados de alimentos (Valores por porção base)
export const FoodDB = {
    // Básicos (por 100g)
    'Arroz Branco (Cozido)': { kcal: 130, p: 2.7, c: 28.1, f: 0.2, fib: 0.4, baseQty: 100, unit: 'g' },
    'Arroz Integral (Cozido)': { kcal: 111, p: 2.6, c: 23.0, f: 0.9, fib: 2.8, baseQty: 100, unit: 'g' },
    'Feijão Carioca (Cozido)': { kcal: 76, p: 4.8, c: 13.6, f: 0.5, fib: 8.5, baseQty: 100, unit: 'g' },
    'Peito de Frango em Cubos': { kcal: 165, p: 31.0, c: 0.0, f: 3.6, fib: 0, baseQty: 100, unit: 'g' },
    'Carne Moída Patinho (Cozida)': { kcal: 219, p: 35.9, c: 0.0, f: 7.3, fib: 0, baseQty: 100, unit: 'g' },
    
    // Ovos e Laticínios
    'Ovo Inteiro (Cozido/Mexido)': { kcal: 155, p: 13.0, c: 1.1, f: 11.0, fib: 0, baseQty: 100, unit: 'g' }, // ~2 ovos
    'Whey Protein Concentrado': { kcal: 400, p: 80.0, c: 8.0, f: 6.0, fib: 0, baseQty: 100, unit: 'g' },
    'Leite Integral (Líquido)': { kcal: 62, p: 3.2, c: 4.8, f: 3.2, fib: 0, baseQty: 100, unit: 'ml' },
    
    // Frutas (Por Unidade)
    'Banana Prata (Crua)': { kcal: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, baseQty: 1, unit: 'unidade' },
    'Mexerica Média': { kcal: 45, p: 1.0, c: 11.0, f: 0.0, fib: 2.0, baseQty: 1, unit: 'unidade' },
    
    // Refeições do Usuário (Hardcoded for AI Sync)
    'Bolo de Laranja': { kcal: 200, p: 2.6, c: 28.3, f: 8.3, fib: 1.0, baseQty: 1, unit: 'pedaço' },
    'Molho de Estrogonoffe': { kcal: 300, p: 5.0, c: 15.0, f: 25.0, fib: 0, baseQty: 100, unit: 'g' },
    'Paçoca': { kcal: 100, p: 2.5, c: 11.2, f: 5.5, fib: 1.0, baseQty: 20, unit: 'g' },
    'Bombom': { kcal: 100, p: 1.0, c: 12.5, f: 5.0, fib: 0.5, baseQty: 1, unit: 'unidade' },
    'Pizza de Marguerita': { kcal: 250, p: 11.0, c: 25.0, f: 10.0, fib: 1.5, baseQty: 1, unit: 'pedaço' },
    'Pizza de Chocolate': { kcal: 325, p: 7.5, c: 42.5, f: 14.0, fib: 2.0, baseQty: 1, unit: 'pedaço' },
    'Guaraná Taubaiana Cristalina': { kcal: 40, p: 0, c: 10.0, f: 0, fib: 0, baseQty: 100, unit: 'ml' },
    'Café Preto com adoçante': { kcal: 0, p: 0, c: 0, f: 0, fib: 0, baseQty: 100, unit: 'ml' }
};
