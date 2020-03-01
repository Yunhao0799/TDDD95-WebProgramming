--------------------------------------------------------------------------------
--                            schema.sql                                      --
-- This file shall contain the SQL script used to initialize the database.    --
-- database_helper.py or SQLite3 front-end will use this file to create       --
-- all the tables and insert the default data. This file should be completed  --
-- and executed before implementing and running any of the server side        --
-- procedures.                                                                --
--------------------------------------------------------------------------------

create table users(email varchar(30), password varchar(30), firstname varchar(20), familyname varchar(50), gender varchar(10), city varchar(30), country varchar(30), primary key(email), UNIQUE(email));
create table message(messageId integer primary key autoincrement, sender varchar(30), receiver varchar(30), place varchar(100), message varchar(500));
create table loggedUser(email varchar(30), token varchar(16), primary key(email), UNIQUE(email));
