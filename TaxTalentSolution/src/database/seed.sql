-- =====================================================
-- Tax Talent Solution Seed Data
-- 15 Candidates, 2 Employers (2 users each), 2 Admins
-- =====================================================

-- =====================================================
-- SKILLS MASTER DATA
-- =====================================================
INSERT INTO skills_master (id, name, category, is_predefined, usage_count) VALUES
-- Tax Return Types
('11111111-0001-0001-0001-000000000001', '1040 Individual Returns', 'Tax Returns', TRUE, 0),
('11111111-0001-0001-0001-000000000002', '1065 Partnership Returns', 'Tax Returns', TRUE, 0),
('11111111-0001-0001-0001-000000000003', '1120 Corporate Returns', 'Tax Returns', TRUE, 0),
('11111111-0001-0001-0001-000000000004', '1120S S Corporation Returns', 'Tax Returns', TRUE, 0),
('11111111-0001-0001-0001-000000000005', '990 Non-Profit Returns', 'Tax Returns', TRUE, 0),
('11111111-0001-0001-0001-000000000006', '1041 Estate & Trust Returns', 'Tax Returns', TRUE, 0),
-- Software
('11111111-0001-0002-0001-000000000001', 'Drake Software', 'Software', TRUE, 0),
('11111111-0001-0002-0001-000000000002', 'ProSeries', 'Software', TRUE, 0),
('11111111-0001-0002-0001-000000000003', 'Lacerte', 'Software', TRUE, 0),
('11111111-0001-0002-0001-000000000004', 'UltraTax CS', 'Software', TRUE, 0),
('11111111-0001-0002-0001-000000000005', 'CCH Axcess', 'Software', TRUE, 0),
('11111111-0001-0002-0001-000000000006', 'ProConnect Tax', 'Software', TRUE, 0),
-- Compliance
('11111111-0001-0003-0001-000000000001', 'IRS Regulations', 'Compliance', TRUE, 0),
('11111111-0001-0003-0001-000000000002', 'Multi-State Tax Filing', 'Compliance', TRUE, 0),
('11111111-0001-0003-0001-000000000003', 'International Tax Compliance', 'Compliance', TRUE, 0),
('11111111-0001-0003-0001-000000000004', 'FBAR Reporting', 'Compliance', TRUE, 0),
-- Specialized
('11111111-0001-0004-0001-000000000001', 'Tax Planning', 'Specialized', TRUE, 0),
('11111111-0001-0004-0001-000000000002', 'Tax Research', 'Specialized', TRUE, 0),
('11111111-0001-0004-0001-000000000003', 'Private Equity Taxation', 'Specialized', TRUE, 0),
('11111111-0001-0004-0001-000000000004', 'K-1 Reporting', 'Specialized', TRUE, 0);

-- =====================================================
-- ADMIN USERS (2 Admins)
-- =====================================================
INSERT INTO users (id, email, name, phone, role, status, email_verified) VALUES
('aaaaaaaa-0001-0001-0001-000000000001', 'admin@taxtalentsolution.com', 'Rajesh Kumar', '+91 98765 00001', 'admin', 'active', TRUE),
('aaaaaaaa-0001-0001-0001-000000000002', 'superadmin@taxtalentsolution.com', 'Priya Mehta', '+91 98765 00002', 'admin', 'active', TRUE);

INSERT INTO admin_users (id, user_id, role, permissions, status) VALUES
('aaaaaaaa-0002-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000001', 'admin', ARRAY['Full Access', 'User Management', 'Employer Management'], 'active'),
('aaaaaaaa-0002-0001-0001-000000000002', 'aaaaaaaa-0001-0001-0001-000000000002', 'super_admin', ARRAY['Full Access', 'User Management', 'Employer Management', 'System Settings', 'Billing'], 'active');

-- =====================================================
-- EMPLOYERS (2 Companies)
-- =====================================================
INSERT INTO employers (id, company_name, logo_url, website, industry, company_size, headquarters_city, headquarters_state, description, status, subscription_plan, monthly_budget, total_hires) VALUES
('eeeeeeee-0001-0001-0001-000000000001', 'KPMG India', '/images/kpmg-logo.png', 'www.kpmg.com/in', 'Accounting & Tax Services', '1000+', 'Mumbai', 'Maharashtra', 'KPMG India is part of the global network of KPMG International, providing Audit, Tax, and Advisory services.', 'active', 'enterprise', 500000, 45),
('eeeeeeee-0001-0001-0001-000000000002', 'Deloitte India', '/images/deloitte-logo.png', 'www.deloitte.com/in', 'Professional Services', '1000+', 'Bangalore', 'Karnataka', 'Deloitte provides industry-leading audit and assurance, tax and legal, consulting, financial advisory, and risk advisory services.', 'active', 'enterprise', 750000, 67);

-- =====================================================
-- EMPLOYER USERS (2 users per employer = 4 total)
-- =====================================================
INSERT INTO users (id, email, name, phone, role, status, email_verified) VALUES
-- KPMG Users
('eeeeeeee-0002-0001-0001-000000000001', 'recruiter1@kpmg.com', 'Anita Sharma', '+91 98765 10001', 'employer_user', 'active', TRUE),
('eeeeeeee-0002-0001-0001-000000000002', 'recruiter2@kpmg.com', 'Vikram Singh', '+91 98765 10002', 'employer_user', 'active', TRUE),
-- Deloitte Users
('eeeeeeee-0002-0001-0001-000000000003', 'hr1@deloitte.com', 'Sneha Patel', '+91 98765 20001', 'employer_user', 'active', TRUE),
('eeeeeeee-0002-0001-0001-000000000004', 'hr2@deloitte.com', 'Rahul Verma', '+91 98765 20002', 'employer_user', 'active', TRUE);

