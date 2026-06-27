-- SQL MIGRATION FOR WALLET & PAYMENT SYSTEM

-- 1. Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'payout_refund', 'question_earnings');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Drop existing wallet tables to ensure clean slate (avoids type conflicts from previous partial runs)
DROP TABLE IF EXISTS public.withdrawal_requests CASCADE;
DROP TABLE IF EXISTS public.bank_details CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;

-- 3. Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_profile_wallet UNIQUE (profile_id),
    CONSTRAINT positive_balance CHECK (balance >= 0.00)
);

CREATE INDEX IF NOT EXISTS idx_wallets_profile ON public.wallets(profile_id);

-- 3. Create wallet_transactions table (Ledger)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL, -- Positive for credit, negative for debit
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    reference_id VARCHAR(255), -- Razorpay Order ID, Razorpay Transfer ID, or Question ID
    description TEXT,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON public.wallet_transactions(reference_id);

-- 4. Create bank_details table
CREATE TABLE IF NOT EXISTS public.bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(255),
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    verification_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_profile_bank UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_bank_details_profile ON public.bank_details(profile_id);

-- 5. Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    bank_details_id UUID NOT NULL REFERENCES public.bank_details(id),
    status withdrawal_status NOT NULL DEFAULT 'pending',
    payout_id VARCHAR(255),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT min_withdrawal_amount CHECK (amount >= 100.00)
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_profile ON public.withdrawal_requests(profile_id);

-- 6. Trigger to update wallet balance automatically when transactions change to completed
CREATE OR REPLACE FUNCTION update_wallet_balance_from_ledger()
RETURNS TRIGGER AS $$
BEGIN
    -- On new transaction inserted as completed
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
        UPDATE public.wallets 
        SET balance = balance + NEW.amount, updated_at = now()
        WHERE id = NEW.wallet_id;
    -- On transaction updated to completed
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
        UPDATE public.wallets 
        SET balance = balance + NEW.amount, updated_at = now()
        WHERE id = NEW.wallet_id;
    -- On transaction updated from completed to failed/reversed
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status IN ('failed', 'reversed')) THEN
        UPDATE public.wallets 
        SET balance = balance - OLD.amount, updated_at = now()
        WHERE id = NEW.wallet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_wallet_balance ON public.wallet_transactions;
CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT OR UPDATE ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance_from_ledger();

-- 7. Trigger to automatically initialize a wallet when a new profile is created
CREATE OR REPLACE FUNCTION initialize_profile_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (profile_id, balance, currency)
    VALUES (NEW.id, 0.00, 'INR')
    ON CONFLICT (profile_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_initialize_profile_wallet ON public.profiles;
CREATE TRIGGER trg_initialize_profile_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION initialize_profile_wallet();

-- 8. Initialize wallets for all existing profiles that don't have one
INSERT INTO public.wallets (profile_id, balance, currency)
SELECT id, 0.00, 'INR' FROM public.profiles
ON CONFLICT (profile_id) DO NOTHING;

-- 9. Row-Level Security (RLS) policies
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 9a. Wallets Policies
DROP POLICY IF EXISTS "Allow users to view their own wallet" ON public.wallets;
CREATE POLICY "Allow users to view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid()::text = profile_id);

DROP POLICY IF EXISTS "Allow users to insert their own wallet" ON public.wallets;
CREATE POLICY "Allow users to insert their own wallet" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);

-- 9b. Wallet Transactions Policies
DROP POLICY IF EXISTS "Allow users to view their own transactions" ON public.wallet_transactions;
CREATE POLICY "Allow users to view their own transactions" ON public.wallet_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wallets 
            WHERE wallets.id = wallet_transactions.wallet_id AND wallets.profile_id = auth.uid()::text
        )
    );

-- 9c. Bank Details Policies
DROP POLICY IF EXISTS "Allow users to manage their own bank details" ON public.bank_details;
CREATE POLICY "Allow users to manage their own bank details" ON public.bank_details
    FOR ALL USING (auth.uid()::text = profile_id);

-- 9d. Withdrawal Requests Policies
DROP POLICY IF EXISTS "Allow users to manage their own withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Allow users to manage their own withdrawals" ON public.withdrawal_requests
    FOR ALL USING (auth.uid()::text = profile_id);
