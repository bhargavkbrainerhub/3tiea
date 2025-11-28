CREATE TABLE IF NOT EXISTS student (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    roll_number INT,
    class VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS teacher (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    subject VARCHAR(50),
    class VARCHAR(10)
);

INSERT INTO student (id, name, roll_number, class) VALUES
(1, 'Alice', 101, '10A'),
(2, 'Bob', 102, '10B');

INSERT INTO teacher (id, name, subject, class) VALUES
(1, 'Mr. Smith', 'Math', '10A'),
(2, 'Ms. Jane', 'Science', '10B');
