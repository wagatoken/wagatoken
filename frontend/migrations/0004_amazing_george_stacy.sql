ALTER TABLE "waga_coffee_batches" DROP CONSTRAINT "waga_coffee_batches_batchid_unique";--> statement-breakpoint
ALTER TABLE "waga_coffee_batches" ADD COLUMN "batch_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "waga_coffee_batches" ADD COLUMN "last_verified_timestamp" bigint;--> statement-breakpoint
ALTER TABLE "waga_coffee_batches" DROP COLUMN "batchid";--> statement-breakpoint
ALTER TABLE "waga_coffee_batches" DROP COLUMN "lastverifiedtimestamp";--> statement-breakpoint
ALTER TABLE "waga_coffee_batches" ADD CONSTRAINT "waga_coffee_batches_batch_id_unique" UNIQUE("batch_id");