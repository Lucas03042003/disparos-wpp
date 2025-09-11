import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { userTable, fluxesTable, numbersTable, contactsTable } from './schema'; // ajuste o path!
import { v4 as uuidv4 } from 'uuid';
import { db } from '.';

async function main() {

  // Step 1: Limpa tabelas para não duplicar seeds
  await db.delete(contactsTable).execute();
  await db.delete(numbersTable).execute();
  await db.delete(fluxesTable).execute();
  await db.delete(userTable).execute();

  // Step 2: Cria usuário(s)
  const userId = uuidv4();
  await db.insert(userTable).values({
    id: userId,
    name: 'Lucas',
    email: 'lucasbrcoelho@gmail.com',
    password: 'Lucas@2003',
    status: 'ativo',
    lastAccess: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }).execute();

  // Step 3: Cria fluxo(s)
  const fluxId = uuidv4();
  await db.insert(fluxesTable).values({
    id: fluxId,
    userId: userId,
    name: 'Primeiro fluxo WhatsApp',
    message: 'Olá, este é um teste do sistema de bots do Lucas.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).execute();

  // Step 4: Cria número(s) conectado(s)
  const numberId = uuidv4();
  await db.insert(numbersTable).values({
    id: numberId,
    fluxId: fluxId,
    userId: userId,
    remoteJid: '5585982230304@s.whatsapp.net',
    instanceName: 'instancia-teste',
    token: 'token-super-secreto',
    connectionStatus: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).execute();

  // Step 5: Cria contato(s) para o fluxo
  const contatoId = uuidv4();
  await db.insert(contactsTable).values({
    id: contatoId,
    fluxId: fluxId,
    name: 'Suzana',
    phoneNumber: '+5585988284483',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).execute();

  // Step 6: (Opcional) Exibe dados seedados!
  const users = await db.select().from(userTable).execute();
  const fluxes = await db.select().from(fluxesTable).execute();
  const numbers = await db.select().from(numbersTable).execute();
  const contacts = await db.select().from(contactsTable).execute();

  console.log({ users, fluxes, numbers, contacts });

}

main().catch((err) => {
  console.error('Erro no seed', err);
  process.exit(1);
});