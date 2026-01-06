const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aijwronobdmmbquvzmqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpandyb25vYmRtbWJxdXZ6bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDUwNzksImV4cCI6MjA3NTQyMTA3OX0.XNvEPLGM8rhVgt-LMzB6Q6alXm5Vs_AMWUcOvpnWgv8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllTables() {
    console.log('🔍 Buscando todas as tabelas disponíveis...\n');

    // Lista de possíveis tabelas para testar
    const possibleTables = [
        'profiles', 'products', 'purchases', 'lessons', 'progress', 'categories',
        'users', 'orders', 'payments', 'subscriptions', 'courses', 'modules',
        'videos', 'pdfs', 'content', 'members', 'enrollments', 'transactions',
        'accounts', 'funnels', 'leads', 'customers', 'sales'
    ];

    const existingTables = [];

    for (const tableName of possibleTables) {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (!error) {
            existingTables.push(tableName);
            console.log(`✅ ${tableName}`);
        }
    }

    console.log(`\n📊 Total de tabelas encontradas: ${existingTables.length}\n`);
    console.log('='.repeat(80));

    // Agora extrair estrutura de cada tabela existente
    for (const tableName of existingTables) {
        console.log(`\n📋 TABELA: ${tableName.toUpperCase()}`);
        console.log('='.repeat(80));

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (data && data.length > 0) {
            const sample = data[0];
            const columns = Object.keys(sample);

            console.log('\n🔹 Colunas e Tipos:\n');
            columns.forEach(col => {
                const value = sample[col];
                let type = typeof value;

                if (value === null) {
                    type = 'null (desconhecido)';
                } else if (Array.isArray(value)) {
                    type = 'array';
                } else if (type === 'object') {
                    type = 'object/json';
                } else if (type === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                    type = 'timestamp';
                } else if (type === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    type = 'uuid';
                }

                const preview = value === null ? 'NULL' :
                    typeof value === 'string' && value.length > 50 ?
                        `"${value.substring(0, 50)}..."` :
                        JSON.stringify(value);

                console.log(`  ${col.padEnd(25)} → ${type.padEnd(20)} (ex: ${preview})`);
            });

            // Contar registros
            const { count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            console.log(`\n📊 Total de registros: ${count || 0}`);
        } else {
            console.log('\n  ℹ️  Tabela vazia (sem dados para inferir estrutura)');
        }
    }

    return existingTables;
}

getAllTables()
    .then((tables) => {
        console.log('\n' + '='.repeat(80));
        console.log('✅ Análise completa!');
        console.log('\n📝 Resumo das tabelas:');
        tables.forEach(t => console.log(`  - ${t}`));
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Erro:', err.message);
        process.exit(1);
    });
