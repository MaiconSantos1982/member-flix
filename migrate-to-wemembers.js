#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando migração MemberFlix → WeMembers\n');
console.log('='.repeat(80));

const changes = {
    branding: 0,
    tables: 0,
    errors: 0
};

// Arquivos para atualizar branding
const brandingFiles = [
    'public/manifest.json',
    'public/sw.js',
    'app/layout.tsx',
    'app/login/page.tsx',
    'app/registro/page.tsx',
    'components/layout/Sidebar.tsx',
    'components/admin/AdminSidebar.tsx',
    'app/admin/configuracoes/page.tsx'
];

// Substituir branding
console.log('\n📝 Fase 1: Atualizando Branding\n');

brandingFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${filePath}`);
        return;
    }

    try {
        let content = fs.readFileSync(fullPath, 'utf-8');
        const original = content;

        // Substituir variações de MemberFlix
        content = content.replace(/MemberFlix/g, 'WeMembers');
        content = content.replace(/Member Flix/g, 'WeMembers');
        content = content.replace(/memberflix/g, 'wemembers');
        content = content.replace(/member-flix/g, 'wemembers');

        if (content !== original) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            console.log(`   ✅ ${filePath}`);
            changes.branding++;
        } else {
            console.log(`   ⏭️  ${filePath} (sem mudanças)`);
        }
    } catch (error) {
        console.log(`   ❌ Erro em ${filePath}: ${error.message}`);
        changes.errors++;
    }
});

// Arquivos para atualizar queries do Supabase
const supabaseFiles = [
    'app/page.tsx',
    'app/progresso/page.tsx',
    'app/meus-cursos/page.tsx',
    'app/catalogo/page.tsx',
    'app/watch/[productId]/page.tsx',
    'app/admin/page.tsx',
    'app/admin/produtos/page.tsx',
    'app/admin/alunos/page.tsx',
    'app/admin/construtor/page.tsx'
];

console.log('\n📊 Fase 2: Migrando Queries do Supabase\n');

supabaseFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${filePath}`);
        return;
    }

    try {
        let content = fs.readFileSync(fullPath, 'utf-8');
        const original = content;

        // Substituir tabelas (SEM tocar em 'profiles')
        content = content.replace(/\.from\(['"]products['"]\)/g, ".from('wemembers_products')");
        content = content.replace(/\.from\(['"]modules['"]\)/g, ".from('wemembers_modules')");
        content = content.replace(/\.from\(['"]lessons['"]\)/g, ".from('wemembers_lessons')");
        content = content.replace(/\.from\(['"]enrollments['"]\)/g, ".from('wemembers_enrollments')");
        content = content.replace(/\.from\(['"]lesson_progress['"]\)/g, ".from('wemembers_lesson_progress')");

        if (content !== original) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            console.log(`   ✅ ${filePath}`);
            changes.tables++;
        } else {
            console.log(`   ⏭️  ${filePath} (sem mudanças)`);
        }
    } catch (error) {
        console.log(`   ❌ Erro em ${filePath}: ${error.message}`);
        changes.errors++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMO DA MIGRAÇÃO:\n');
console.log(`   Arquivos de branding atualizados: ${changes.branding}`);
console.log(`   Arquivos de queries migrados:     ${changes.tables}`);
console.log(`   Erros encontrados:                ${changes.errors}`);

if (changes.errors === 0) {
    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Revisar as mudanças com git diff');
    console.log('   2. Testar a aplicação');
    console.log('   3. Fazer commit das alterações\n');
} else {
    console.log('\n⚠️  Migração concluída com erros. Revise os arquivos acima.\n');
}
