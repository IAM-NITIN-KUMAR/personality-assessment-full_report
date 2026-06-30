const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data, error } = await supabase
    .from('students')
    .insert({
      name: 'Test Student',
      email: 'test@example.com',
      phone: '1234567890',
      discipline: 'science',
      education_level: '10th_12th'
    })
    .select('id');

  if (error) {
    console.error('Insert error (likely column doesn\'t exist):', error.message);
  } else {
    console.log('Insert successful! Column exists. ID:', data);
    // Delete the test record
    await supabase.from('students').delete().eq('id', data[0].id);
    console.log('Test record cleaned up.');
  }
}

testInsert();
