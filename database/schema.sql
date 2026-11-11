-- Backline CRM - MySQL 8.0+
-- Run this script once from MySQL Workbench after creating the connection.

CREATE DATABASE IF NOT EXISTS backline_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE backline_crm;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  auth_version INT NOT NULL DEFAULT 0,
  role ENUM('ADMIN', 'MANAGER', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  account_status ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(15) NULL UNIQUE,
  erased_at DATETIME NULL,
  address VARCHAR(255) NOT NULL DEFAULT '',
  birth_year SMALLINT NULL,
  birth_date DATE NULL,
  gender ENUM('', 'Nam', 'Nữ', 'Khác') NOT NULL DEFAULT '',
  need VARCHAR(80) NOT NULL DEFAULT 'Chưa xác định',
  need_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback (
  id CHAR(36) PRIMARY KEY,
  customer_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  feedback_type ENUM('Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi') NOT NULL,
  rating TINYINT NOT NULL,
  title VARCHAR(80) NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status ENUM('NEW', 'RESOLVED') NOT NULL DEFAULT 'NEW',
  reply_content TEXT NULL,
  revision INT NOT NULL DEFAULT 0,
  replied_by CHAR(36) NULL,
  replied_at DATETIME NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  hidden_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_feedback_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_feedback_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_feedback_replier FOREIGN KEY (replied_by) REFERENCES users(id),
  INDEX idx_feedback_customer (customer_id),
  INDEX idx_feedback_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS surveys (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NULL,
  status ENUM('DRAFT', 'OPEN', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
  accept_new_customers BOOLEAN NOT NULL DEFAULT FALSE,
  audience_config JSON NULL,
  auto_closed_at DATETIME NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  hidden_at DATETIME NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_survey_creator FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_survey_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_lifecycle_history (
  id CHAR(36) PRIMARY KEY,
  survey_id CHAR(36) NOT NULL,
  actor_id CHAR(36) NOT NULL,
  action VARCHAR(20) NOT NULL,
  old_due_date DATE NULL,
  new_due_date DATE NULL,
  old_status VARCHAR(10) NOT NULL,
  new_status VARCHAR(10) NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys(id),
  FOREIGN KEY (actor_id) REFERENCES users(id),
  INDEX idx_survey_history(survey_id,created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_questions (
  id CHAR(36) PRIMARY KEY,
  survey_id CHAR(36) NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('ONE', 'MULTI', 'TEXT', 'RATING') NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL,
  CONSTRAINT fk_question_survey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  CONSTRAINT uq_question_order UNIQUE (survey_id, display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question_options (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  display_order INT NOT NULL,
  CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE,
  CONSTRAINT uq_option_order UNIQUE (question_id, display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_recipients (
  survey_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (survey_id, customer_id),
  CONSTRAINT fk_recipient_survey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipient_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_responses (
  id CHAR(36) PRIMARY KEY,
  survey_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_response_survey FOREIGN KEY (survey_id) REFERENCES surveys(id),
  CONSTRAINT fk_response_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT uq_response_per_customer UNIQUE (survey_id, customer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS response_details (
  id CHAR(36) PRIMARY KEY,
  response_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  option_id CHAR(36) NULL,
  text_answer TEXT NULL,
  rating_value TINYINT NULL,
  CONSTRAINT fk_detail_response FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
  CONSTRAINT fk_detail_question FOREIGN KEY (question_id) REFERENCES survey_questions(id),
  CONSTRAINT fk_detail_option FOREIGN KEY (option_id) REFERENCES question_options(id),
  CONSTRAINT chk_rating_value CHECK (rating_value IS NULL OR rating_value BETWEEN 1 AND 5)
) ENGINE=InnoDB;


-- Additive migration: no conversion of existing needs into interests.
CREATE TABLE IF NOT EXISTS interests (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS customer_interests (
  customer_id CHAR(36) NOT NULL,
  interest_id VARCHAR(32) NOT NULL,
  PRIMARY KEY(customer_id,interest_id),
  CONSTRAINT fk_interest_customer FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_interest_catalog FOREIGN KEY(interest_id) REFERENCES interests(id)
) ENGINE=InnoDB;
INSERT INTO interests(id,name) VALUES ('gaming','Gaming'),('design','Đồ họa'),('office','Văn phòng'),('programming','Lập trình'),('learning','Học tập'),('other','Khác')
ON DUPLICATE KEY UPDATE name=VALUES(name);
