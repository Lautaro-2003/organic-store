-- Ejecutar este SQL en el SQL Editor de Supabase (https://supabase.com/dashboard/project/_/sql/new)
-- Crea la tabla de productos e inserta los datos iniciales

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  image TEXT DEFAULT '',
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  rating DOUBLE PRECISION DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar productos iniciales (solo si la tabla está vacía)
INSERT INTO products (id, name, price, image, category, description, rating, stock)
SELECT * FROM (VALUES
  ('1', 'Almendras Premium Peladas', 5500, 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80', 'Frutos Secos', 'Almendras enteras, peladas y seleccionadas de la más alta calidad. Ricas en vitamina E, calcio y grasas saludables.', 4.8, 25),
  ('2', 'Granola Orgánica Tradicional', 4200, 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80', 'Orgánicos', 'Mezcla crocante de avena entera, semillas de girasol, pasas de uva y almendras, endulzada naturalmente.', 4.6, 18),
  ('3', 'Miel Natural de Abeja Pura', 3800, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 'Orgánicos', 'Miel de abeja 100% pura y cruda, extraída en frío de colmenas ubicadas en zonas libres de pesticidas.', 4.9, 12),
  ('4', 'Nueces Mariposa Extra Light', 6200, 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80', 'Frutos Secos', 'Nueces mariposa extra light de sabor suave, perfectas para repostería, ensaladas o como snack saludable.', 4.7, 30),
  ('5', 'Aceite de Coco Neutro', 7100, 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80', 'Orgánicos', 'Aceite de coco neutro prensado en frío. Ideal para cocinar a altas temperaturas sin alterar el sabor de tus platos.', 4.5, 15),
  ('6', 'Harina de Almendras Fina', 4800, 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80', 'Harinas', '100% almendras molidas finamente. Ideal para recetas cetogénicas (keto), sin gluten y repostería saludable.', 4.8, 20)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- ============================================================
-- Tabla de órdenes de compra
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS: cada usuario solo ve sus propias órdenes
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias órdenes"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias órdenes"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
