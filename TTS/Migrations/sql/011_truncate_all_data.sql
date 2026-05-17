-- WARNING: Deletes ALL rows from application tables (keeps dbo.roles).
-- Run before 012_yopmail_test_users.sql for a clean yopmail test environment.
-- Does NOT drop tables or migration history.

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.interview_feedback', N'U') IS NOT NULL DELETE FROM dbo.interview_feedback;
IF OBJECT_ID(N'dbo.interviews', N'U') IS NOT NULL DELETE FROM dbo.interviews;
IF OBJECT_ID(N'dbo.application_status_history', N'U') IS NOT NULL DELETE FROM dbo.application_status_history;
IF OBJECT_ID(N'dbo.job_applications', N'U') IS NOT NULL DELETE FROM dbo.job_applications;
IF OBJECT_ID(N'dbo.saved_jobs', N'U') IS NOT NULL DELETE FROM dbo.saved_jobs;
IF OBJECT_ID(N'dbo.saved_candidates', N'U') IS NOT NULL DELETE FROM dbo.saved_candidates;
IF OBJECT_ID(N'dbo.profile_views', N'U') IS NOT NULL DELETE FROM dbo.profile_views;
IF OBJECT_ID(N'dbo.notifications', N'U') IS NOT NULL DELETE FROM dbo.notifications;
IF OBJECT_ID(N'dbo.admin_users', N'U') IS NOT NULL DELETE FROM dbo.admin_users;
IF OBJECT_ID(N'dbo.user_subscriptions', N'U') IS NOT NULL DELETE FROM dbo.user_subscriptions;
IF OBJECT_ID(N'dbo.certificates', N'U') IS NOT NULL DELETE FROM dbo.certificates;
IF OBJECT_ID(N'dbo.user_assessment_answers', N'U') IS NOT NULL DELETE FROM dbo.user_assessment_answers;
IF OBJECT_ID(N'dbo.user_assessments', N'U') IS NOT NULL DELETE FROM dbo.user_assessments;
IF OBJECT_ID(N'dbo.assessment_questions', N'U') IS NOT NULL DELETE FROM dbo.assessment_questions;
IF OBJECT_ID(N'dbo.questions', N'U') IS NOT NULL DELETE FROM dbo.questions;
IF OBJECT_ID(N'dbo.candidate_responsibilities', N'U') IS NOT NULL DELETE FROM dbo.candidate_responsibilities;
IF OBJECT_ID(N'dbo.candidate_competencies', N'U') IS NOT NULL DELETE FROM dbo.candidate_competencies;
IF OBJECT_ID(N'dbo.candidate_education', N'U') IS NOT NULL DELETE FROM dbo.candidate_education;
IF OBJECT_ID(N'dbo.candidate_experience', N'U') IS NOT NULL DELETE FROM dbo.candidate_experience;
IF OBJECT_ID(N'dbo.candidate_skills', N'U') IS NOT NULL DELETE FROM dbo.candidate_skills;
IF OBJECT_ID(N'dbo.usercompetencies', N'U') IS NOT NULL DELETE FROM dbo.usercompetencies;
IF OBJECT_ID(N'dbo.jobpostings', N'U') IS NOT NULL DELETE FROM dbo.jobpostings;
IF OBJECT_ID(N'dbo.candidates', N'U') IS NOT NULL DELETE FROM dbo.candidates;
IF OBJECT_ID(N'dbo.user_employers', N'U') IS NOT NULL DELETE FROM dbo.user_employers;
IF OBJECT_ID(N'dbo.employers', N'U') IS NOT NULL DELETE FROM dbo.employers;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DELETE FROM dbo.users;
IF OBJECT_ID(N'dbo.assessments', N'U') IS NOT NULL DELETE FROM dbo.assessments;
IF OBJECT_ID(N'dbo.skills_master', N'U') IS NOT NULL DELETE FROM dbo.skills_master;

PRINT 'Migration 011_truncate_all_data completed — all application data removed (roles kept).';
GO
