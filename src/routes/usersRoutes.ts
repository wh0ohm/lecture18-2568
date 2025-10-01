import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest } from "../libs/types.js";

// import database
import { users, reset_users } from "../db/db.js";

const router = Router();

// GET /api/v2/users
router.get("/", (req: Request, res: Response) => {
  try {
    // return all users
    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {
try {
    // 1. get username and password from body
    const loginUser = req.body.username as string;
    const loginPassword = req.body.password as string;
    const findUser = users.find(
        (u: User) => u.username === loginUser && u.password === loginPassword
    )
    // 2. check if user exists (search with username & password in DB)
    if(!findUser){
        return res.status(401).json({
            success: false,
            message: "Invalid username or password",
        })
    }
    // 3. create JWT token (with user info object as payload) using JWT_SECRET_KEY
    //    (optional: save the token as part of User data)
    // Get JWT_SECRET_KEY from .env file
    const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";

    // Create/sign a JWT with JWT_SECRET_KEY
    // The payload is an object containing { username, studentId, role }
    const token = jwt.sign(
    {
        // create JWT Payload
        username: findUser.username,
        studentId: findUser.studentId,
        role: findUser.role,
    },
    jwt_secret,
    { expiresIn: "5m" }
    );
    // 4. send HTTP response with JWT token
    return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
      });
    }
  
catch (err) {
  return res.status(500).json({
    success: false,
    message: "Sothing is wrong, please try again",
    error : err,
  });
}
});


// POST /api/v2/users/logout
router.post("/logout", (req: Request, res: Response) => {
  // 1. check Request if "authorization" header exists
  //    and container "Bearer ...JWT-Token..."

  // 2. extract the "...JWT-Token..." if available

  // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)

  // 4. check if user exists (search with username)

  // 5. proceed with logout process and return HTTP response
  //    (optional: remove the token from User data)

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/logout has not been implemented yet",
  });
});

// POST /api/v2/users/reset
router.post("/reset", (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;