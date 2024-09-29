create table if not exists connections
(
    id       integer not null
        constraint connections_pk
            primary key autoincrement,
    name     TEXT    not null,
    host     TEXT    not null,
    port     INT     not null,
    login    TEXT    not null,
    password TEXT    not null
);