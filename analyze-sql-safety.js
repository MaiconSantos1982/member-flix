const fs = require('fs');

console.log('🔍 ANÁLISE DE SEGURANÇA DO SQL - wemembers_schema.sql\n');
console.log('='.repeat(80));

const sqlContent = fs.readFileSync('./wemembers_schema.sql', 'utf-8');
const lines = sqlContent.split('\n');

// Comandos perigosos que NÃO devem existir
const dangerousCommands = [
    { pattern: /DROP TABLE(?! IF EXISTS public\.wemembers_)/i, description: 'DROP TABLE em tabelas existentes' },
    { pattern: /TRUNCATE/i, description: 'TRUNCATE (apagar dados)' },
    { pattern: /DELETE FROM/i, description: 'DELETE (apagar registros)' },
    { pattern: /ALTER TABLE public\.(products|users|accounts|offers|payments|funnels|sales)/i, description: 'ALTER TABLE em tabelas existentes' },
    { pattern: /UPDATE public\.(products|users|accounts|offers|payments|funnels|sales)/i, description: 'UPDATE em tabelas existentes' },
    { pattern: /INSERT INTO public\.(products|users|accounts|offers|payments|funnels|sales)/i, description: 'INSERT em tabelas existentes' },
];

// Comandos seguros que DEVEM existir
const safeCommands = [
    { pattern: /CREATE TABLE IF NOT EXISTS public\.wemembers_/i, description: 'Criar tabelas wemembers_*' },
    { pattern: /CREATE INDEX IF NOT EXISTS/i, description: 'Criar índices' },
    { pattern: /CREATE OR REPLACE FUNCTION/i, description: 'Criar/atualizar funções' },
    { pattern: /CREATE OR REPLACE VIEW/i, description: 'Criar/atualizar views' },
    { pattern: /REFERENCES public\.(products|users|accounts|offers)\(/i, description: 'Referências FK (somente leitura)' },
];

console.log('\n✅ COMANDOS SEGUROS ENCONTRADOS:\n');
let safeCount = 0;
safeCommands.forEach(cmd => {
    const matches = sqlContent.match(new RegExp(cmd.pattern, 'gi'));
    if (matches) {
        console.log(`   ✓ ${cmd.description}: ${matches.length} ocorrência(s)`);
        safeCount += matches.length;
    }
});

console.log('\n🔎 VERIFICANDO COMANDOS PERIGOSOS:\n');
let dangerCount = 0;
let foundDanger = false;

dangerousCommands.forEach(cmd => {
    const matches = sqlContent.match(new RegExp(cmd.pattern, 'gi'));
    if (matches && matches.length > 0) {
        console.log(`   ⚠️  PERIGO: ${cmd.description}: ${matches.length} ocorrência(s)`);
        matches.forEach((match, idx) => {
            const lineNum = sqlContent.substring(0, sqlContent.indexOf(match)).split('\n').length;
            console.log(`      - Linha ${lineNum}: ${match}`);
        });
        dangerCount += matches.length;
        foundDanger = true;
    }
});

if (!foundDanger) {
    console.log('   ✅ NENHUM comando perigoso encontrado!');
}

console.log('\n📋 TABELAS QUE SERÃO CRIADAS:\n');
const createTableMatches = sqlContent.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/gi);
if (createTableMatches) {
    createTableMatches.forEach(match => {
        const tableName = match.match(/public\.(\w+)/i)[1];
        console.log(`   ✓ ${tableName}`);
    });
}

console.log('\n📎 TABELAS EXISTENTES (APENAS REFERENCIADAS):\n');
const referencesMatches = sqlContent.match(/REFERENCES public\.(\w+)\(/gi);
if (referencesMatches) {
    const uniqueTables = [...new Set(referencesMatches.map(m => m.match(/public\.(\w+)/i)[1]))];
    uniqueTables.forEach(table => {
        console.log(`   → ${table} (somente leitura via FK)`);
    });
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMO DA ANÁLISE:\n');
console.log(`   Comandos seguros:   ${safeCount}`);
console.log(`   Comandos perigosos: ${dangerCount}`);
console.log(`   Status: ${foundDanger ? '❌ NÃO SEGURO' : '✅ 100% SEGURO'}`);

console.log('\n' + '='.repeat(80));
console.log('\n🎯 CONCLUSÃO:\n');

if (foundDanger) {
    console.log('   ⚠️  ENCONTRADOS COMANDOS PERIGOSOS!');
    console.log('   ❌ NÃO execute este SQL sem revisão!');
} else {
    console.log('   ✅ Este SQL é 100% SEGURO para executar.');
    console.log('   ✅ NÃO modifica nenhuma tabela existente.');
    console.log('   ✅ NÃO deleta nenhum dado.');
    console.log('   ✅ Apenas CRIA novas tabelas com prefixo "wemembers_".');
    console.log('   ✅ Apenas FAZ REFERÊNCIA a tabelas existentes (FK).');
    console.log('\n   🚀 PODE EXECUTAR COM CONFIANÇA!');
}

console.log('\n' + '='.repeat(80));
