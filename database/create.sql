DROP TABLE IF EXISTS recommendations, loan_applications, application_profiles, products, customers CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;


CREATE TYPE application_status AS ENUM (
    'PENDING',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    keycloak_user_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE
);



CREATE TABLE application_profiles (
    profile_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    age INT,
    income DOUBLE PRECISION,
    home_ownership VARCHAR(50),
    employment_length_years FLOAT,
    default_on_file CHAR(1),
    credit_history_length_years INT,
    loan_amount NUMERIC(12, 2),
    loan_intent VARCHAR(50),
    loan_grade CHAR(1),
    interest_rate NUMERIC(5, 2),
    loan_term FLOAT,
    percent_income NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(100),
    description TEXT
);


CREATE TABLE loan_applications (
    application_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    profile_id BIGINT NOT NULL REFERENCES application_profiles(profile_id),
    camunda_process_instance_id VARCHAR(255),
    status application_status DEFAULT 'PENDING',
    llm_analysis_result TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE recommendations (
    recommendation_id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES loan_applications(application_id),
    product_id INT NOT NULL REFERENCES products(product_id),
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();


INSERT INTO products (product_id, name, category, description) VALUES
(1, 'Investment Account', 'Finance', 'An account for managing long-term investments.'),
(2, 'Retirement Account', 'Retirement', 'Helps customers save for retirement.'),
(3, 'Insurance Plan', 'Insurance', 'Provides coverage against financial risk.'),
(4, 'Savings Account', 'Banking', 'Basic savings account with interest.'),
(5, 'Credit Card', 'Banking', 'Card for making purchases and managing credit.'),
(6, 'Mobile Banking App', 'Technology', 'App to manage bank accounts via mobile.'),
(7, 'Savings Account', 'Banking', 'Duplicate for testing or tiered savings account.');