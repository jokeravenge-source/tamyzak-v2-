-- Allow administrators to upload Malazam PDFs up to 1 GiB.
-- The project-wide Storage limit must be at least this value as well.
UPDATE storage.buckets
SET file_size_limit = 1073741824
WHERE id = 'malazam-files';
