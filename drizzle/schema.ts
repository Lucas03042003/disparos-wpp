import { pgTable, text, timestamp, boolean, integer, uuid, foreignKey, varchar, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const connectionStatus = pgEnum("connection_status", ['open', 'close', 'connecting'])
export const status = pgEnum("status", ['ativo', 'inativo'])
export const stepType = pgEnum("step_type", ['text', 'image', 'video'])


export const subscription = pgTable("subscription", {
	id: text().primaryKey().notNull(),
	plan: text().notNull(),
	referenceId: text("reference_id").notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	status: text().default('incomplete'),
	periodStart: timestamp("period_start", { mode: 'string' }),
	periodEnd: timestamp("period_end", { mode: 'string' }),
	trialStart: timestamp("trial_start", { mode: 'string' }).defaultNow(),
	trialEnd: timestamp("trial_end", { mode: 'string' }).default(sql`(now() + '7 days'::interval)`),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	seats: integer(),
});

export const steps = pgTable("steps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fluxId: text("flux_id").notNull(),
	stepPosition: integer().notNull(),
	stepType: stepType("step_type").default('text').notNull(),
	message: text(),
	documentUrl: text("document_url"),
});

export const fluxes = pgTable("fluxes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	message: text(),
	documentUrl: text("document_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "fluxes_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	status: status().default('ativo').notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const numbers = pgTable("numbers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fluxId: uuid("flux_id"),
	userId: text("user_id"),
	remoteJid: text("remote_jid"),
	instanceName: text("instance_name").notNull(),
	token: text().notNull(),
	connectionStatus: connectionStatus("connection_status").default('close').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fluxId],
			foreignColumns: [fluxes.id],
			name: "numbers_flux_id_fluxes_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "numbers_user_id_user_id_fk"
		}).onDelete("set null"),
	unique("numbers_instance_name_unique").on(table.instanceName),
	unique("numbers_token_unique").on(table.token),
]);

export const contacts = pgTable("contacts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fluxId: uuid("flux_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	lastMessageSent: timestamp("last_message_sent", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	numberSuccess: integer("number_success").default(0).notNull(),
	numberFails: integer("number_fails").default(0).notNull(),
	step: integer().default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fluxId],
			foreignColumns: [fluxes.id],
			name: "contacts_flux_id_fluxes_id_fk"
		}).onDelete("cascade"),
]);

export const metadata = pgTable("metadata", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id"),
	activeNumbers: integer("active_numbers").default(0),
	activeFluxes: integer("active_fluxes").default(0),
	successfulContacts: integer("successful_contacts").default(0),
	unsuccessfulContacts: integer("unsuccessful_contacts").default(0),
	messagesSentToday: integer("messages_sent_today").default(0),
	totalContacts: integer("total_contacts").default(0),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "metadata_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
