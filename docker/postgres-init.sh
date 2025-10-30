#!/bin/bash
set -e

# Create multiple databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE cicada_users;
    CREATE DATABASE cicada_training;
    GRANT ALL PRIVILEGES ON DATABASE cicada_users TO cicada_user;
    GRANT ALL PRIVILEGES ON DATABASE cicada_training TO cicada_user;
EOSQL

echo "Multiple databases created successfully!"
