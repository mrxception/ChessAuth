-- Add admin role to users table
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';

-- Create admin dashboard views for better performance
CREATE VIEW admin_user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as users_last_30_days
FROM users;

CREATE VIEW admin_app_stats AS
SELECT 
    COUNT(*) as total_apps,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_apps,
    COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_apps,
    COUNT(CASE WHEN hwid_lock = TRUE THEN 1 END) as hwid_locked_apps
FROM applications;

CREATE VIEW admin_license_stats AS
SELECT 
    COUNT(*) as total_licenses,
    COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as used_licenses,
    COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as unused_licenses,
    COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 END) as expired_licenses,
    COUNT(CASE WHEN is_banned = TRUE THEN 1 END) as banned_licenses
FROM licenses;

CREATE VIEW admin_recent_activity AS
SELECT 
    l.id,
    l.action,
    l.username,
    l.ip_address,
    l.timestamp,
    a.app_name,
    u.username as app_owner
FROM logs l
LEFT JOIN applications a ON l.application_id = a.id
LEFT JOIN users u ON a.user_id = u.id
ORDER BY l.timestamp DESC
LIMIT 100;
