import { relations } from "drizzle-orm/relations";
import { user, fluxes, session, account, numbers, contacts, metadata } from "./schema";

export const fluxesRelations = relations(fluxes, ({one, many}) => ({
	user: one(user, {
		fields: [fluxes.userId],
		references: [user.id]
	}),
	numbers: many(numbers),
	contacts: many(contacts),
}));

export const userRelations = relations(user, ({many}) => ({
	fluxes: many(fluxes),
	sessions: many(session),
	accounts: many(account),
	numbers: many(numbers),
	metadata: many(metadata),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const numbersRelations = relations(numbers, ({one}) => ({
	flux: one(fluxes, {
		fields: [numbers.fluxId],
		references: [fluxes.id]
	}),
	user: one(user, {
		fields: [numbers.userId],
		references: [user.id]
	}),
}));

export const contactsRelations = relations(contacts, ({one}) => ({
	flux: one(fluxes, {
		fields: [contacts.fluxId],
		references: [fluxes.id]
	}),
}));

export const metadataRelations = relations(metadata, ({one}) => ({
	user: one(user, {
		fields: [metadata.userId],
		references: [user.id]
	}),
}));