ALTER TABLE tickets
    ADD COLUMN triage_confidence NUMERIC(3, 2),
    ADD COLUMN triage_justification VARCHAR(500);

UPDATE tickets
SET triage_confidence = 0.50,
    triage_justification = 'Classificação anterior sem justificativa registrada.'
WHERE triage_status = 'COMPLETED';

ALTER TABLE tickets DROP CONSTRAINT consistent_triage;
ALTER TABLE tickets DROP CONSTRAINT tickets_suggested_category_check;

ALTER TABLE tickets
    ADD CONSTRAINT valid_suggested_category CHECK (
        suggested_category IN ('HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'EMAIL', 'OTHER')
    ),
    ADD CONSTRAINT valid_triage_confidence CHECK (
        triage_confidence IS NULL OR triage_confidence BETWEEN 0.00 AND 1.00
    ),
    ADD CONSTRAINT valid_triage_justification CHECK (
        triage_justification IS NULL OR length(trim(triage_justification)) > 0
    ),
    ADD CONSTRAINT consistent_triage CHECK (
        (triage_status = 'PENDING'
            AND suggested_priority IS NULL
            AND suggested_category IS NULL
            AND triage_confidence IS NULL
            AND triage_justification IS NULL)
        OR (triage_status = 'COMPLETED'
            AND suggested_priority IS NOT NULL
            AND suggested_category IS NOT NULL
            AND triage_confidence IS NOT NULL
            AND triage_justification IS NOT NULL)
    );