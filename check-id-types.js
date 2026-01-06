const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aijwronobdmmbquvzmqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpandyb25vYmRtbWJxdXZ6bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDUwNzksImV4cCI6MjA3NTQyMTA3OX0.XNvEPLGM8rhVgt-LMzB6Q6alXm5Vs_AMWUcOvpnWgv8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getIdTypes() {
    console.log('🔍 Verificando tipos da coluna ID em todas as tabelas...\n');
    console.log('='.repeat(80));

    const tablesToCheck = ['users', 'products', 'accounts', 'offers', 'payments', 'funnels', 'sales'];

    const results = {};

    for (const tableName of tablesToCheck) {
        const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

        if (!error && data && data.length > 0) {
            const id = data[0].id;
            let type = typeof id;

            if (type === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                type = 'UUID';
            } else if (type === 'number') {
                type = 'INTEGER';
            }

            results[tableName] = {
                type: type,
                example: id,
                exists: true
            };

            console.log(`\n✅ ${tableName.toUpperCase()}`);
            console.log(`   Tipo da coluna ID: ${type}`);
            console.log(`   Exemplo: ${id}`);
        } else if (error) {
            results[tableName] = {
                exists: false,
                error: error.message
            };
            console.log(`\n❌ ${tableName.toUpperCase()}`);
            console.log(`   Erro: ${error.message}`);
        } else {
            results[tableName] = {
                exists: true,
                type: 'UNKNOWN (empty table)',
                example: null
            };
            console.log(`\n⚠️  ${tableName.toUpperCase()}`);
            console.log(`   Tabela existe mas está vazia`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 RESUMO PARA CORREÇÃO DO SQL:\n');

    Object.keys(results).forEach(table => {
        const info = results[table];
        if (info.exists && info.type) {
            const sqlType = info.type === 'UUID' ? 'UUID' : 'INTEGER';
            console.log(`${table.padEnd(15)} → ${sqlType.padEnd(10)} (usar em FKs)`);
        }
    });

    console.log('\n' + '='.repeat(80));

    return results;
}

getIdTypes()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Erro:', err.message);
        process.exit(1);
    });
