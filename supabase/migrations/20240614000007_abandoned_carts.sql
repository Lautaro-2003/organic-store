CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  items JSONB NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user ON abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_reminder ON abandoned_carts(reminder_sent, updated_at);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden insertar/actualizar su propio carrito"
  ON abandoned_carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio carrito"
  ON abandoned_carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden ver su propio carrito"
  ON abandoned_carts FOR SELECT
  USING (auth.uid() = user_id);
