const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aijwronobdmmbquvzmqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpandyb25vYmRtbWJxdXZ6bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDUwNzksImV4cCI6MjA3NTQyMTA3OX0.XNvEPLGM8rhVgt-LMzB6Q6alXm5Vs_AMWUcOvpnWgv8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersTable() {
    console.log('🔍 Verificando estrutura da tabela USERS...\n');

    // Tentar inserir e deletar um registro de teste para ver a estrutura
    const testId = crypto.randomUUID();

    // Primeiro, tentar buscar qualquer registro
    const { data: existing, error: selectError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (selectError) {
        console.log('❌ Erro ao acessar tabela users:', selectError.message);
        console.log('\n⚠️  Talvez a tabela users não exista ainda.');
        console.log('   Recomendação: Criar a tabela users primeiro.\n');
        return null;
    }

    if (existing && existing.length > 0) {
        console.log('✅ Tabela users tem registros!\n');
        console.log('Estrutura baseada em registro existente:\n');

        const sample = existing[0];
        const columns = Object.keys(sample);

        columns.forEach(col => {
            const value = sample[col];
            let type = typeof value;

            if (value === null) {
                type = 'null';
            } else if (type === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                type = 'timestamp';
            } else if (type === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                type = 'UUID';
            }

            console.log(`  ${col.padEnd(20)} → ${type}`);
        });

        const idType = typeof sample.id === 'string' && sample.id.match(/^[0-9a-f-]{36}$/) ? 'UUID' : 'INTEGER';

        console.log(`\n📊 Tipo do ID: ${idType}\n`);
        return idType;
    } else {
        console.log('⚠️  Tabela users existe mas está VAZIA\n');
        console.log('   Não é possível inferir o tipo do ID.');
        console.log('   Consultando schema do Supabase...\n');

        // Tentar via RPC ou assumir que é UUID (padrão Supabase)
        console.log('ℹ️  Assumindo UUID (padrão do Supabase para auth.users)\n');
        return 'UUID';
    }
}

checkUsersTable()
    .then(type => {
        if (type) {
            console.log('='.repeat(60));
            console.log(`\n✅ USAR NO SQL: user_id ${type}\n`);
            console.log('='.repeat(60));
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro:', err.message);
        process.exit(1);
    });
