create database banco;
\c banco;
create table cliente (
    id serial primary key,
    name varchar(50),
    email varchar(50) unique not null,
    rut varchar(9) unique not null,
    password varchar(50),
    address varchar(50),
    balance int check(balance >= 0) default 100000);

create table transfer (
    id serial primary key,
    id_cliente int references cliente(id),
    id_destinatario int references cliente(id),
    monto int check(monto >= 0),
    fecha timestamp default current_timestamp,
    comment varchar(50)
    );
