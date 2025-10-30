-- Create second database for training data
CREATE DATABASE cicada_training;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE cicada_training TO cicada_user;

-- Connect to databases and set up (tables will be auto-created by SQLAlchemy)
\c cicada_users;
ALTER DEFAULT PRIVILEGES FOR ROLE cicada_user IN SCHEMA public GRANT ALL ON TABLES TO cicada_user;

\c cicada_training;
ALTER DEFAULT PRIVILEGES FOR ROLE cicada_user IN SCHEMA public GRANT ALL ON TABLES TO cicada_user;
