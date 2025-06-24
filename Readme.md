Blog Platform (MEAN Stack with Microservices)
Overview
This project is a collaborative blogging platform that allows multiple authors to create, edit, and comment on articles. It is built using the MEAN stack (MongoDB, Express.js, Angular, Node.js) and follows a microservices architecture to ensure scalability and maintainability. The platform includes advanced features such as role-based access control, real-time notifications for comments, and a responsive user interface designed with Angular Material.

**Project Structure
**The project is divided into four main components, each serving a specific purpose:

**user-service:** Manages user authentication, registration, and role management.

**article-service**: Handles the creation, editing, deletion, and retrieval of articles and comments.

**notification-service**: Provides real-time notifications for new comments using WebSockets (Socket.io).

**frontend**: The Angular-based user interface that interacts with the microservices and displays the blog content.


**Installation
**Follow these steps to set up and run the project on your local machine.
 
**Step-by-Step Setup
**
Clone the repository:
git clone [<repository-url>](https://github.com/mohamedyangui/blog.git)
cd blog


Install dependencies for each service:
# User Service
cd user-service && npm install
cd ..

# Article Service
cd article-service && npm install
cd ..

# Notification Service
cd notification-service && npm install
cd ..

# Frontend
cd frontend/frontend && npm install
cd ..


Start MongoDB: Ensure MongoDB is running on localhost:27017:
mongod


Run the microservices: Open separate terminals for each service and run:
# User Service
cd user-service && npm start

# Article Service
cd article-service && npm start

# Notification Service
cd notification-service && npm start


Run the frontend: In a new terminal:
cd frontend && ng serve


Access the application at http://localhost:4200.




