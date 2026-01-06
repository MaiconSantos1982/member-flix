const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aijwronobdmmbquvzmqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpandyb25vYmRtbWJxdXZ6bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDUwNzksImV4cCI6MjA3NTQyMTA3OX0.XNvEPLGM8rhVgt-LMzB6Q6alXm5Vs_AMWUcOvpnWgv8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOffersTable() {
    console.log('🔍 Verificando tabela OFFERS...\n');

    // Tentar buscar dados da tabela offers
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .limit(1);

    if (error) {
        console.log('❌ Tabela OFFERS não existe ou não está acessível');
        console.log(`   Erro: ${error.message}\n`);
        console.log('✅ SEGURO para criar a tabela offers no SQL');
        return false;
    }

    console.log('✅ Tabela OFFERS já existe!\n');

    if (data && data.length > 0) {
        console.log('📊 Estrutura atual (baseada em registro de exemplo):\n');
        const sample = data[0];
        const columns = Object.keys(sample);

        columns.forEach(col => {
            const value = sample[col];
            let type = typeof value;

            if (value === null) {
                type = 'null';
            } else if (type === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                type = 'timestamp';
            } else if (type === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                type = 'uuid';
            }

            const preview = value === null ? 'NULL' :
                typeof value === 'string' && value.length > 40 ?
                    `"${value.substring(0, 40)}..."` :
                    JSON.stringify(value);

            console.log(`  ${col.padEnd(25)} → ${type.padEnd(15)} (ex: ${preview})`);
        });

        // Contar registros
        const { count } = await supabase
            .from('offers')
            .select('*', { count: 'exact', head: true });

        console.log(`\n📈 Total de registros: ${count || 0}`);
    } else {
        console.log('ℹ️  Tabela existe mas está vazia\n');
        console.log('📋 Colunas esperadas pela tabela (não foi possível inferir)');
    }

    console.log('\n⚠️  RECOMENDAÇÃO: REMOVA a seção de criação da tabela OFFERS do SQL');
    console.log('   Use apenas as referências a offers nas foreign keys\n');

    return true;
}

checkOffersTable()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Erro:', err.message);
        process.exit(1);
    });
