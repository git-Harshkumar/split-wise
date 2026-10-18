-- SplitWise Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'You',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- People table (friends/contacts)
CREATE TABLE public.people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Groups table
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '👥',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group members junction table
CREATE TABLE public.group_members (
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, person_id)
);

-- Expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    payer_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    group_name_snapshot TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense participants junction table
CREATE TABLE public.expense_participants (
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
    share_paise BIGINT NOT NULL CHECK (share_paise >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (expense_id, person_id)
);

-- Settlements table
CREATE TABLE public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
    to_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (from_person_id != to_person_id)
);

-- Indexes for performance & unique constraints
CREATE UNIQUE INDEX idx_people_owner_id_lower_name ON public.people(owner_id, LOWER(name));
CREATE UNIQUE INDEX idx_groups_owner_id_lower_name ON public.groups(owner_id, LOWER(name));
CREATE INDEX idx_people_owner_id ON public.people(owner_id);
CREATE INDEX idx_groups_owner_id ON public.groups(owner_id);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_person_id ON public.group_members(person_id);
CREATE INDEX idx_expenses_owner_id ON public.expenses(owner_id);
CREATE INDEX idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX idx_expenses_payer_id ON public.expenses(payer_id);
CREATE INDEX idx_expense_participants_expense_id ON public.expense_participants(expense_id);
CREATE INDEX idx_expense_participants_person_id ON public.expense_participants(person_id);
CREATE INDEX idx_settlements_owner_id ON public.settlements(owner_id);
CREATE INDEX idx_settlements_from_person_id ON public.settlements(from_person_id);
CREATE INDEX idx_settlements_to_person_id ON public.settlements(to_person_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for people
CREATE POLICY "Users can view own people" ON public.people
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own people" ON public.people
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own people" ON public.people
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own people" ON public.people
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for groups
CREATE POLICY "Users can view own groups" ON public.groups
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own groups" ON public.groups
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own groups" ON public.groups
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for group_members
CREATE POLICY "Users can view own group members" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups g
            WHERE g.id = group_members.group_id
            AND g.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own group members" ON public.group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.groups g
            WHERE g.id = group_members.group_id
            AND g.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own group members" ON public.group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.groups g
            WHERE g.id = group_members.group_id
            AND g.owner_id = auth.uid()
        )
    );

-- RLS Policies for expenses
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for expense_participants
CREATE POLICY "Users can view own expense participants" ON public.expense_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.expenses e
            WHERE e.id = expense_participants.expense_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own expense participants" ON public.expense_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.expenses e
            WHERE e.id = expense_participants.expense_id
            AND e.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own expense participants" ON public.expense_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.expenses e
            WHERE e.id = expense_participants.expense_id
            AND e.owner_id = auth.uid()
        )
    );

-- RLS Policies for settlements
CREATE POLICY "Users can view own settlements" ON public.settlements
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own settlements" ON public.settlements
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own settlements" ON public.settlements
    FOR DELETE USING (auth.uid() = owner_id);

