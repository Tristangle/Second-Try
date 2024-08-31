import express from "express";
import { abonnementControllerInstance } from "../domain/controllers/abonnementController";
import { bannissementControllerInstance } from "../domain/controllers/bannissementController";
import { contactControllerInstance } from "../domain/controllers/contactController";
import { devisControllerInstance } from "../domain/controllers/devisController";
import { documentControllerInstance } from "../domain/controllers/documentController";
import { factureControllerInstance } from "../domain/controllers/factureController";
import { imageControllerInstance } from "../domain/controllers/imageController";
import { immobilierControllerInstance } from "../domain/controllers/immobilierController";
import { inspectionControllerInstance } from "../domain/controllers/inspectionController";
import { interventionControllerInstance } from "../domain/controllers/interventionController";
import { interventionPrestationControllerInstance } from "../domain/controllers/interventionPrestationController";
import { notationControllerInstance } from "../domain/controllers/notationController";
import { prestationControllerInstance } from "../domain/controllers/prestationController";
import { reservationControllerInstance } from "../domain/controllers/reservationController";
import { roleControllerInstance } from "../domain/controllers/roleController";
import { userAbonnementControllerInstance } from "../domain/controllers/userAbonnementController";
import { userControllerInstance } from "../domain/controllers/userController";
import { userDocumentControllerInstance } from "../domain/controllers/userDocumentController";
import { authMiddleware } from "../handlers/middleware/auth-middleware";
import { roleMiddleware } from "../handlers/middleware/role-middleware";
import { banMiddleware } from "./middleware/banMiddleware";

const router = express.Router();

// Marche
router.post("/auth/signup", userControllerInstance.signup.bind(userControllerInstance));
// Marche
router.post("/auth/login", userControllerInstance.login.bind(userControllerInstance));

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
router.get("/devis/user/:userId", devisControllerInstance.getDevisByUserId.bind(devisControllerInstance));

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
router.get("/factures/:id/download", factureControllerInstance.downloadFacturePDF.bind(factureControllerInstance));
router.get("/factures/user/:userId", factureControllerInstance.getFacturesByUser.bind(factureControllerInstance));

// Image Routes
// Marche
router.post("/images/create", imageControllerInstance.createImage.bind(imageControllerInstance));
// Marche
router.get("/images/:immobilierId", imageControllerInstance.imageList.bind(imageControllerInstance));
// Marche
router.delete("/images/:id", imageControllerInstance.deleteImage.bind(imageControllerInstance));

// Immobilier Routes
// Marche
router.post("/immobiliers/create", immobilierControllerInstance.createImmobilier.bind(immobilierControllerInstance));
// Marche
router.get("/immobiliers/admin",roleMiddleware(1), immobilierControllerInstance.listImmobilierAdmin.bind(immobilierControllerInstance));
router.get("/immobiliers", immobilierControllerInstance.listImmobilier.bind(immobilierControllerInstance));
router.get("/immobiliers/owner/:ownerId", immobilierControllerInstance.getImmobiliersByOwnerId.bind(immobilierControllerInstance));
router.get('/immobiliers/renter/:renterId', immobilierControllerInstance.getImmobiliersByRenter.bind(immobilierControllerInstance));
router.get('/immobiliers/:id', immobilierControllerInstance.getImmobilierById.bind(immobilierControllerInstance));

router.put("/immobiliers/:id", immobilierControllerInstance.updateImmobilier.bind(immobilierControllerInstance));
router.put('/immobiliers/:id/approve',roleMiddleware(1), immobilierControllerInstance.approveImmobilier.bind(immobilierControllerInstance));
router.put('/immobiliers/:id/reject',roleMiddleware(1), immobilierControllerInstance.rejectImmobilier.bind(immobilierControllerInstance));
router.delete("/immobiliers/:id", immobilierControllerInstance.deleteImmobilier.bind(immobilierControllerInstance));

router.get('/finances/revenue', immobilierControllerInstance.getRevenue.bind(immobilierControllerInstance));
router.get('/finances/expenses', immobilierControllerInstance.getExpenses.bind(immobilierControllerInstance));

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
router.post("/interventions/:interventionId/payment", interventionControllerInstance.processPayment.bind(interventionControllerInstance));
// Marche
router.get("/interventions/:immobilierId", interventionControllerInstance.listInterventions.bind(interventionControllerInstance));
// Marche
router.put("/interventions/:id", interventionControllerInstance.updateIntervention.bind(interventionControllerInstance));
router.delete("/interventions/:id", interventionControllerInstance.deleteIntervention.bind(interventionControllerInstance));

// Prestation Routes
// Marche
router.post("/prestations/create", prestationControllerInstance.createPrestation.bind(prestationControllerInstance));
// Marche
router.put("/prestations/:id", prestationControllerInstance.updatePrestation.bind(prestationControllerInstance));
// Marche
router.delete("/prestations/:id", prestationControllerInstance.deletePrestation.bind(prestationControllerInstance));
// Marche
router.get('/prestations', prestationControllerInstance.getPrestations.bind(prestationControllerInstance));
router.get("/prestations/non-explorator", prestationControllerInstance.getNonExploratorPrestations.bind(prestationControllerInstance));

