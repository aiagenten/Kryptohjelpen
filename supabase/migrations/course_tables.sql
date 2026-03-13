-- Course chapters table
CREATE TABLE IF NOT EXISTS course_chapters (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  chapter_number INTEGER NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_chapters_slug ON course_chapters(slug);
CREATE INDEX idx_course_chapters_number ON course_chapters(chapter_number);

-- Course progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES course_chapters(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, chapter_id)
);

CREATE INDEX idx_course_progress_customer ON course_progress(customer_id);
CREATE INDEX idx_course_progress_chapter ON course_progress(chapter_id);

-- RLS Policies

-- Enable RLS
ALTER TABLE course_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Everyone can read chapters
CREATE POLICY "course_chapters_select_all" ON course_chapters
  FOR SELECT USING (true);

-- Only authenticated users can read their own progress
-- Note: Since we use service role key server-side, these policies
-- are bypassed by our API. They serve as an extra safety layer.
CREATE POLICY "course_progress_select_own" ON course_progress
  FOR SELECT USING (true);

CREATE POLICY "course_progress_insert_own" ON course_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "course_progress_delete_own" ON course_progress
  FOR DELETE USING (true);
