# Database Design Documentation

## Overview

This document outlines the current backend database design for the application. It includes details about the tables, their columns, data types, and constraints.

## Tables

### Users

| Column Name     | Data Type     | Constraints                |
|------------------|---------------|-----------------------------|
| id               | INT           | PRIMARY KEY, AUTO_INCREMENT |
| username         | VARCHAR(255)  | NOT NULL, UNIQUE            |
| email            | VARCHAR(255)  | NOT NULL, UNIQUE            |
| password_hash    | VARCHAR(255)  | NOT NULL                    |
| created_at       | DATETIME      | DEFAULT CURRENT_TIMESTAMP   |
| updated_at       | DATETIME      | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### Posts

| Column Name     | Data Type     | Constraints                |
|------------------|---------------|-----------------------------|
| id               | INT           | PRIMARY KEY, AUTO_INCREMENT |
| user_id          | INT           | NOT NULL, FOREIGN KEY (user_id) REFERENCES Users(id) |
| title            | VARCHAR(255)  | NOT NULL                    |
| content          | TEXT          | NOT NULL                    |
| created_at       | DATETIME      | DEFAULT CURRENT_TIMESTAMP   |
| updated_at       | DATETIME      | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### Comments

| Column Name     | Data Type     | Constraints                |
|------------------|---------------|-----------------------------|
| id               | INT           | PRIMARY KEY, AUTO_INCREMENT |
| post_id          | INT           | NOT NULL, FOREIGN KEY (post_id) REFERENCES Posts(id) |
| user_id          | INT           | NOT NULL, FOREIGN KEY (user_id) REFERENCES Users(id) |
| content          | TEXT          | NOT NULL                    |
| created_at       | DATETIME      | DEFAULT CURRENT_TIMESTAMP   |

## Relationships

- **Users** can have multiple **Posts**.
- **Posts** can have multiple **Comments**.
- Each **Comment** is associated with a single **User** and a single **Post**.

## Indexes

- An index on `username` and `email` in the `Users` table for faster lookups.
- An index on `user_id` in the `Posts` table to optimize queries related to user posts.
- An index on `post_id` in the `Comments` table to optimize queries related to post comments.

## Conclusion

This document serves as a reference for the current database schema and should be updated with any changes made during development.