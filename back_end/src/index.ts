import express from "express";
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { initRoutes } from "./handlers/routes";
import { AppDataSource } from "./database/database";
import 'dotenv/config';
import "reflect-metadata" 
import { swaggerDocs } from "./swagger/swagger";
import { abonnementManager } from "./schedulers/abonnementManager";
import { AbonnementManager } from "./schedulers/abonnementManager";

const main = async () => {
    const app = express()

    app.use(cors({
        origin: 'http://localhost:3001', 
        credentials: true
      }));

    const upload = multer({ dest: 'uploads/' });
    
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    const port = 3000

    try {

        await AppDataSource.initialize()
        console.error("well connected to database")
        const subManager = new AbonnementManager();
        subManager.start();
    } catch (error) {
        console.log(error)
        console.error("Cannot contact database")
        process.exit(1)
    }
    swaggerDocs(app, port)
    app.use(express.json()) 
    initRoutes(app)
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}

main()