-- Function to create default person for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'You'))
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.people (id, owner_id, name)
    VALUES (uuid_generate_v4(), NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'You'))
    ON CONFLICT DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON public.people
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create expense with participants atomically
CREATE OR REPLACE FUNCTION public.create_expense_with_participants(
    p_owner_id UUID,
    p_description TEXT,
    p_amount_paise BIGINT,
    p_payer_id UUID,
    p_group_id UUID,
    p_expense_date DATE,
    p_participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
    v_expense_id UUID;
    v_share_paise BIGINT;
    v_remainder BIGINT;
    i INTEGER;
BEGIN
    -- Insert expense
    INSERT INTO public.expenses (owner_id, description, amount_paise, payer_id, group_id, group_name_snapshot, expense_date)
    SELECT p_owner_id, p_description, p_amount_paise, p_payer_id, p_group_id, g.name, p_expense_date
    FROM public.groups g
    WHERE g.id = p_group_id
    UNION ALL
    SELECT p_owner_id, p_description, p_amount_paise, p_payer_id, NULL, NULL, p_expense_date
    WHERE p_group_id IS NULL
    RETURNING id INTO v_expense_id;

    -- Calculate equal shares
    v_share_paise := p_amount_paise / array_length(p_participant_ids, 1);
    v_remainder := p_amount_paise % array_length(p_participant_ids, 1);

    -- Insert participants with shares
    FOR i IN 1..array_length(p_participant_ids, 1) LOOP
        INSERT INTO public.expense_participants (expense_id, person_id, share_paise)
        VALUES (
            v_expense_id,
            p_participant_ids[i],
            v_share_paise + CASE WHEN i <= v_remainder THEN 1 ELSE 0 END
        );
    END LOOP;

    RETURN v_expense_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate balances
CREATE OR REPLACE FUNCTION public.calculate_balances(p_owner_id UUID)
RETURNS TABLE (
    person_id UUID,
    person_name TEXT,
    total_paid BIGINT,
    total_owed BIGINT,
    net_balance BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH paid AS (
        SELECT
            e.payer_id AS person_id,
            COALESCE(SUM(e.amount_paise), 0)::BIGINT AS total_paid
        FROM public.expenses e
        WHERE e.owner_id = p_owner_id
        GROUP BY e.payer_id
    ),
    owed AS (
        SELECT
            ep.person_id,
            COALESCE(SUM(ep.share_paise), 0)::BIGINT AS total_owed
        FROM public.expense_participants ep
        JOIN public.expenses e ON e.id = ep.expense_id
        WHERE e.owner_id = p_owner_id
        GROUP BY ep.person_id
    ),
    settled AS (
        SELECT
            s.from_person_id AS person_id,
            COALESCE(SUM(s.amount_paise), 0)::BIGINT AS total_settled_from
        FROM public.settlements s
        WHERE s.owner_id = p_owner_id
        GROUP BY s.from_person_id
    ),
    received AS (
        SELECT
            s.to_person_id AS person_id,
            COALESCE(SUM(s.amount_paise), 0)::BIGINT AS total_received
        FROM public.settlements s
        WHERE s.owner_id = p_owner_id
        GROUP BY s.to_person_id
    ),
    combined AS (
        SELECT
            p.id AS person_id,
            p.name AS person_name,
            COALESCE(paid.total_paid, 0)::BIGINT AS total_paid,
            COALESCE(owed.total_owed, 0)::BIGINT AS total_owed,
            COALESCE(settled.total_settled_from, 0)::BIGINT AS total_settled_from,
            COALESCE(received.total_received, 0)::BIGINT AS total_received
        FROM public.people p
        LEFT JOIN paid ON paid.person_id = p.id
        LEFT JOIN owed ON owed.person_id = p.id
        LEFT JOIN settled ON settled.person_id = p.id
        LEFT JOIN received ON received.person_id = p.id
        WHERE p.owner_id = p_owner_id
    )
    SELECT
        combined.person_id,
        combined.person_name,
        combined.total_paid,
        combined.total_owed,
        (combined.total_paid - combined.total_owed - combined.total_settled_from + combined.total_received)::BIGINT AS net_balance
    FROM combined;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get simplified settlements (who owes whom)
CREATE OR REPLACE FUNCTION public.get_simplified_settlements(p_owner_id UUID)
RETURNS TABLE (
    from_person_id UUID,
    from_person_name TEXT,
    to_person_id UUID,
    to_person_name TEXT,
    amount_paise BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH balances AS (
        SELECT b.person_id, b.person_name, b.net_balance FROM public.calculate_balances(p_owner_id) b
    ),
    creditors AS (
        SELECT b.person_id, b.person_name, b.net_balance
        FROM balances b
        WHERE b.net_balance > 0
        ORDER BY b.net_balance DESC
    ),
    debtors AS (
        SELECT b.person_id, b.person_name, -b.net_balance AS amount_owed
        FROM balances b
        WHERE b.net_balance < 0
        ORDER BY amount_owed DESC
    ),
    settlements AS (
        SELECT
            d.person_id AS from_person_id,
            d.person_name AS from_person_name,
            c.person_id AS to_person_id,
            c.person_name AS to_person_name,
            LEAST(d.amount_owed, c.net_balance)::BIGINT AS amount_paise,
            (d.amount_owed - LEAST(d.amount_owed, c.net_balance))::BIGINT AS remaining_debt,
            (c.net_balance - LEAST(d.amount_owed, c.net_balance))::BIGINT AS remaining_credit
        FROM debtors d
        CROSS JOIN LATERAL (
            SELECT cr.person_id, cr.person_name, cr.net_balance FROM creditors cr
            WHERE cr.net_balance > 0
            ORDER BY cr.net_balance DESC
            LIMIT 1
        ) c
        WHERE d.amount_owed > 0
    )
    SELECT s.from_person_id, s.from_person_name, s.to_person_id, s.to_person_name, s.amount_paise::BIGINT
    FROM settlements s
    WHERE s.amount_paise > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete all user data (for settings clear all)
CREATE OR REPLACE FUNCTION public.delete_all_user_data(p_owner_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.settlements WHERE owner_id = p_owner_id;
    DELETE FROM public.expense_participants WHERE expense_id IN (SELECT id FROM public.expenses WHERE owner_id = p_owner_id);
    DELETE FROM public.expenses WHERE owner_id = p_owner_id;
    DELETE FROM public.group_members WHERE group_id IN (SELECT id FROM public.groups WHERE owner_id = p_owner_id);
    DELETE FROM public.groups WHERE owner_id = p_owner_id;
    DELETE FROM public.people WHERE owner_id = p_owner_id;
    UPDATE public.profiles SET display_name = 'You' WHERE id = p_owner_id;
    -- Keep the default person
    INSERT INTO public.people (owner_id, name)
    SELECT p_owner_id, 'You'
    WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE owner_id = p_owner_id AND name = 'You');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;