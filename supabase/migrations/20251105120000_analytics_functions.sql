-- Analytics RPC Functions for Primariga
-- Run this in Supabase SQL Editor to enable view/click tracking

-- Function to increment book view count
CREATE OR REPLACE FUNCTION increment_book_view(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET 
    views_count = COALESCE(views_count, 0) + 1,
    updated_at = NOW()
  WHERE id = book_id;
END;
$$;

-- Function to increment book click count (purchase link clicks)
CREATE OR REPLACE FUNCTION increment_book_click(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET 
    clicks_count = COALESCE(clicks_count, 0) + 1,
    updated_at = NOW()
  WHERE id = book_id;
END;
$$;

-- Add columns if they don't exist
ALTER TABLE books
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_count integer DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_views_count ON books(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_clicks_count ON books(clicks_count DESC);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_book_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_book_click(uuid) TO anon, authenticated;
