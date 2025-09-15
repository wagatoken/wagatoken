-- Migration: Add missing batch_requests table
-- This table tracks batch requests from smart contract

CREATE TABLE IF NOT EXISTS "batch_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "batch_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" bigint NOT NULL,
	"requester" varchar(42) NOT NULL,
	"requestedQuantity" integer NOT NULL,
	"requestDetails" text,
	"request_timestamp" bigint NOT NULL,
	"isFulfilled" boolean DEFAULT false NOT NULL,
	"fulfilledQuantity" integer DEFAULT 0,
	"fulfilled_timestamp" bigint,
	"requestIndex" integer NOT NULL,
	"transactionHash" varchar(66),
	"block_number" bigint,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"processedBy" varchar(42),
	"processedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_batch_requests_batch_id ON batch_requests(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_requests_requester ON batch_requests(requester);
CREATE INDEX IF NOT EXISTS idx_batch_requests_status ON batch_requests(status);
CREATE INDEX IF NOT EXISTS idx_batch_requests_fulfilled ON batch_requests(isFulfilled);

-- Add comments for documentation
COMMENT ON TABLE batch_requests IS 'Track batch requests from smart contract';
COMMENT ON COLUMN batch_requests.batch_id IS 'References blockchain batch ID';
COMMENT ON COLUMN batch_requests.requester IS 'Address that made the request';
COMMENT ON COLUMN batch_requests.requestedQuantity IS 'Amount of tokens requested';
COMMENT ON COLUMN batch_requests.requestDetails IS 'String details about the request';
COMMENT ON COLUMN batch_requests.request_timestamp IS 'Block timestamp when request was made';
COMMENT ON COLUMN batch_requests.isFulfilled IS 'Whether the request has been fulfilled';
COMMENT ON COLUMN batch_requests.fulfilledQuantity IS 'Amount that was actually fulfilled';
COMMENT ON COLUMN batch_requests.fulfilled_timestamp IS 'Block timestamp when fulfilled';
COMMENT ON COLUMN batch_requests.requestIndex IS 'Index in contract mapping';
COMMENT ON COLUMN batch_requests.transactionHash IS 'Transaction hash of request';
COMMENT ON COLUMN batch_requests.blockNumber IS 'Block number of request';
COMMENT ON COLUMN batch_requests.status IS 'Request status: pending, fulfilled, cancelled';
COMMENT ON COLUMN batch_requests.processedBy IS 'Admin who processed the request';
COMMENT ON COLUMN batch_requests.processedAt IS 'When processed in our system';
