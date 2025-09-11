import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid, timestamp, boolean, varchar } from "drizzle-orm/pg-core";


export const statusEnum = pgEnum("status", ["ativo", "inativo"]);
export const connectionStatusEnum = pgEnum("connection_status", ["open", "close", "connecting"]);

// User
export const userTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    status: statusEnum("status").notNull().default("inativo"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastAccess: timestamp("last_access", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRelations = relations(userTable, ({ many }) => ({
    fluxes: many(fluxesTable),
    numbers: many(numbersTable)
}));

// Flux - Os fluxos do n8n
export const fluxesTable = pgTable("fluxes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    message: text("message"),
    documentURL: text("document_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
});

export const fluxesRelations = relations(fluxesTable, ({ one, many }) => ({
    user: one(userTable, {
        fields: [fluxesTable.userId],
        references: [userTable.id]
    }),
    numbers: many(numbersTable),
    contacts: many(contactsTable),
}));

// Numbers - Números de whatsapp conectados
export const numbersTable = pgTable("numbers", {
    id: uuid().primaryKey().defaultRandom(),
    fluxId: uuid("flux_id").references(() => fluxesTable.id, { onDelete: "set null" }), // A conexão do evolution-api pode estar em até um fluxo
    // Mantem-se as informações do evolution-api para que possamos criar um rotina de deletar instâncias em desuso
    // Só após deletar a instância em desuso no evolution-api poderemos apagar esse número do banco de dados
    userId: uuid("user_id").references(() => userTable.id, { onDelete: "set null" }),
    remoteJid: text("remote_jid").notNull(), // Número no evolution-api
    instanceName: text("instance_name").notNull(), // Nome da instância no evolution-api
    token: text().notNull(), // token da evolution-api
    connectionStatus: connectionStatusEnum("connection_status").notNull().default("open"), // Status da conexão do whatsapp com o evolution-api
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});


export const numberRelations = relations(numbersTable, ({ one }) => ({
    user: one(userTable, {
        fields: [numbersTable.userId],
        references: [userTable.id]
    }),
    flux: one(fluxesTable, {
        fields: [numbersTable.fluxId],
        references: [fluxesTable.id]
    })
}));

// Contacts - Números dos clientes das planilhas
export const contactsTable = pgTable("contacts", {
    id: uuid("id").primaryKey().defaultRandom(),
    fluxId: uuid("flux_id").notNull().references(() => fluxesTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    lastMessageSent: timestamp("last_message_sent", { withTimezone: true }),
    success: boolean("success").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactsRelations = relations(contactsTable, ({ one }) => ({
    flux: one(fluxesTable, {
        fields: [contactsTable.fluxId],
        references: [fluxesTable.id]
    })
}));

// Types
export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;
export type Flux = typeof fluxesTable.$inferSelect;
export type NewFlux = typeof fluxesTable.$inferInsert;
export type Number = typeof numbersTable.$inferSelect;
export type NewNumber = typeof numbersTable.$inferInsert;
export type Contact = typeof contactsTable.$inferSelect;
export type NewContact = typeof contactsTable.$inferInsert;