import express from "express";
import { abonnementControllerInstance } from "../domain/controllers/abonnementController";
import { devisControllerInstance } from "../domain/controllers/devisController";
import { documentControllerInstance } from "../domain/controllers/documentController";
import { factureControllerInstance } from "../domain/controllers/factureController";
import { imageControllerInstance } from "../domain/controllers/imageController";
import { immobilierControllerInstance } from "../domain/controllers/immobilierController";
import { inspectionControllerInstance } from "../domain/controllers/inspectionController";
import { interventionControllerInstance } from "../domain/controllers/interventionController";
import { prestationControllerInstance } from "../domain/controllers/prestationController";
import { reservationControllerInstance } from "../domain/controllers/reservationController";
import { roleControllerInstance } from "../domain/controllers/roleController";
import { userAbonnementControllerInstance } from "../domain/controllers/userAbonnementController";
import { userControllerInstance } from "../domain/controllers/userController";
import { authMiddleware } from "../handlers/middleware/auth-middleware";
import { roleMiddleware } from "../handlers/middleware/role-middleware";

const router = express.Router();

// Abonnement Routes
// Marche
router.post("/abonnements/create", abonnementControllerInstance.createAbonnement.bind(abonnementControllerInstance));
// Marche
router.get("/abonnements", abonnementControllerInstance.listAbonnements.bind(abonnementControllerInstance));
// Marche
router.put("/abonnements/:id", abonnementControllerInstance.updateAbonnement.bind(abonnementControllerInstance));
// Marche
router.delete("/abonnements/:id", abonnementControllerInstance.deleteAbonnement.bind(abonnementControllerInstance));

// Devis Routes
// Marche
router.post("/devis/create", devisControllerInstance.createDevis.bind(devisControllerInstance));
// Marche
router.put("/devis/:id", devisControllerInstance.updateDevis.bind(devisControllerInstance));
// Marche
router.delete("/devis/:id", devisControllerInstance.deleteDevis.bind(devisControllerInstance));

// Document Routes
// Marche
router.post("/documents/create", documentControllerInstance.createDocument.bind(documentControllerInstance));
// Marche
router.get("/documents", documentControllerInstance.documentList.bind(documentControllerInstance));
// Marche
router.put("/documents/:id", documentControllerInstance.updateDocument.bind(documentControllerInstance));
// Marche
router.delete("/documents/:id", documentControllerInstance.deleteDocument.bind(documentControllerInstance));

// Facture Routes
// Marche
router.post("/factures/create", factureControllerInstance.createFacture.bind(factureControllerInstance));
// Marche
router.put("/factures/:id", factureControllerInstance.updateFacture.bind(factureControllerInstance));
// Marche
router.delete("/factures/:id", factureControllerInstance.deleteFacture.bind(factureControllerInstance));

// Image Routes
// Marche
router.post("/images/create", imageControllerInstance.createImage.bind(imageControllerInstance));
// Marche
router.get("/images/:immobilierId", imageControllerInstance.imageList.bind(imageControllerInstance));
// Marche
router.delete("/images/:id", imageControllerInstance.deleteImage.bind(imageControllerInstance));

// Immobilier Routes
router.post("/immobiliers/create", immobilierControllerInstance.createImmobilier.bind(immobilierControllerInstance));
// Marche
router.get("/immobiliers", immobilierControllerInstance.listImmobilier.bind(immobilierControllerInstance));
// Marche
router.put("/immobiliers/:id", immobilierControllerInstance.updateImmobilier.bind(immobilierControllerInstance));
router.delete("/immobiliers/:id", immobilierControllerInstance.deleteImmobilier.bind(immobilierControllerInstance));

// Inspection Routes
// Marche
router.post("/inspections/create", inspectionControllerInstance.createInspection.bind(inspectionControllerInstance));
// Marche
router.get("/inspections/:immobilierId", inspectionControllerInstance.listInspections.bind(inspectionControllerInstance));
// Marche
router.put("/inspections/:id", inspectionControllerInstance.updateInspection.bind(inspectionControllerInstance));
// Marche
router.delete("/inspections/:id", inspectionControllerInstance.deleteInspection.bind(inspectionControllerInstance));

// Intervention Routes
// Marche
router.post("/interventions/create", interventionControllerInstance.createIntervention.bind(interventionControllerInstance));
// Marche
router.get("/interventions/:immobilierId", interventionControllerInstance.listInterventions.bind(interventionControllerInstance));
// Marche
router.put("/interventions/:id", interventionControllerInstance.updateIntervention.bind(interventionControllerInstance));
// Marche
router.delete("/interventions/:id", interventionControllerInstance.deleteIntervention.bind(interventionControllerInstance));

// Prestation Routes
// Marche
router.post("/prestations/create", prestationControllerInstance.createPrestation.bind(prestationControllerInstance));
// Marche
router.put("/prestations/:id", prestationControllerInstance.updatePrestation.bind(prestationControllerInstance));
// Marche
router.delete("/prestations/:id", prestationControllerInstance.deletePrestation.bind(prestationControllerInstance));

// Reservation Routes
// Marche
router.post("/reservations/create", reservationControllerInstance.createReservation.bind(reservationControllerInstance));
// Marche
router.get("/reservations/:immobilierId", reservationControllerInstance.listReservations.bind(reservationControllerInstance));
// Marche
router.put("/reservations/:id", reservationControllerInstance.updateReservation.bind(reservationControllerInstance));
// Marche
router.delete("/reservations/:id", reservationControllerInstance.deleteReservation.bind(reservationControllerInstance));

router.post('/user-abonnements', (req, res) => userAbonnementControllerInstance.createUserAbonnement(req, res));
router.put('/user-abonnements/:userId', (req, res) => userAbonnementControllerInstance.updateUserAbonnement(req, res));
router.delete('/user-abonnements/:id', (req, res) => userAbonnementControllerInstance.deleteUserAbonnement(req, res));
router.get('/user-abonnements', (req, res) => userAbonnementControllerInstance.getAllUserAbonnements(req, res));
router.get('/user-abonnements/:id', (req, res) => userAbonnementControllerInstance.getUserAbonnementById(req, res));


// Role Routes
router.get("/roles", authMiddleware, roleMiddleware(1,3), roleControllerInstance.getRoles.bind(roleControllerInstance));

// User Routes
// Marche
router.post("/auth/signup", userControllerInstance.signup.bind(userControllerInstance));
// Marche
router.post("/auth/login", userControllerInstance.login.bind(userControllerInstance));
// Marche
router.delete("/logout", userControllerInstance.logout.bind(userControllerInstance));
// Marche
router.get("/users", userControllerInstance.getUsers.bind(userControllerInstance));
// Marche
router.put("/users/:id", userControllerInstance.updateUser.bind(userControllerInstance));
// Marche
router.put("/userRole/:id", userControllerInstance.updateUserRole.bind(userControllerInstance));
// Marche
router.delete("/users/:id", userControllerInstance.deleteUser.bind(userControllerInstance));

export const initRoutes = (app: express.Express) => {
    app.use('/api', router);
};
