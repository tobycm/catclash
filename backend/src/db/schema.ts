import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  comments: many(comments),
  votes: many(votes),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const cats = pgTable(
  "cats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Matches your file system: "a4/d3/a4d3...webp"
    // We store just the hash filename: "a4d3...webp"
    filename: text("filename").unique().notNull(),

    // The Simplified Score (+1 / -1)
    score: integer("score").default(0).notNull(),

    wins: integer("wins").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),

    // For your Gemini moderation or manual hiding
    isFlagged: boolean("is_flagged").default(false),
  },
  (table) => ({
    // Index for fast ranking queries (ORDER BY score DESC)
    scoreIdx: index("score_idx").on(table.score),
  })
);

export const votes = pgTable("votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  winnerId: uuid("winner_id")
    .references(() => cats.id)
    .notNull(),
  loserId: uuid("loser_id")
    .references(() => cats.id)
    .notNull(),
  userId: text("user_id").references(() => user.id), // Nullable (anonymous votes)
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  catId: uuid("cat_id")
    .references(() => cats.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONS (For easy querying) ---

// A Cat has many Comments and Votes
export const catsRelations = relations(cats, ({ many }) => ({
  comments: many(comments),
  votesWon: many(votes, { relationName: "winner" }),
  votesLost: many(votes, { relationName: "loser" }),
}));

// A User has many Comments and Votes
export const usersRelations = relations(user, ({ many }) => ({
  comments: many(comments),
  votes: many(votes),
}));

// A Comment belongs to one User and one Cat
export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  cat: one(cats, {
    fields: [comments.catId],
    references: [cats.id],
  }),
}));

// A Vote belongs to one User (optional), one Winner, one Loser
export const votesRelations = relations(votes, ({ one }) => ({
  user: one(user, {
    fields: [votes.userId],
    references: [user.id],
  }),
  winner: one(cats, {
    fields: [votes.winnerId],
    references: [cats.id],
    relationName: "winner",
  }),
  loser: one(cats, {
    fields: [votes.loserId],
    references: [cats.id],
    relationName: "loser",
  }),
}));
