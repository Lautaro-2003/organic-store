-- ============================================================
-- Función atómica para reservar stock de múltiples productos
-- Se usa antes de confirmar una orden para evitar race conditions
-- Si algún producto no tiene stock suficiente, se revierte todo
-- ============================================================
CREATE OR REPLACE FUNCTION reserve_stock(p_items JSONB)
RETURNS TEXT AS $$
DECLARE
  item JSONB;
  affected INTEGER;
  product_name TEXT;
  product_id TEXT;
  qty INTEGER;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    product_id := item->>'id';
    qty := (item->>'quantity')::INTEGER;
    product_name := item->>'name';

    UPDATE products
    SET stock = stock - qty
    WHERE id = product_id AND stock >= qty;

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected = 0 THEN
      RAISE EXCEPTION 'Stock insuficiente para %', product_name;
    END IF;
  END LOOP;

  RETURN 'OK';
END;
$$ LANGUAGE plpgsql;
