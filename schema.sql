CREATE TABLE users (
	id INTEGER NOT NULL, 
	username VARCHAR(64), 
	email VARCHAR(120), 
	password_hash VARCHAR(128), 
	PRIMARY KEY (id)
);

CREATE TABLE notes (
	id INTEGER NOT NULL, 
	body VARCHAR(140), 
	timestamp TIMESTAMP, 
	users_id INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(users_id) REFERENCES users (id)
);

CREATE UNIQUE INDEX ix_user_username ON users (username);
CREATE UNIQUE INDEX ix_user_email ON users (email);
CREATE INDEX ix_note_timestamp ON note (timestamp);

