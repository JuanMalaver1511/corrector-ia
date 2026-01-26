create database user;
use user;
create table usuarios(
ID int auto_increment primary key,
username varchar(50) NOT NULL unique,
password varchar(50) NOT NULL,
fecha_creacion timestamp default current_timestamp 
)
