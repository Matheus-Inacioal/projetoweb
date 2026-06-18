const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sbwfmxuldrdicvsfbduu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNid2ZteHVsZHJkaWN2c2ZiZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTM2MTMsImV4cCI6MjA5NjI2OTYxM30.ptTEzZjN34S1tmG819xHz7_eK51pRh1Cu8K2f4NdT8I';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function run() {
  console.log('1. Trying to sign in with admin@barbergo.com / 123456...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@barbergo.com',
    password: '123456'
  });

  if (error) {
    console.error('Sign in failed:', error.message, error.status);
    return;
  }

  console.log('Sign in success! User ID:', data.user.id);
  console.log('User email:', data.user.email);
  console.log('User metadata:', data.user.user_metadata);

  console.log('2. Querying public.usuarios table for this user ID...');
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('tipo_usuario, nome')
    .eq('id', data.user.id)
    .single();

  if (usuarioError) {
    console.error('Query error:', usuarioError);
  } else {
    console.log('Query success! User profile:', usuario);
  }

  console.log('3. Trying to query all usuarios in the table without filters (just to check if table has data)...');
  const { data: allUsers, error: allUsersError } = await supabase
    .from('usuarios')
    .select('*');

  if (allUsersError) {
    console.error('All users query error:', allUsersError);
  } else {
    console.log(`Found ${allUsers?.length || 0} users in table:`);
    console.log(JSON.stringify(allUsers, null, 2));
  }
}

run();
