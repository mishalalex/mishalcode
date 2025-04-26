# MISHALCODE
------------

### Goal
--------
To create an online platform where users can solve coding challenges in different languages similar to leetcode or geeksforgeeks

### Technologies used
---------------------
### Backened - NodeJs, Express, Postgres, Prisma, Judge0
### Frontend - ReactJs, Tailwind-Css, DaisyUI, Zustand, Zod and React-Hook Forms

### API Architecture
--------------------
1. Authentication
2. Problem Management (CRUD operation related to the problem)
3. Code execution 
4. Submission
5. Playlist creation for a set of problems


### How does our platform operates
----------------------------------



### Steps followed
-------------------
1. folder -> mkdir backend frontend
2. file -> .gitignore
   1. added 'node_modules' and '.env' to this file
3. 'nodemmon' is installed universally via "npm i -g nodemon" command

Backend Folder
--------------
1. folder -> backend/src (here we will keep the backend code)
2. install express and dotenv packages
3. file -> backend/src/index.js
   1. setup a simple server using express and getting the port from dotenv file