INSERT INTO employer_users (id, user_id, employer_id, role, permissions, status) VALUES
-- KPMG
('eeeeeeee-0003-0001-0001-000000000001', 'eeeeeeee-0002-0001-0001-000000000001', 'eeeeeeee-0001-0001-0001-000000000001', 'owner', ARRAY['Full Access', 'Manage Users', 'Post Jobs', 'View Candidates'], 'active'),
('eeeeeeee-0003-0001-0001-000000000002', 'eeeeeeee-0002-0001-0001-000000000002', 'eeeeeeee-0001-0001-0001-000000000001', 'recruiter', ARRAY['Post Jobs', 'View Candidates', 'Schedule Interviews'], 'active'),
-- Deloitte
('eeeeeeee-0003-0001-0001-000000000003', 'eeeeeeee-0002-0001-0001-000000000003', 'eeeeeeee-0001-0001-0001-000000000002', 'owner', ARRAY['Full Access', 'Manage Users', 'Post Jobs', 'View Candidates'], 'active'),
('eeeeeeee-0003-0001-0001-000000000004', 'eeeeeeee-0002-0001-0001-000000000004', 'eeeeeeee-0001-0001-0001-000000000002', 'recruiter', ARRAY['Post Jobs', 'View Candidates', 'Schedule Interviews'], 'active');

