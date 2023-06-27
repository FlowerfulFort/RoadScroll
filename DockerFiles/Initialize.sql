-- create database if not exists roadimage;
-- use roadimage;

-- create user 'roadimage'@'%' identified by 'roadimage';
grant all privileges on roadimage.* to 'admin'@'%' identified by 'admin';
flush privileges;
