-- ============================================================
-- Restaura el stock de productos (rollback de reserve_stock)
-- Se usa cuando falla el insert de la orden o el cupón
-- ============================================================
CREATE OR REPLACE FUNCTION restore_stock(p_items JSONB)
RETURNS TEXT AS $$
DECLARE
  item JSONB;
  product_id TEXT;
  qty INTEGER;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    product_id := item->>'id';
    qty := (item->>'quantity')::INTEGER;

    UPDATE products
    SET stock = stock + qty
    WHERE id = product_id;
  END LOOP;

  RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Incrementa uses_count de forma atómica con validación de límite
-- Previene race conditions cuando dos órdenes usan el mismo cupón
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE coupons
  SET uses_count = uses_count + 1
  WHERE code = p_code
    AND (max_uses IS NULL OR uses_count < max_uses)
  RETURNING uses_count INTO new_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El cupón ya alcanzó el límite de usos';
  END IF;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;
