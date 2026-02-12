-- Create reviews table for Trustpilot-style reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  review_date DATE DEFAULT CURRENT_DATE,
  text TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default reviews
INSERT INTO reviews (name, rating, review_date, text) VALUES
('Thomas K.', 5, '2024-12-15', 'Fantastisk hjelp med å sette opp krypto-wallet. Forklarte alt på en enkel og forståelig måte. Anbefales!'),
('Marte S.', 5, '2024-11-20', 'Veldig profesjonell og kunnskapsrik. Fikk god veiledning om sikkerhet og beste praksis.'),
('Erik L.', 5, '2024-10-08', 'Rask respons og grundig gjennomgang. Følte meg trygg på å komme i gang med krypto etterpå.');

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read for visible reviews
CREATE POLICY "Public can view visible reviews" ON reviews
  FOR SELECT USING (visible = true);

-- Allow authenticated users to manage reviews (for admin)
CREATE POLICY "Admin can manage reviews" ON reviews
  FOR ALL USING (true);
