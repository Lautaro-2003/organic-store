CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer cupones activos"
  ON coupons FOR SELECT
  USING (true);

INSERT INTO coupons (code, discount_percent, active, expires_at)
VALUES ('BIENVENIDO15', 15, true, '2026-12-31 23:59:59-03');
