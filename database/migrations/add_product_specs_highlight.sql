-- Run once against the ecommerce database.
-- The API stores the S3-compatible object URL in this column.
ALTER TABLE products
  ADD COLUMN product_specs_highlight TEXT NULL AFTER brochure_url,
  ADD COLUMN product_specs_highlight_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER product_specs_highlight;
