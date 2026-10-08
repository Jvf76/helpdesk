CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
    description VARCHAR(10000) NOT NULL CHECK (length(trim(description)) > 0),
    suggested_priority VARCHAR(20) CHECK (suggested_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    suggested_category VARCHAR(20) CHECK (suggested_category IN ('HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'OTHER')),
    triage_status VARCHAR(20) NOT NULL CHECK (triage_status IN ('PENDING', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT consistent_triage CHECK (
        (triage_status = 'PENDING' AND suggested_priority IS NULL AND suggested_category IS NULL)
        OR (triage_status = 'COMPLETED' AND suggested_priority IS NOT NULL AND suggested_category IS NOT NULL)
    )
);
