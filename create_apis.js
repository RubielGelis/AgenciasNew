const fs = require('fs');
const path = require('path');

const routes = {
  'payments': {
    tableName: 'Payment',
    spList: 'fnPaymentListar',
    spCreate: 'spPaymentCrear',
    spUpdate: 'spPaymentActualizar',
    spDelete: 'spPaymentEliminar',
    fieldsCreate: ['code', 'name', 'iscash', 'iscredit'],
    fieldsUpdate: ['id', 'code', 'name', 'iscash', 'iscredit', 'inactive']
  },
  'countries': {
    tableName: 'Countries',
    spList: 'fnCountryListar',
    spCreate: 'spCountryCrear',
    spUpdate: 'spCountryActualizar',
    spDelete: 'spCountryEliminar',
    fieldsCreate: ['code', 'name', 'dane', 'region', 'prefix', 'curencyId'],
    fieldsUpdate: ['id', 'code', 'name', 'dane', 'region', 'prefix', 'curencyId']
  },
  'cities': {
    tableName: 'Cities',
    spList: 'fnCityListar',
    spCreate: 'spCityCrear',
    spUpdate: 'spCityActualizar',
    spDelete: 'spCityEliminar',
    fieldsCreate: ['code', 'name', 'countriesId', 'statecode', 'iata'],
    fieldsUpdate: ['id', 'code', 'name', 'countriesId', 'statecode', 'iata']
  },
  'airports': {
    tableName: 'Airports',
    spList: 'fnAirportListar',
    spCreate: 'spAirportCrear',
    spUpdate: 'spAirportActualizar',
    spDelete: 'spAirportEliminar',
    fieldsCreate: ['code', 'name', 'citiesId'],
    fieldsUpdate: ['id', 'code', 'name', 'citiesId']
  }
};

const baseDir = 'src/app/api/config';

for (const [folder, config] of Object.entries(routes)) {
    const dir = path.join(baseDir, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const createParams = config.fieldsCreate.map(f => `\${body.${f} !== undefined ? (typeof body.${f} === 'string' ? "'" + body.${f}.replace(/'/g, "''") + "'" : body.${f}) : null}`).join(', ');
    const updateParams = config.fieldsUpdate.map(f => `\${body.${f} !== undefined ? (typeof body.${f} === 'string' ? "'" + body.${f}.replace(/'/g, "''") + "'" : body.${f}) : null}`).join(', ');

    const code = `import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logAction } from '@/lib/audit'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
    try {
        const records = await prisma.$queryRawUnsafe('SELECT * FROM public."${config.spList}"()');
        return NextResponse.json(records);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id ? parseInt(session.user.id) : 0;
        const body = await req.json();

        // Convert empty strings to null for IDs/numbers if needed
        Object.keys(body).forEach(key => {
            if (body[key] === '') {
                if (key === 'curencyId' || key === 'countriesId' || key === 'citiesId') body[key] = null;
            }
        });

        const query = \`CALL public."${config.spCreate}"(${createParams}, \${userId}, null, null)\`;
        const result: any = await prisma.$queryRawUnsafe(query);
        const mensaje = result[0]?.p_mensaje_resultado || 'ERROR: No message';
        const newId = result[0]?.p_id;

        if (!mensaje.startsWith('SUCCESS')) {
            return NextResponse.json({ error: mensaje }, { status: 400 });
        }

        await logAction(userId, 'CREATE', '${config.tableName}', \`Creado nuevo registro \${body.code}\`);
        return NextResponse.json({ success: true, id: newId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id ? parseInt(session.user.id) : 0;
        const body = await req.json();

        // Convert empty strings to null for IDs/numbers if needed
        Object.keys(body).forEach(key => {
            if (body[key] === '') {
                if (key === 'curencyId' || key === 'countriesId' || key === 'citiesId') body[key] = null;
            }
        });

        const query = \`CALL public."${config.spUpdate}"(${updateParams}, \${userId}, null)\`;
        const result: any = await prisma.$queryRawUnsafe(query);
        const mensaje = result[0]?.p_mensaje_resultado || 'ERROR: No message';

        if (!mensaje.startsWith('SUCCESS')) {
            return NextResponse.json({ error: mensaje }, { status: 400 });
        }

        await logAction(userId, 'UPDATE', '${config.tableName}', \`Actualizado registro \${body.id}\`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id ? parseInt(session.user.id) : 0;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const query = \`CALL public."${config.spDelete}"(\${id}, \${userId}, null)\`;
        const result: any = await prisma.$queryRawUnsafe(query);
        const mensaje = result[0]?.p_mensaje_resultado || 'ERROR: No message';

        if (!mensaje.startsWith('SUCCESS')) {
            return NextResponse.json({ error: mensaje }, { status: 400 });
        }

        await logAction(userId, 'DELETE', '${config.tableName}', \`Eliminado registro \${id}\`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}\`;

    fs.writeFileSync(path.join(dir, 'route.ts'), code);
    console.log('Created route for', folder);
}
