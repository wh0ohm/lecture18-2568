import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest, Enrollment } from "../libs/types.js";

import {zStudentId} from "../libs/zodValidators.js";
import {zCourseId} from "../libs/zodValidators.js";

import { students } from "../db/db.js";

// import database
import { users, reset_users, enrollments, reset_enrollments } from "../db/db.js";
import {authenticateToken} from "../middlewares/authenMiddeleware.js";
import { checkRoles } from "../middlewares/checkRolesMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin.js";

const router = Router();

//GET/api/v2/enrollments
router.get("/",authenticateToken,checkRoleAdmin,(req: CustomRequest, res: Response) => {
  try {
    return res.json({
      success: true,
      message: "Enrollments Information",
      data: enrollments,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

//POST/api/v2/enrollments/reset
router.post("/reset",authenticateToken,checkRoleAdmin,(req: CustomRequest, res: Response) => {
    try {
        reset_enrollments();
        return res.status(200).json({
          success: true,
          message: "enrollment database has been reset",
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Something is wrong, please try again",
          error: err,
        });
      }
});

//GET/api/v2/enrollments/:studentId 
router.get("/:studentId",authenticateToken,checkRoles,(req: CustomRequest, res: Response) => {
    try{
        const studentId = zStudentId.parse(req.params.studentId);
        const payload = req.user; 
        if(payload?.role === "ADMIN" || payload?.role === "STUDENT" && payload?.studentId === studentId){
            return res.status(200).json({
                success: true,
                message: "Student Information",
                data: students.filter((s) => s.studentId === studentId),
              });
        }else{
            return res.status(403).json({
                success: false,
                message: "forbidden access",
              });
        }
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err,
          });
    }
});

//POST/api/v2/enrollments/:studentId
router.post("/:studentId",authenticateToken,checkRoles,(req: CustomRequest, res: Response) => {
    const studentId = zStudentId.parse(req.params.studentId);
    const payload = req.user;
    const courseId = zCourseId.parse(req.body.courseId);
    try{
        const isDuplicate = enrollments.some((e => e.studentId === studentId && e.courseId === courseId));
        if(isDuplicate){
            return res.status(409).json({
                success: false,
                message: `student && course is already exists`,
            });
        }else if(payload?.role === "STUDENT" && payload?.studentId === studentId){
            enrollments.push({studentId, courseId});
            return res.status(201).json({
                success: true,
                message: `Student ${studentId} && Course ${courseId} has been add successfilly`,
                data: enrollments.filter((s) => s.studentId === studentId),
              });
        }if(payload?.role === "ADMIN" || payload?.studentId !== studentId){
            return res.status(403).json({
                success: false,
                message: "forbidden access",
            });
        }

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err,
          });
    }
});

//DELETE/api/v2/enrollments/:studentId
router.delete("/:studentId",authenticateToken,checkRoles,(req: CustomRequest, res: Response) => {
    const studentId = zStudentId.parse(req.params.studentId);
    const payload = req.user;
    const courseId = zCourseId.parse(req.body.courseId);
    try{
        const index = enrollments.findIndex((e => e.studentId === studentId && e.courseId === courseId));
        if(index === -1){
            return res.status(404).json({
                success: false,
                message: "Enrollment does not exist",
            })
        }if(payload?.role === "STUDENT" && payload?.studentId === studentId){
            enrollments.splice(index, 1);
            return res.status(200).json({
                success: true,
                message: `Student ${studentId} && Course ${courseId} has been deleted`,
                data: enrollments,
              });
        }if(payload?.role === "ADMIN" || payload?.studentId !== studentId){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to modify other student's data",
            });
        }
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err,
          });
    }
        
});

export default router;