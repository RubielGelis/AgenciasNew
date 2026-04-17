import prisma from './src/lib/prisma';
async function test() {
  try {
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE PROCEDURE public.spTest(INOUT p_id INT, INOUT p_msg TEXT) LANGUAGE plpgsql AS $$ BEGIN p_id := 42; p_msg := 'SUCCESS TEST'; END; $$;`);
    const res = await prisma.$queryRawUnsafe(`CALL public.spTest(0, '')`);
    console.log('TEST PROCEDURE RESULT:', JSON.stringify(res, null, 2));
  } catch(e){ console.error(e) }
}
test().finally(()=>prisma.$disconnect());
