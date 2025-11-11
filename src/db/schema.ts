import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["ativo", "inativo"]);
export const connectionStatusEnum = pgEnum("connection_status", ["open", "close", "connecting"]);

// Better Auth

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: statusEnum("status").notNull().default("ativo")
});

export const userRelations = relations(userTable, ({ one, many }) => ({
    session: many(sessionTable),
    account: many(accountTable),
    fluxes: many(fluxesTable),
    numbers: many(numbersTable),
    metaData: one(metaDataUsersTable, {
      fields: [userTable.id],
      references: [metaDataUsersTable.userId],
    }),
}));

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const sessionRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id]
    }),
}));

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const accountRelations = relations(accountTable, ({ one }) => ({
    user: one(userTable, {
        fields: [accountTable.userId],
        references: [userTable.id]
    }),
}));

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default("incomplete"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  seats: integer("seats"),
});

//  
// My DATABASE
//

// Flux - Os fluxos do n8n
export const fluxesTable = pgTable("fluxes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),
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
    // Só após deletar a instância em desuso no evolution-api poderemos apagar esse número do banco de data
    userId: text("user_id").references(() => userTable.id, { onDelete: "set null" }),
    remoteJid: text("remote_jid"), // Número no evolution-api
    instanceName: text("instance_name").notNull().unique(), // Nome da instância no evolution-api
    token: text().notNull().unique(), // token da evolution-api
    connectionStatus: connectionStatusEnum("connection_status").notNull().default("close"), // Status da conexão do whatsapp com o evolution-api
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

export const metaDataUsersTable = pgTable("metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => userTable.id, { onDelete: "cascade" }),
  activeNumbers: integer("active_numbers").default(0),
  activeFluxes: integer("active_fluxes").default(0),
  successfulContacts: integer("successful_contacts").default(0),
  unsuccessfulContacts: integer("unsuccessful_contacts").default(0),
  messagesSentToday: integer("messages_sent_today").default(0),
  totalContacts: integer("total_contacts").default(0)
});

export const metaDataUsersRelations = relations(metaDataUsersTable, ({ one }) => ({
    user: one(userTable, {
        fields: [metaDataUsersTable.userId],
        references: [userTable.id]
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