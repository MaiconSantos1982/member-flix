#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Buscando todos os arquivos com queries do Supabase...\n');

// Buscar todos os arquivos .tsx, .ts, .js que contenham .from(
const command = `grep -rl "\\.from(" --include="*.tsx" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next .`;

try {
    const output = execSync(command, { cwd: __dirname, encoding: 'utf-8' });
    const files = output.trim().split('\n').filter(f => f);

    console.log(`📋 Encontrados ${files.length} arquivos:\n`);

    files.forEach((file, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}. ${file}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n🔧 Aplicando migrações em TODOS os arquivos...\n');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    files.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);

        try {
            let content = fs.readFileSync(fullPath, 'utf-8');
            const original = content;

            // Substituir tabelas M SEM tocar em 'profiles'
            content = content.replace(/\.from\(['"]products['"]\)/g, ".from('wemembers_products')");
            content = content.replace(/\.from\(['"]modules['"]\)/g, ".from('wemembers_modules')");
            content = content.replace(/\.from\(['"]lessons['"]\)/g, ".from('wemembers_lessons')");
            content = content.replace(/\.from\(['"]enrollments['"]\)/g, ".from('wemembers_enrollments')");
            content = content.replace(/\.from\(['"]lesson_progress['"]\)/g, ".from('wemembers_lesson_progress')");

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`   ✅ ${filePath}`);
                updated++;
            } else {
                console.log(`   ⏭️  ${filePath} (nenhuma mudança necessária)`);
                skipped++;
            }
        } catch (error) {
            console.log(`   ❌ Erro em ${filePath}: ${error.message}`);
            errors++;
        }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMO FINAL:\n');
    console.log(`   Arquivos atualizados: ${updated}`);
    console.log(`   Arquivos ignorados:   ${skipped}`);
    console.log(`   Erros:                ${errors}`);
    console.log(`\n✅ Migração completa!\n`);

} catch (error) {
    console.error('❌ Erro ao executar grep:', error.message);
    process.exit(1);
}
