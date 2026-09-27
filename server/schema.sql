-- =============================================================================
-- SMART SCHOOL INFRASTRUCTURE & SAFETY MONITORING SYSTEM (ENTERPRISE SAAS)
-- PostgreSQL Relational Database Schema Architecture (Requirements 24 & 25)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS
CREATE TABLE schools (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    total_classrooms INT DEFAULT 0,
    total_sensors INT DEFAULT 0,
    principal_name VARCHAR(150),
    emergency_contact VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & RBAC
CREATE TYPE user_role_enum AS ENUM ('admin', 'teacher', 'maintenance', 'supervisor');

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'teacher',
    department VARCHAR(150),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BUILDINGS
CREATE TYPE safety_status_enum AS ENUM ('safe', 'warning', 'critical');

CREATE TABLE buildings (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(100),
    floors INT DEFAULT 1,
    total_rooms INT DEFAULT 0,
    status safety_status_enum DEFAULT 'safe',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. FLOORS
CREATE TABLE floors (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    name VARCHAR(100),
    total_rooms INT DEFAULT 0
);

-- 5. ROOMS / CLASSROOMS
CREATE TABLE rooms (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id VARCHAR(64) REFERENCES floors(id) ON DELETE SET NULL,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(100) DEFAULT 'Classroom',
    student_capacity INT DEFAULT 45,
    current_students INT DEFAULT 0,
    status safety_status_enum DEFAULT 'safe',
    temperature NUMERIC(4,1) DEFAULT 26.5,
    smoke_status VARCHAR(50) DEFAULT 'Normal',
    electrical_status VARCHAR(50) DEFAULT 'Normal',
    water_leakage_status VARCHAR(50) DEFAULT 'None',
    open_issues_count INT DEFAULT 0,
    assigned_teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    last_inspection_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SENSORS (IoT Telemetry Mesh)
CREATE TYPE sensor_type_enum AS ENUM ('temperature', 'smoke', 'water', 'electrical', 'air_quality', 'vibration');
CREATE TYPE sensor_status_enum AS ENUM ('online', 'warning', 'critical', 'offline');

CREATE TABLE sensors (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE SET NULL,
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
    sensor_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. TMP-101, SMK-202
    name VARCHAR(150) NOT NULL,
    type sensor_type_enum NOT NULL,
    current_value VARCHAR(100),
    numeric_value NUMERIC(8,2),
    unit VARCHAR(20),
    status sensor_status_enum DEFAULT 'online',
    battery_percentage INT DEFAULT 100,
    threshold_min NUMERIC(8,2),
    threshold_max NUMERIC(8,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SENSOR READINGS (Time-series log)
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(64) REFERENCES sensors(id) ON DELETE CASCADE,
    numeric_value NUMERIC(8,2) NOT NULL,
    raw_payload JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sensor_readings_sensor_time ON sensor_readings(sensor_id, recorded_at DESC);

-- 8. MAINTENANCE TEAMS
CREATE TABLE maintenance_teams (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    lead_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    contact_number VARCHAR(50),
    active_tasks INT DEFAULT 0,
    completed_tasks INT DEFAULT 0
);

-- 9. PROBLEMS (Tickets)
CREATE TYPE issue_status_enum AS ENUM ('REPORTED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED');
CREATE TYPE priority_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE problems (
    id VARCHAR(64) PRIMARY KEY,
    issue_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. SCH-2026-00124
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE SET NULL,
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location_type VARCHAR(100) NOT NULL,
    exact_location TEXT NOT NULL,
    priority priority_level_enum DEFAULT 'medium',
    status issue_status_enum DEFAULT 'REPORTED',
    reported_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    reported_date DATE DEFAULT CURRENT_DATE,
    reported_time VARCHAR(20),
    assigned_team_id VARCHAR(64) REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    assigned_technician_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    expected_resolution TIMESTAMP WITH TIME ZONE,
    before_image_url TEXT,
    after_image_url TEXT,
    maintenance_notes TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50) DEFAULT 'human',
    sensor_id VARCHAR(64) REFERENCES sensors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_problems_status_priority ON problems(status, priority);

-- 10. PROBLEM IMAGES
CREATE TABLE problem_images (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) REFERENCES problems(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'reported',
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. SAFETY ALERTS & ESCALATION
CREATE TYPE alert_severity_enum AS ENUM ('critical', 'warning', 'info');

CREATE TABLE alerts (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    alert_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    location TEXT NOT NULL,
    building VARCHAR(100),
    severity alert_severity_enum DEFAULT 'warning',
    source VARCHAR(100) DEFAULT 'IoT Sensor',
    sensor_id VARCHAR(64) REFERENCES sensors(id) ON DELETE SET NULL,
    problem_id VARCHAR(64) REFERENCES problems(id) ON DELETE SET NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(150),
    escalation_level INT DEFAULT 1,
    escalation_timer_seconds INT DEFAULT 120,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. ISSUE HISTORY & AUDIT TRAIL
CREATE TABLE issue_history (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) REFERENCES problems(id) ON DELETE CASCADE,
    status issue_status_enum NOT NULL,
    updated_by VARCHAR(150) NOT NULL,
    comment TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. NOTIFICATIONS
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    issue_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. RECURRING INFRASTRUCTURE ANALYTICS
CREATE TABLE recurring_analytics (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    location_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    incident_count INT DEFAULT 0,
    timeframe VARCHAR(100),
    risk_level VARCHAR(50),
    recommendation TEXT,
    root_cause TEXT,
    estimated_preventive_savings VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
