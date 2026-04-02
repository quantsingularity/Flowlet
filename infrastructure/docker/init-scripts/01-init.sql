-- Flowlet Database Initialization
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create application schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS ledger;
CREATE SCHEMA IF NOT EXISTS kyc;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA auth TO flowlet;
GRANT ALL PRIVILEGES ON SCHEMA wallet TO flowlet;
GRANT ALL PRIVILEGES ON SCHEMA payments TO flowlet;
GRANT ALL PRIVILEGES ON SCHEMA ledger TO flowlet;
GRANT ALL PRIVILEGES ON SCHEMA kyc TO flowlet;

-- Grant usage on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO flowlet;
ALTER DEFAULT PRIVILEGES IN SCHEMA wallet GRANT ALL ON TABLES TO flowlet;
ALTER DEFAULT PRIVILEGES IN SCHEMA payments GRANT ALL ON TABLES TO flowlet;
ALTER DEFAULT PRIVILEGES IN SCHEMA ledger GRANT ALL ON TABLES TO flowlet;
ALTER DEFAULT PRIVILEGES IN SCHEMA kyc GRANT ALL ON TABLES TO flowlet;
