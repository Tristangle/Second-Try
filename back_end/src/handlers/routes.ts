import express, { Request, Response } from "express";
import { UserHandler } from "./user";
import { authMiddleware } from "./middleware/auth-middleware";
import { roleMiddleware } from "./middleware/role-middleware";
import { userListValidation } from "./validators/user-validator";
import { documentCreateValidation, documentListValidation } from "./validators/document-validation";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { UserUsecase } from "../domain/user-usecase";
import { DocumentUsecase } from "../domain/document-usecase";
import { AppDataSource } from "../database/database";
import { getUserIdFromToken } from "./utils/getUserId";
import { userUpdateRoleValidation } from "./validators/user-validator";
import { createSurveyValidation, CreateSurveyRequest } from './validators/survey-validation';
import { SurveyUsecase } from '../domain/survey-usecase';
import { createVoteValidation, CreateVoteRequest, voteListValidation } from './validators/vote-validation';
import { VoteUsecase } from '../domain/vote-usecase';

import multer from 'multer'; 
const upload = multer({ dest: 'uploads/' });

export const initRoutes = (app:express.Express) => {

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List of users
 *     description: Retrieves a paginated list of users according to specified criteria.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to display.
 *       - in: query
 *         name: result
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page.
 *     responses:
 *       200:
 *         description: Successfully returned a list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
    app.get('/users',authMiddleware, roleMiddleware, async(req: Request, res:Response)=>{

        const usersValidation = userListValidation.validate(req.body);
        if(usersValidation.error){
            res.status(400).send(generateValidationErrorMessage(usersValidation.error.details));
            return;
        }
        const userList = usersValidation.value;
        let result = 20
        if (userList.result) {
            result = userList.result
        }
        const page = userList.page ?? 1

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const listUser = await userUsecase.userList({ ... userList,page, result })
            res.status(200).send(listUser)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });


    app.get('/documents', authMiddleware, roleMiddleware, async(req: Request, res:Response)=>{

        const documentsValidation = documentListValidation.validate(req.body);
        if(documentsValidation.error){
            res.status(400).send(generateValidationErrorMessage(documentsValidation.error.details));
            return;
        }
        const documentList = documentsValidation.value;
        let result = 20
        if (documentList.result) {
            result = documentList.result
        }
        const page = documentList.page ?? 1

        try {
            const documentUsecase = new DocumentUsecase(AppDataSource);
            const listDocument = await documentUsecase.documentList({ ... documentList,page, result })
            res.status(200).send(listDocument)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });

    app.post('/documents', authMiddleware, roleMiddleware, upload.single('file'), async (req: Request, res: Response) => {
        if (!req.file) {
          return res.status(400).send('No file uploaded');
        }
      
        const documentValidation = documentCreateValidation.validate({ ...req.body, file: req.file });
        if (documentValidation.error) {
          res.status(400).send(generateValidationErrorMessage(documentValidation.error.details));
          return;
        }
      
        try {
          const documentUsecase = new DocumentUsecase(AppDataSource);
          const newDocument = await documentUsecase.createDocument(documentValidation.value, req.file.path);
          res.status(201).json(newDocument);
        } catch (error) {
          console.log(error);
          res.status(500).send({ error: 'Internal error' });
        }
    });

    app.delete('/users/:id', authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    
    try {
        const userUsecase = new UserUsecase(AppDataSource);
        await userUsecase.deleteUser(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal error' });
    }
    });

    app.put('/users/:id/role', authMiddleware, roleMiddleware, async (req: Request, res: Response) => {
        const userId = parseInt(req.params.id, 10);
        const { roleId } = req.body;
      
        const validation = userUpdateRoleValidation.validate({ roleId });
        if (validation.error) {
          res.status(400).send(generateValidationErrorMessage(validation.error.details));
          return;
        }
      
        try {
          const userUsecase = new UserUsecase(AppDataSource);
          const updatedUser = await userUsecase.updateUserRole(userId, roleId);
          if (updatedUser) {
            res.status(200).json({ message: 'Role updated successfully', user: updatedUser });
          } else {
            res.status(404).json({ error: 'User or Role not found' });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Internal error' });
        }
      });    

      app.post('/surveys', authMiddleware, async (req: Request, res: Response) => {
        const { error, value } = createSurveyValidation.validate(req.body);
      
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
      
        const surveyUsecase = new SurveyUsecase(AppDataSource);
        try {
          const survey = await surveyUsecase.createSurvey(value as CreateSurveyRequest);
          res.status(201).json(survey);
        } catch (error) {
          console.error('Error creating survey:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });

      app.get('/surveys', authMiddleware, async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const result = parseInt(req.query.result as string) || 10;
        const surveyUsecase = new SurveyUsecase(AppDataSource);
      
        try {
          const surveys = await surveyUsecase.listSurveys(page, result);
          res.status(200).json(surveys);
        } catch (error) {
          console.error('Error fetching surveys:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });

      app.post('/votes', authMiddleware, async (req: Request, res: Response) => {
        const { error, value } = createVoteValidation.validate(req.body);
      
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
      
        try {
          const userId = (req as any).user.id;  
          const voteUsecase = new VoteUsecase(AppDataSource);
          const newVote = await voteUsecase.createVote(value, userId);
          return res.status(201).json(newVote);
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      });

      app.get('/votes', authMiddleware, async (req: Request, res: Response) => {
        const { page = 1, result = 10 } = req.query;
      
        const { error } = voteListValidation.validate({ page, result });
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
      
        try {
          const voteUsecase = new VoteUsecase(AppDataSource);
          const votes = await voteUsecase.voteList({ page: Number(page), result: Number(result) });
          res.status(200).json(votes);
        } catch (err) {
          console.error('Error fetching votes:', err);
          res.status(500).json({ error: 'Internal error, please try again later.' });
        }
      });

    UserHandler(app)
}