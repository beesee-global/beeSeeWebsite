-- Run this if product_specs_highlight was already added by the earlier migration.
ALTER TABLE products
  ADD COLUMN product_specs_highlight_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER product_specs_highlight;