-- =====================================================
-- CANDIDATE USERS (15 Candidates)
-- =====================================================
INSERT INTO users (id, email, name, phone, role, status, email_verified) VALUES
('cccccccc-0001-0001-0001-000000000001', 'priya.sharma@email.com', 'Priya Sharma', '+91 98765 30001', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000002', 'rahul.kumar@email.com', 'Rahul Kumar', '+91 98765 30002', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000003', 'sneha.gupta@email.com', 'Sneha Gupta', '+91 98765 30003', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000004', 'amit.patel@email.com', 'Amit Patel', '+91 98765 30004', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000005', 'deepika.singh@email.com', 'Deepika Singh', '+91 98765 30005', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000006', 'vikram.malhotra@email.com', 'Vikram Malhotra', '+91 98765 30006', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000007', 'neha.reddy@email.com', 'Neha Reddy', '+91 98765 30007', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000008', 'arjun.nair@email.com', 'Arjun Nair', '+91 98765 30008', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000009', 'kavita.joshi@email.com', 'Kavita Joshi', '+91 98765 30009', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000010', 'suresh.iyer@email.com', 'Suresh Iyer', '+91 98765 30010', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000011', 'pooja.menon@email.com', 'Pooja Menon', '+91 98765 30011', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000012', 'arun.das@email.com', 'Arun Das', '+91 98765 30012', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000013', 'ritu.saxena@email.com', 'Ritu Saxena', '+91 98765 30013', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000014', 'karan.mehta@email.com', 'Karan Mehta', '+91 98765 30014', 'candidate', 'active', TRUE),
('cccccccc-0001-0001-0001-000000000015', 'anjali.desai@email.com', 'Anjali Desai', '+91 98765 30015', 'candidate', 'active', TRUE);

-- =====================================================
-- CANDIDATES PROFILES (15 Candidates)
-- =====================================================
INSERT INTO candidates (id, user_id, headline, summary, location_city, location_state, experience_years, availability, work_mode, expected_salary_min, expected_salary_max, hourly_rate, current_salary, linkedin_url, profile_completeness, status, profile_views, rating) VALUES
('cccccccc-0002-0001-0001-000000000001', 'cccccccc-0001-0001-0001-000000000001', 'Senior Tax Analyst - 1040 Specialist', 'Experienced tax professional with 5 years of expertise in individual tax returns. Expert in complex 1040 scenarios including self-employment, investments, and multi-state filings.', 'Bangalore', 'Karnataka', 5, 'immediate', 'remote', 800000, 1200000, 2500, 750000, 'linkedin.com/in/priyasharma', 95, 'approved', 156, 4.8),
('cccccccc-0002-0001-0001-000000000002', 'cccccccc-0001-0001-0001-000000000002', 'Tax Consultant - Partnership & Corporate', 'Specialized in partnership and corporate taxation with 7 years experience. Deep expertise in Form 1065, 1120, and complex K-1 allocations.', 'Hyderabad', 'Telangana', 7, '2_weeks', 'hybrid', 1200000, 1800000, 3500, 1100000, 'linkedin.com/in/rahulkumar', 100, 'approved', 203, 4.9),
('cccccccc-0002-0001-0001-000000000003', 'cccccccc-0001-0001-0001-000000000003', 'Tax Associate - S Corporation Expert', 'Detail-oriented professional with strong background in S Corporation taxation and compliance. 4 years of hands-on experience.', 'Pune', 'Maharashtra', 4, 'immediate', 'remote', 600000, 900000, 2200, 550000, 'linkedin.com/in/snehagupta', 85, 'approved', 124, 4.6),
('cccccccc-0002-0001-0001-000000000004', 'cccccccc-0001-0001-0001-000000000004', 'Senior Tax Manager - Private Equity', 'Expert in private equity taxation with 9 years experience. Proven track record in complex fund structures and investor reporting.', 'Gurgaon', 'Haryana', 9, '1_month', 'hybrid', 2000000, 2800000, 5000, 1900000, 'linkedin.com/in/amitpatel', 100, 'approved', 287, 5.0),
('cccccccc-0002-0001-0001-000000000005', 'cccccccc-0001-0001-0001-000000000005', 'Tax Analyst - Individual & Small Business', 'Enthusiastic tax professional with 3 years expertise in individual returns and small business taxation.', 'Chennai', 'Tamil Nadu', 3, 'immediate', 'remote', 450000, 650000, 1800, 420000, 'linkedin.com/in/deepikasingh', 75, 'approved', 98, 4.5),
('cccccccc-0002-0001-0001-000000000006', 'cccccccc-0001-0001-0001-000000000006', 'Tax Director - Corporate & International', 'Strategic tax leader with 12 years of deep expertise in corporate and international taxation for multinational clients.', 'Mumbai', 'Maharashtra', 12, '2_weeks', 'onsite', 3500000, 4500000, 8000, 3200000, 'linkedin.com/in/vikrammalhotra', 100, 'approved', 342, 4.9),
('cccccccc-0002-0001-0001-000000000007', 'cccccccc-0001-0001-0001-000000000007', 'Tax Specialist - 1065 & K-1 Expert', 'Focused on partnership taxation with 6 years experience. Strong expertise in operating partnerships and complex allocations.', 'Noida', 'Uttar Pradesh', 6, 'immediate', 'remote', 900000, 1300000, 3000, 850000, 'linkedin.com/in/nehareddy', 90, 'approved', 145, 4.7),
('cccccccc-0002-0001-0001-000000000008', 'cccccccc-0001-0001-0001-000000000008', 'Senior Tax Analyst - Multi-State Filing', 'Expert in multi-state tax compliance with 5 years experience. Specialized in state nexus and apportionment.', 'Kochi', 'Kerala', 5, '2_weeks', 'hybrid', 750000, 1100000, 2600, 700000, 'linkedin.com/in/arjunnair', 88, 'approved', 112, 4.6),
('cccccccc-0002-0001-0001-000000000009', 'cccccccc-0001-0001-0001-000000000009', 'Tax Consultant - HNI Individual Returns', 'Specialized in high-net-worth individual taxation with 8 years experience. Expert in investment income and estate planning.', 'Delhi', 'Delhi', 8, 'immediate', 'remote', 1400000, 2000000, 4000, 1300000, 'linkedin.com/in/kavitajoshi', 95, 'approved', 198, 4.8),
('cccccccc-0002-0001-0001-000000000010', 'cccccccc-0001-0001-0001-000000000010', 'Tax Manager - Corporate Compliance', 'Experienced in corporate tax compliance and planning with 7 years background. Strong in Form 1120 and state filings.', 'Ahmedabad', 'Gujarat', 7, '1_month', 'hybrid', 1100000, 1600000, 3200, 1050000, 'linkedin.com/in/sureshiyer', 92, 'approved', 167, 4.7),
('cccccccc-0002-0001-0001-000000000011', 'cccccccc-0001-0001-0001-000000000011', 'Junior Tax Analyst - Fresh Graduate', 'Recent commerce graduate with strong foundation in US taxation. Completed internship at Big 4 firm.', 'Indore', 'Madhya Pradesh', 1, 'immediate', 'remote', 300000, 450000, 1200, 0, 'linkedin.com/in/poojamenon', 65, 'pending', 45, 0),
('cccccccc-0002-0001-0001-000000000012', 'cccccccc-0001-0001-0001-000000000012', 'Tax Associate - Non-Profit Specialist', 'Focused on non-profit taxation with 4 years experience. Expert in Form 990 and tax-exempt organizations.', 'Kolkata', 'West Bengal', 4, 'immediate', 'remote', 550000, 800000, 2000, 500000, 'linkedin.com/in/arundas', 82, 'approved', 89, 4.4),
('cccccccc-0002-0001-0001-000000000013', 'cccccccc-0001-0001-0001-000000000013', 'Senior Tax Analyst - International Tax', 'Specialized in international tax compliance including FBAR, FATCA, and transfer pricing. 6 years of experience.', 'Jaipur', 'Rajasthan', 6, '2_weeks', 'hybrid', 950000, 1400000, 3100, 900000, 'linkedin.com/in/ritusaxena', 88, 'approved', 134, 4.6),
('cccccccc-0002-0001-0001-000000000014', 'cccccccc-0001-0001-0001-000000000014', 'Tax Consultant - Real Estate Focus', 'Expert in real estate taxation with 5 years experience. Strong in depreciation, 1031 exchanges, and passive activity rules.', 'Chandigarh', 'Punjab', 5, 'immediate', 'remote', 800000, 1150000, 2700, 750000, 'linkedin.com/in/karanmehta', 85, 'approved', 121, 4.5),
('cccccccc-0002-0001-0001-000000000015', 'cccccccc-0001-0001-0001-000000000015', 'Tax Analyst - Startup & Emerging Companies', 'Focused on startup taxation with 3 years experience. Expertise in equity compensation, R&D credits, and entity selection.', 'Pune', 'Maharashtra', 3, 'immediate', 'remote', 500000, 750000, 1900, 480000, 'linkedin.com/in/anjalidesai', 78, 'approved', 76, 4.3);

-- =====================================================
-- CANDIDATE SKILLS
-- =====================================================
-- Candidate 1: Priya Sharma (1040 Specialist)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000001', '1040 Individual Returns', 'expert', TRUE, 5),
('cccccccc-0002-0001-0001-000000000001', 'Multi-State Tax Filing', 'advanced', TRUE, 4),
('cccccccc-0002-0001-0001-000000000001', 'Drake Software', 'expert', TRUE, 5),
('cccccccc-0002-0001-0001-000000000001', 'Tax Planning', 'advanced', FALSE, 3),
('cccccccc-0002-0001-0001-000000000001', 'ProConnect Tax', 'advanced', TRUE, 4);

-- Candidate 2: Rahul Kumar (Partnership & Corporate)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000002', '1065 Partnership Returns', 'expert', TRUE, 7),
('cccccccc-0002-0001-0001-000000000002', '1120 Corporate Returns', 'expert', TRUE, 6),
('cccccccc-0002-0001-0001-000000000002', 'K-1 Reporting', 'expert', TRUE, 7),
('cccccccc-0002-0001-0001-000000000002', 'CCH Axcess', 'expert', TRUE, 5),
('cccccccc-0002-0001-0001-000000000002', 'Tax Research', 'advanced', FALSE, 4);

-- Candidate 3: Sneha Gupta (S Corporation)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000003', '1120S S Corporation Returns', 'expert', TRUE, 4),
('cccccccc-0002-0001-0001-000000000003', 'Drake Software', 'advanced', TRUE, 4),
('cccccccc-0002-0001-0001-000000000003', 'IRS Regulations', 'intermediate', FALSE, 3),
('cccccccc-0002-0001-0001-000000000003', 'Tax Planning', 'intermediate', FALSE, 2);

-- Candidate 4: Amit Patel (Private Equity)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000004', 'Private Equity Taxation', 'expert', TRUE, 9),
('cccccccc-0002-0001-0001-000000000004', '1065 Partnership Returns', 'expert', TRUE, 9),
('cccccccc-0002-0001-0001-000000000004', 'K-1 Reporting', 'expert', TRUE, 9),
('cccccccc-0002-0001-0001-000000000004', 'Tax Planning', 'expert', TRUE, 8),
('cccccccc-0002-0001-0001-000000000004', 'UltraTax CS', 'expert', TRUE, 7);

-- Candidate 5: Deepika Singh (Individual & Small Business)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000005', '1040 Individual Returns', 'advanced', TRUE, 3),
('cccccccc-0002-0001-0001-000000000005', 'ProSeries', 'intermediate', TRUE, 2),
('cccccccc-0002-0001-0001-000000000005', 'Tax Planning', 'basic', FALSE, 1);

-- Candidate 6: Vikram Malhotra (Corporate & International)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000006', '1120 Corporate Returns', 'expert', TRUE, 12),
('cccccccc-0002-0001-0001-000000000006', 'International Tax Compliance', 'expert', TRUE, 10),
('cccccccc-0002-0001-0001-000000000006', 'Tax Planning', 'expert', TRUE, 12),
('cccccccc-0002-0001-0001-000000000006', 'CCH Axcess', 'expert', TRUE, 8),
('cccccccc-0002-0001-0001-000000000006', 'Tax Research', 'expert', TRUE, 12);

-- Candidate 7: Neha Reddy (1065 & K-1)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000007', '1065 Partnership Returns', 'expert', TRUE, 6),
('cccccccc-0002-0001-0001-000000000007', 'K-1 Reporting', 'expert', TRUE, 6),
('cccccccc-0002-0001-0001-000000000007', 'Lacerte', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000007', 'Tax Research', 'advanced', FALSE, 4);

-- Candidate 8: Arjun Nair (Multi-State)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000008', 'Multi-State Tax Filing', 'expert', TRUE, 5),
('cccccccc-0002-0001-0001-000000000008', '1040 Individual Returns', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000008', 'IRS Regulations', 'advanced', TRUE, 4),
('cccccccc-0002-0001-0001-000000000008', 'ProSeries', 'advanced', TRUE, 4);

-- Candidate 9: Kavita Joshi (HNI)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000009', '1040 Individual Returns', 'expert', TRUE, 8),
('cccccccc-0002-0001-0001-000000000009', 'Tax Planning', 'expert', TRUE, 8),
('cccccccc-0002-0001-0001-000000000009', 'FBAR Reporting', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000009', 'UltraTax CS', 'expert', TRUE, 7);

-- Candidate 10: Suresh Iyer (Corporate Compliance)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000010', '1120 Corporate Returns', 'expert', TRUE, 7),
('cccccccc-0002-0001-0001-000000000010', 'Multi-State Tax Filing', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000010', 'CCH Axcess', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000010', 'Tax Research', 'advanced', FALSE, 4);

-- Candidate 11: Pooja Menon (Junior)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000011', '1040 Individual Returns', 'basic', FALSE, 1),
('cccccccc-0002-0001-0001-000000000011', 'Drake Software', 'basic', FALSE, 1);

-- Candidate 12: Arun Das (Non-Profit)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000012', '990 Non-Profit Returns', 'expert', TRUE, 4),
('cccccccc-0002-0001-0001-000000000012', 'IRS Regulations', 'advanced', TRUE, 4),
('cccccccc-0002-0001-0001-000000000012', 'Tax Research', 'intermediate', FALSE, 3);

-- Candidate 13: Ritu Saxena (International)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000013', 'International Tax Compliance', 'expert', TRUE, 6),
('cccccccc-0002-0001-0001-000000000013', 'FBAR Reporting', 'expert', TRUE, 6),
('cccccccc-0002-0001-0001-000000000013', '1040 Individual Returns', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000013', 'Lacerte', 'advanced', TRUE, 4);

-- Candidate 14: Karan Mehta (Real Estate)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000014', '1040 Individual Returns', 'advanced', TRUE, 5),
('cccccccc-0002-0001-0001-000000000014', '1065 Partnership Returns', 'advanced', TRUE, 4),
('cccccccc-0002-0001-0001-000000000014', 'Tax Planning', 'advanced', TRUE, 4),
('cccccccc-0002-0001-0001-000000000014', 'ProSeries', 'advanced', TRUE, 5);

-- Candidate 15: Anjali Desai (Startup)
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency, is_verified, years_experience) VALUES
('cccccccc-0002-0001-0001-000000000015', '1120 Corporate Returns', 'intermediate', TRUE, 3),
('cccccccc-0002-0001-0001-000000000015', '1120S S Corporation Returns', 'intermediate', TRUE, 3),
('cccccccc-0002-0001-0001-000000000015', 'Tax Planning', 'intermediate', FALSE, 2),
('cccccccc-0002-0001-0001-000000000015', 'Drake Software', 'intermediate', TRUE, 3);

-- =====================================================
-- CANDIDATE EXPERIENCE (Sample for first 5 candidates)
-- =====================================================
-- Candidate 1: Priya Sharma
INSERT INTO candidate_experience (candidate_id, company_name, position, location, start_date, end_date, is_current, description, achievements, display_order) VALUES
('cccccccc-0002-0001-0001-000000000001', 'ABC Tax Services', 'Senior Tax Analyst', 'Bangalore, Karnataka', '2022-01-15', NULL, TRUE, 'Lead tax preparation for 200+ individual clients annually. Specialized in complex 1040 scenarios.', ARRAY['Maintained 99.8% accuracy rate', 'Reduced processing time by 25%', 'Mentored 3 junior analysts'], 1),
('cccccccc-0002-0001-0001-000000000001', 'XYZ Consulting', 'Tax Analyst', 'Bangalore, Karnataka', '2020-06-01', '2021-12-31', FALSE, 'Prepared individual and small business tax returns. Handled client communications.', ARRAY['Processed 150+ returns per season', 'Achieved 98% client satisfaction'], 2);

-- Candidate 2: Rahul Kumar
INSERT INTO candidate_experience (candidate_id, company_name, position, location, start_date, end_date, is_current, description, achievements, display_order) VALUES
('cccccccc-0002-0001-0001-000000000002', 'Global Tax Partners', 'Tax Consultant', 'Hyderabad, Telangana', '2021-03-01', NULL, TRUE, 'Lead partnership and corporate tax engagements for multinational clients.', ARRAY['Managed portfolio of 50+ clients', 'Saved clients $2M+ in tax liability'], 1),
('cccccccc-0002-0001-0001-000000000002', 'Big 4 Firm', 'Tax Associate', 'Hyderabad, Telangana', '2018-07-01', '2021-02-28', FALSE, 'Prepared Form 1065 and 1120 returns. Assisted with K-1 allocations.', ARRAY['Promoted ahead of schedule', 'Led team of 4 associates'], 2);

-- Candidate 3: Sneha Gupta
INSERT INTO candidate_experience (candidate_id, company_name, position, location, start_date, end_date, is_current, description, achievements, display_order) VALUES
('cccccccc-0002-0001-0001-000000000003', 'S Corp Specialists', 'Tax Associate', 'Pune, Maharashtra', '2021-08-01', NULL, TRUE, 'Specialized in S Corporation returns and shareholder basis tracking.', ARRAY['Processed 100+ S Corp returns annually', 'Zero audit adjustments'], 1);

-- Candidate 4: Amit Patel
INSERT INTO candidate_experience (candidate_id, company_name, position, location, start_date, end_date, is_current, description, achievements, display_order) VALUES
('cccccccc-0002-0001-0001-000000000004', 'PE Tax Advisors', 'Senior Tax Manager', 'Gurgaon, Haryana', '2020-01-01', NULL, TRUE, 'Lead private equity tax practice serving 20+ fund clients.', ARRAY['Built PE practice from ground up', 'Managed $50M+ in AUM tax compliance'], 1),
('cccccccc-0002-0001-0001-000000000004', 'Major PE Fund', 'Tax Manager', 'Mumbai, Maharashtra', '2016-04-01', '2019-12-31', FALSE, 'Managed tax compliance for PE fund portfolio companies.', ARRAY['Reduced tax cycle time by 40%', 'Implemented new K-1 automation'], 2);

-- =====================================================
-- CANDIDATE EDUCATION (Sample for first 5 candidates)
-- =====================================================
INSERT INTO candidate_education (candidate_id, institution, degree, field_of_study, start_date, end_date, display_order) VALUES
('cccccccc-0002-0001-0001-000000000001', 'University of Bangalore', 'Bachelor of Commerce', 'Accounting', '2015-07-01', '2018-05-31', 1),
('cccccccc-0002-0001-0001-000000000002', 'Osmania University', 'Master of Commerce', 'Taxation', '2013-07-01', '2015-05-31', 1),
('cccccccc-0002-0001-0001-000000000002', 'Osmania University', 'Bachelor of Commerce', 'Accounting', '2010-07-01', '2013-05-31', 2),
('cccccccc-0002-0001-0001-000000000003', 'Pune University', 'Bachelor of Commerce', 'Finance', '2016-07-01', '2019-05-31', 1),
('cccccccc-0002-0001-0001-000000000004', 'Delhi University', 'MBA', 'Finance & Taxation', '2012-07-01', '2014-05-31', 1),
('cccccccc-0002-0001-0001-000000000005', 'Anna University', 'Bachelor of Commerce', 'Accounting', '2018-07-01', '2021-05-31', 1);

-- =====================================================
-- CANDIDATE COMPETENCIES (Form expertise levels)
-- =====================================================
INSERT INTO candidate_competencies (candidate_id, form_type, proficiency_level) VALUES
-- Candidate 1: Priya
('cccccccc-0002-0001-0001-000000000001', '1040HNI', 'expert'),
('cccccccc-0002-0001-0001-000000000001', '1040GMS', 'expert'),
('cccccccc-0002-0001-0001-000000000001', '1040 COE', 'intermediate'),
('cccccccc-0002-0001-0001-000000000001', '1120 Federal', 'basic'),
-- Candidate 2: Rahul
('cccccccc-0002-0001-0001-000000000002', '1065 Federal', 'expert'),
('cccccccc-0002-0001-0001-000000000002', '1065 State', 'expert'),
('cccccccc-0002-0001-0001-000000000002', '1120 Federal', 'expert'),
('cccccccc-0002-0001-0001-000000000002', '1065 Operating Partnership', 'expert'),
-- Candidate 4: Amit (PE)
('cccccccc-0002-0001-0001-000000000004', '1065 Operating Partnership', 'expert'),
('cccccccc-0002-0001-0001-000000000004', '1065 Federal', 'expert'),
('cccccccc-0002-0001-0001-000000000004', '1065 State', 'expert');

-- =====================================================
-- ASSESSMENTS
-- =====================================================
INSERT INTO assessments (id, title, description, category, difficulty, duration_minutes, passing_score, question_count, price, skills_validated, status, total_attempts, avg_score, rating) VALUES
('55555555-0001-0001-0001-000000000001', 'Form 1040 - Individual Income Tax', 'Comprehensive assessment covering individual tax returns, deductions, credits, and complex scenarios.', 'Individual Taxation', 'advanced', 45, 70, 50, 299, ARRAY['1040', 'Deductions', 'Credits', 'Tax Planning'], 'active', 245, 82.4, 4.8),
('55555555-0001-0001-0001-000000000002', 'Form 1065 - Partnership Tax', 'Advanced assessment on partnership tax returns, K-1 allocations, and distributions.', 'Partnership Taxation', 'advanced', 60, 70, 75, 399, ARRAY['1065', 'K-1', 'Distributions', 'Partnership'], 'active', 156, 78.6, 4.9),
('55555555-0001-0001-0001-000000000003', 'Form 1120 - Corporate Tax', 'Expert-level assessment on corporate tax returns and schedules.', 'Corporate Taxation', 'expert', 55, 75, 65, 399, ARRAY['1120', 'Corporate Tax', 'Schedules'], 'active', 132, 75.2, 4.7),
('55555555-0001-0001-0001-000000000004', 'S Corporation Taxation', 'Specialized assessment on S Corp elections and pass-through taxation.', 'Corporate Taxation', 'intermediate', 40, 65, 45, 299, ARRAY['S Corp', 'Pass-through', 'Elections'], 'active', 98, 80.1, 4.6);

-- =====================================================
-- ASSESSMENT QUESTIONS (Sample for 1040 Assessment)
-- =====================================================
INSERT INTO assessment_questions (assessment_id, question_text, question_type, difficulty, points, options, correct_answer, explanation, display_order) VALUES
('55555555-0001-0001-0001-000000000001', 'What is the standard deduction for a single filer in tax year 2024?', 'multiple_choice', 'beginner', 5, ARRAY['$12,950', '$13,850', '$14,600', '$15,000'], '$14,600', 'The standard deduction for single filers increased to $14,600 for tax year 2024.', 1),
('55555555-0001-0001-0001-000000000001', 'Schedule C is used to report self-employment income.', 'true_false', 'beginner', 3, ARRAY['True', 'False'], 'True', 'Schedule C (Form 1040) is used to report income or loss from a business operated as a sole proprietor.', 2),
('55555555-0001-0001-0001-000000000001', 'Which form is used to report capital gains and losses?', 'multiple_choice', 'intermediate', 5, ARRAY['Schedule A', 'Schedule B', 'Schedule C', 'Schedule D'], 'Schedule D', 'Schedule D is used to report capital gains and losses from the sale of assets.', 3),
('55555555-0001-0001-0001-000000000001', 'What is the maximum contribution to a Traditional IRA for someone under 50 in 2024?', 'multiple_choice', 'intermediate', 5, ARRAY['$6,000', '$6,500', '$7,000', '$7,500'], '$7,000', 'The IRA contribution limit for 2024 is $7,000 for those under 50.', 4),
('55555555-0001-0001-0001-000000000001', 'Qualified dividends are taxed at ordinary income rates.', 'true_false', 'intermediate', 3, ARRAY['True', 'False'], 'False', 'Qualified dividends are taxed at preferential capital gains rates (0%, 15%, or 20%).', 5);

-- =====================================================
-- CERTIFICATES (Sample certificates for candidates)
-- =====================================================
INSERT INTO certificates (id, candidate_id, assessment_id, credential_id, title, score, percentile, level, issue_date, expiry_date, skills_validated, is_valid) VALUES
('66666666-0001-0001-0001-000000000001', 'cccccccc-0002-0001-0001-000000000001', '55555555-0001-0001-0001-000000000001', 'TT-1040-2024-001892', '1040 Individual Tax Returns - Expert Certification', 94, 92, 'expert', '2024-10-05', '2026-10-05', ARRAY['Individual Tax', 'Deductions', 'Credits'], TRUE),
('66666666-0001-0001-0001-000000000002', 'cccccccc-0002-0001-0001-000000000002', '55555555-0001-0001-0001-000000000002', 'TT-1065-2024-000756', '1065 Partnership Returns - Expert Certification', 96, 95, 'expert', '2024-09-15', '2026-09-15', ARRAY['Partnership Tax', 'K-1', 'Distributions'], TRUE),
('66666666-0001-0001-0001-000000000003', 'cccccccc-0002-0001-0001-000000000004', '55555555-0001-0001-0001-000000000002', 'TT-1065-2024-000412', '1065 Partnership Returns - Expert Certification', 98, 98, 'expert', '2024-08-20', '2026-08-20', ARRAY['Partnership Tax', 'K-1', 'PE Taxation'], TRUE),
('66666666-0001-0001-0001-000000000004', 'cccccccc-0002-0001-0001-000000000003', '55555555-0001-0001-0001-000000000004', 'TT-SCORP-2024-000234', 'S Corporation Specialist Certification', 88, 85, 'specialist', '2024-11-10', '2026-11-10', ARRAY['S Corp', 'Pass-through'], TRUE);

-- =====================================================
-- JOBS (Sample jobs from employers)
-- =====================================================
INSERT INTO jobs (id, employer_id, title, description, location_city, location_state, is_remote, job_type, experience_level, experience_years_min, experience_years_max, salary_min, salary_max, category, required_skills, responsibilities, benefits, status, is_urgent, applicant_count, view_count) VALUES
-- KPMG Jobs
('77777777-0001-0001-0001-000000000001', 'eeeeeeee-0001-0001-0001-000000000001', 'Senior Tax Analyst - 1040 Specialist', 'We are seeking an experienced Senior Tax Analyst with expertise in Form 1040 preparation and review.', 'Mumbai', 'Maharashtra', FALSE, 'full_time', 'senior', 4, 7, 800000, 1200000, 'Individual Tax', ARRAY['1040', 'Multi-state Filing', 'Drake Software'], ARRAY['Prepare and review Form 1040', 'Client consultation', 'Tax planning'], ARRAY['Health insurance', 'Performance bonus', 'Remote work options'], 'active', TRUE, 45, 320),
('77777777-0001-0001-0001-000000000002', 'eeeeeeee-0001-0001-0001-000000000001', 'Tax Manager - Partnership Returns', 'Lead our partnership tax division handling complex 1065 returns and K-1 distributions.', 'Mumbai', 'Maharashtra', TRUE, 'full_time', 'lead', 7, 12, 1500000, 2200000, 'Partnership Tax', ARRAY['1065', 'K-1', 'CCH Axcess'], ARRAY['Manage tax team', 'Partnership returns', 'Client relationships'], ARRAY['Competitive salary', 'Bonus structure', 'Flexible hours'], 'active', FALSE, 28, 256),
-- Deloitte Jobs
('77777777-0001-0001-0001-000000000003', 'eeeeeeee-0001-0001-0001-000000000002', 'Tax Associate - Corporate', 'Join our corporate tax team handling US corporate returns and compliance.', 'Bangalore', 'Karnataka', TRUE, 'full_time', 'mid', 2, 5, 600000, 900000, 'Corporate Tax', ARRAY['1120', 'Tax Compliance', 'Excel'], ARRAY['Prepare corporate returns', 'Support senior team', 'Research'], ARRAY['Training provided', 'Health coverage', 'Annual bonus'], 'active', FALSE, 67, 489),
('77777777-0001-0001-0001-000000000004', 'eeeeeeee-0001-0001-0001-000000000002', 'Private Equity Tax Specialist', 'Contract position for Private Equity tax specialist with complex deal structure experience.', 'Bangalore', 'Karnataka', TRUE, 'contract', 'senior', 6, 10, 1500000, 2000000, 'Private Equity', ARRAY['PE Taxation', '1065', 'K-1'], ARRAY['PE tax compliance', 'Deal support', 'Client advisory'], ARRAY['High compensation', 'Flexible schedule', 'Remote work'], 'active', TRUE, 34, 234);

-- =====================================================
-- JOB APPLICATIONS (Sample applications)
-- =====================================================
INSERT INTO job_applications (id, job_id, candidate_id, employer_id, cover_letter, current_compensation, expected_compensation, status, stage, progress, applied_at) VALUES
('88888888-0001-0001-0001-000000000001', '77777777-0001-0001-0001-000000000001', 'cccccccc-0002-0001-0001-000000000001', 'eeeeeeee-0001-0001-0001-000000000001', 'I am excited to apply for the Senior Tax Analyst position. With 5 years of experience in 1040 preparation...', 750000, 1000000, 'interview_scheduled', 4, 75, '2024-12-10'),
('88888888-0001-0001-0001-000000000002', '77777777-0001-0001-0001-000000000002', 'cccccccc-0002-0001-0001-000000000002', 'eeeeeeee-0001-0001-0001-000000000001', 'As a specialist in partnership taxation with 7 years experience...', 1100000, 1800000, 'shortlisted', 3, 60, '2024-12-08'),
('88888888-0001-0001-0001-000000000003', '77777777-0001-0001-0001-000000000003', 'cccccccc-0002-0001-0001-000000000005', 'eeeeeeee-0001-0001-0001-000000000002', 'I am interested in the Tax Associate position at Deloitte...', 420000, 700000, 'submitted', 1, 20, '2024-12-15'),
('88888888-0001-0001-0001-000000000004', '77777777-0001-0001-0001-000000000004', 'cccccccc-0002-0001-0001-000000000004', 'eeeeeeee-0001-0001-0001-000000000002', 'With 9 years of private equity tax experience, I am the ideal candidate...', 1900000, 2000000, 'reviewed', 2, 40, '2024-12-12');

-- =====================================================
-- APPLICATION STATUS HISTORY
-- =====================================================
INSERT INTO application_status_history (application_id, status, action, notes) VALUES
('88888888-0001-0001-0001-000000000001', 'submitted', 'Application Submitted', 'Initial application received'),
('88888888-0001-0001-0001-000000000001', 'reviewed', 'Application Reviewed', 'Reviewed by HR team'),
('88888888-0001-0001-0001-000000000001', 'shortlisted', 'Shortlisted', 'Candidate meets all requirements'),
('88888888-0001-0001-0001-000000000001', 'interview_scheduled', 'Interview Scheduled', 'Technical interview scheduled for Dec 18'),
('88888888-0001-0001-0001-000000000002', 'submitted', 'Application Submitted', 'Initial application received'),
('88888888-0001-0001-0001-000000000002', 'reviewed', 'Application Reviewed', 'Strong candidate profile'),
('88888888-0001-0001-0001-000000000002', 'shortlisted', 'Shortlisted', 'Moving to interview stage');

-- =====================================================
-- INTERVIEWS
-- =====================================================
INSERT INTO interviews (id, application_id, candidate_id, employer_id, interviewer_id, interview_type, scheduled_date, duration_minutes, meeting_link, status) VALUES
('99999999-0001-0001-0001-000000000001', '88888888-0001-0001-0001-000000000001', 'cccccccc-0002-0001-0001-000000000001', 'eeeeeeee-0001-0001-0001-000000000001', 'eeeeeeee-0002-0001-0001-000000000001', 'video', '2024-12-18 14:00:00+05:30', 60, 'https://meet.google.com/abc-defg-hij', 'scheduled');

-- =====================================================
-- SAVED CANDIDATES (Employer shortlists)
-- =====================================================
INSERT INTO saved_candidates (employer_id, candidate_id, saved_by, folder, notes) VALUES
('eeeeeeee-0001-0001-0001-000000000001', 'cccccccc-0002-0001-0001-000000000001', 'eeeeeeee-0002-0001-0001-000000000001', 'Senior Roles', 'Excellent 1040 skills'),
('eeeeeeee-0001-0001-0001-000000000001', 'cccccccc-0002-0001-0001-000000000002', 'eeeeeeee-0002-0001-0001-000000000001', 'Partnership Team', 'Perfect for partnership division'),
('eeeeeeee-0001-0001-0001-000000000002', 'cccccccc-0002-0001-0001-000000000004', 'eeeeeeee-0002-0001-0001-000000000003', 'PE Specialists', 'Top PE candidate');

-- =====================================================
-- SAVED JOBS (Candidate bookmarks)
-- =====================================================
INSERT INTO saved_jobs (candidate_id, job_id) VALUES
('cccccccc-0002-0001-0001-000000000001', '77777777-0001-0001-0001-000000000002'),
('cccccccc-0002-0001-0001-000000000005', '77777777-0001-0001-0001-000000000001'),
('cccccccc-0002-0001-0001-000000000007', '77777777-0001-0001-0001-000000000002');

-- =====================================================
-- NOTIFICATIONS (Sample notifications)
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
('cccccccc-0001-0001-0001-000000000001', 'interview', 'Interview Scheduled', 'Your interview with KPMG India has been scheduled for Dec 18, 2024', '/dashboard/status', FALSE),
('cccccccc-0001-0001-0001-000000000002', 'application', 'Application Shortlisted', 'Your application for Tax Manager at KPMG has been shortlisted', '/dashboard/status', FALSE),
('eeeeeeee-0002-0001-0001-000000000001', 'application', 'New Application', 'Priya Sharma applied for Senior Tax Analyst position', '/employer/applications', TRUE);

-- =====================================================
-- PROFILE VIEWS (Analytics)
-- =====================================================
INSERT INTO profile_views (candidate_id, employer_id, viewer_user_id, view_type, source) VALUES
('cccccccc-0002-0001-0001-000000000001', 'eeeeeeee-0001-0001-0001-000000000001', 'eeeeeeee-0002-0001-0001-000000000001', 'full_profile', 'talent_search'),
('cccccccc-0002-0001-0001-000000000001', 'eeeeeeee-0001-0001-0001-000000000002', 'eeeeeeee-0002-0001-0001-000000000003', 'full_profile', 'talent_search'),
('cccccccc-0002-0001-0001-000000000002', 'eeeeeeee-0001-0001-0001-000000000001', 'eeeeeeee-0002-0001-0001-000000000001', 'full_profile', 'application'),
('cccccccc-0002-0001-0001-000000000004', 'eeeeeeee-0001-0001-0001-000000000002', 'eeeeeeee-0002-0001-0001-000000000003', 'full_profile', 'talent_search');