// Marche
router.get('/prestations/:id', prestationControllerInstance.getPrestationByID.bind(prestationControllerInstance));
// Marche
router.get('/prestations/user/:userId', prestationControllerInstance.getPrestationsByUserId.bind(prestationControllerInstance));


// InterventionPrestation Routes
// Marche
router.post('/interventions-prestations/create', interventionPrestationControllerInstance.addPrestationToIntervention.bind(interventionPrestationControllerInstance));
// Marche
router.put('/interventions-prestations/:id', interventionPrestationControllerInstance.updateInterventionPrestation.bind(interventionPrestationControllerInstance));
// Marche
router.delete('/interventions-prestations/:interventionId/:prestationId', interventionPrestationControllerInstance.removePrestationFromIntervention.bind(interventionPrestationControllerInstance));
// Marche
router.get('/interventions-prestations/:interventionId', interventionPrestationControllerInstance.getPrestationsForIntervention.bind(interventionPrestationControllerInstance));

// Reservation Routes

router.post("/reservations/create", reservationControllerInstance.createReservation.bind(reservationControllerInstance));
router.post("/reservations/admin/create", roleMiddleware(1),reservationControllerInstance.createAdminReservation.bind(reservationControllerInstance));

router.get("/reservations/:immobilierId", reservationControllerInstance.listReservations.bind(reservationControllerInstance));


router.put("/reservations/:id", reservationControllerInstance.updateReservation.bind(reservationControllerInstance));

router.delete("/reservations/:id", reservationControllerInstance.deleteReservation.bind(reservationControllerInstance));

// UserAbonnement Routes
router.post('/user-abonnements/create', userAbonnementControllerInstance.createUserAbonnement.bind(userAbonnementControllerInstance));
router.put('/user-abonnements/:userId', userAbonnementControllerInstance.updateUserAbonnement.bind(userAbonnementControllerInstance));
router.delete('/user-abonnements/:id', userAbonnementControllerInstance.deleteUserAbonnement.bind(userAbonnementControllerInstance));
router.get('/user-abonnements', userAbonnementControllerInstance.getAllUserAbonnements.bind(userAbonnementControllerInstance));
router.get('/user-abonnements/user/:userId', userAbonnementControllerInstance.getUserAbonnementById.bind(userAbonnementControllerInstance));

// UserDocument Routes
router.post('/user-documents', userDocumentControllerInstance.create.bind(userDocumentControllerInstance));
router.delete('/user-documents/:id', userDocumentControllerInstance.delete.bind(userDocumentControllerInstance));
router.get('/user-documents', userDocumentControllerInstance.getAll.bind(userDocumentControllerInstance));
router.get('/user-documents/user/:userId', userDocumentControllerInstance.getById.bind(userDocumentControllerInstance));

// Marche
router.post('/notations/create', notationControllerInstance.createNotation.bind(notationControllerInstance));
// Marche
router.put('/notations/:id', notationControllerInstance.updateNotation.bind(notationControllerInstance));
// Marche
router.delete('/notations/:id', notationControllerInstance.deleteNotation.bind(notationControllerInstance));
// Marche
router.get('/notations', notationControllerInstance.getAllNotations.bind(notationControllerInstance));
// Marche
router.get('/notations/:id', notationControllerInstance.getNotationById.bind(notationControllerInstance));
// Marche
router.get('/notations/prestation/:prestationId', notationControllerInstance.getNotationsByPrestationId.bind(notationControllerInstance));
// Marche
router.get('/notations/user/:userId', notationControllerInstance.getNotationsByUserId.bind(notationControllerInstance));


// Role Routes
router.get("/roles", roleMiddleware(1,3), roleControllerInstance.getRoles.bind(roleControllerInstance));

// Bannissement Routes
// Marche
router.post('/bannissements/create', bannissementControllerInstance.createBannissement.bind(bannissementControllerInstance));
// Marche
router.put('/bannissements/:id', bannissementControllerInstance.updateBannissement.bind(bannissementControllerInstance));
// Marche
router.delete('/bannissements/:id', bannissementControllerInstance.deleteBannissement.bind(bannissementControllerInstance));
// Marche
router.get('/bannissements', bannissementControllerInstance.getAllBannissements.bind(bannissementControllerInstance));
// Marche
router.get('/bannissements/:id', bannissementControllerInstance.getBannissementById.bind(bannissementControllerInstance));

// User Routes

// Marche
router.delete("/logout", userControllerInstance.logout.bind(userControllerInstance));
// Marche
router.get("/users", userControllerInstance.getUsers.bind(userControllerInstance));
router.get("/users/:id", userControllerInstance.getUserById.bind(userControllerInstance));
// Marche
router.put("/users/:id", userControllerInstance.updateUser.bind(userControllerInstance));
// Marche
router.put("/userRole/:id", userControllerInstance.updateUserRole.bind(userControllerInstance));
router.put('/admin/users/:userId', userControllerInstance.updateAdminUser.bind(userControllerInstance));
// Marche
router.delete("/users/:id", userControllerInstance.deleteUser.bind(userControllerInstance));

router.post('/contact', contactControllerInstance.sendContactForm.bind(contactControllerInstance));


export const initRoutes = (app: express.Express) => {
    app.use('/api', router);
};
