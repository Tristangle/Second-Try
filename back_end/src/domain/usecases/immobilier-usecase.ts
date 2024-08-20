import { DataSource, In } from "typeorm";
import { Devis } from "../../database/entities/devis";
import { Facture } from "../../database/entities/facture";
import { Immobilier } from "../../database/entities/immobilier";
import { Inspection } from "../../database/entities/inspection";
import { Intervention } from "../../database/entities/intervention";
import { Image } from "../../database/entities/image";
import { Reservation } from "../../database/entities/reservation";
import { User } from "../../database/entities/user";
import { createImmobilierValidationRequest, immobilierListValidationRequest, updateImmobilierValidationRequest } from "../../handlers/validators/immobilier-validation";
import { devisUseCase } from "./devis-usecase";
import { AppDataSource } from "../../database/database";
import { interventionUseCase } from "./intervention-usecase";
import { reservationUseCase } from "./reservation-usecase";
import { factureUseCase } from "./facture-usecase";
import { inspectionUseCase } from "./inspection-usecase";

export class immobilierUseCase {
    constructor(private readonly db: DataSource) {}

        // List Immobilier
        async immobilierList(listImmobilier: immobilierListValidationRequest): Promise<{immobilier: Immobilier[]}>{
            const query = this.db.getRepository(Immobilier)
                .createQueryBuilder('immobilier')
                .take(listImmobilier.result);
            
                const listeImmobilier = await query.getMany();
                return {immobilier: listeImmobilier};
        }
        // Create Immobilier
        async createImmobilier(createImmobilier: createImmobilierValidationRequest): Promise<Immobilier> {
            const immobilierRepository = this.db.getRepository(Immobilier);
            const owner = await this.db.getRepository(User).findOneBy({ id: createImmobilier.ownerId });
        
            if (!owner) {
                throw new Error("Owner not found");
            }
        
            const newImmobilier = immobilierRepository.create({
                ...createImmobilier,
                owner: owner,
            });
        
            return immobilierRepository.save(newImmobilier);
        }
        async updateImmobilier(immobilierId: number, updateImmobilier: updateImmobilierValidationRequest): Promise<Immobilier | null> {
            const immobilierRepository = this.db.getRepository(Immobilier);
            const userRepository = this.db.getRepository(User);
            const imageRepository = this.db.getRepository(Image);
    
            const immobilier = await immobilierRepository.findOneBy({ id: immobilierId });
    
            if (!immobilier) {
                return null;
            }
    
            // Update owner if provided
            if (updateImmobilier.ownerId) {
                const owner = await userRepository.findOneBy({ id: updateImmobilier.ownerId });
                if (!owner) {
                    throw new Error("Owner not found");
                }
                immobilier.owner = owner;
            }
    
            // Update renter if provided
            if (updateImmobilier.renterId) {
                const renter = await userRepository.findOneBy({ id: updateImmobilier.renterId });
                if (!renter) {
                    throw new Error("Renter not found");
                }
                immobilier.renter = renter;
            }
    
            // Update other fields
            if (updateImmobilier.name) {
                immobilier.name = updateImmobilier.name;
            }
    
            if (updateImmobilier.content) {
                immobilier.content = {
                    description: updateImmobilier.content.description || immobilier.content.description,
                    adresse: updateImmobilier.content.adresse || immobilier.content.adresse
                };
            }
    
            // Update associations like factures, devis, etc.
            if (updateImmobilier.factures) {
                immobilier.factures = await this.db.getRepository(Facture).findByIds(updateImmobilier.factures);
            }
    
            if (updateImmobilier.devis) {
                immobilier.devis = await this.db.getRepository(Devis).findByIds(updateImmobilier.devis);
            }
    
            if (updateImmobilier.interventions) {
                immobilier.interventions = await this.db.getRepository(Intervention).findByIds(updateImmobilier.interventions);
            }
    
            if (updateImmobilier.reservations) {
                immobilier.reservations = await this.db.getRepository(Reservation).findByIds(updateImmobilier.reservations);
            }
    
            if (updateImmobilier.inspections) {
                immobilier.inspections = await this.db.getRepository(Inspection).findByIds(updateImmobilier.inspections);
            }
    
            // Update images based on URLs provided
            if (updateImmobilier.images) {
                const images = await imageRepository.findBy({
                    url: In(updateImmobilier.images.map(image => image.url))
                });
                immobilier.images = images;
            }
    
            return await immobilierRepository.save(immobilier);
        }
        
        async deleteImmobilier(immobilierId: number): Promise<void> {
            const immobilierRepository = this.db.getRepository(Immobilier);
            const imageRepository = this.db.getRepository(Image);
            const devisUsecase = new devisUseCase(AppDataSource);
            const interventionUsecase = new interventionUseCase(AppDataSource);
            const reservationUsecase = new reservationUseCase(AppDataSource);
            const factureUsecase = new factureUseCase(AppDataSource);
            const inspectionUsecase = new inspectionUseCase(AppDataSource); // Utilisation du inspectionUsecase
        
            const immobilierSearch = await immobilierRepository.findOne({
                where: { id: immobilierId },
                relations: ["images", "devis", "interventions", "reservations", "inspections", "factures"]
            });
        
            if (immobilierSearch) {
                // Supprimer toutes les réservations associées en utilisant le use case
                if (immobilierSearch.reservations && immobilierSearch.reservations.length > 0) {
                    for (const reservation of immobilierSearch.reservations) {
                        await reservationUsecase.deleteReservation(reservation.id);
                    }
                }
        
                // Supprimer toutes les images associées
                if (immobilierSearch.images && immobilierSearch.images.length > 0) {
                    await imageRepository.remove(immobilierSearch.images);
                }
        
                // Supprimer tous les devis associés en utilisant le use case
                if (immobilierSearch.devis && immobilierSearch.devis.length > 0) {
                    for (const devis of immobilierSearch.devis) {
                        await devisUsecase.deleteDevis(devis.id);
                    }
                }
        
                // Supprimer toutes les interventions associées en utilisant le use case
                if (immobilierSearch.interventions && immobilierSearch.interventions.length > 0) {
                    for (const intervention of immobilierSearch.interventions) {
                        await interventionUsecase.deleteIntervention(intervention.id);
                    }
                }
        
                // Supprimer toutes les inspections associées en utilisant le use case
                if (immobilierSearch.inspections && immobilierSearch.inspections.length > 0) {
                    for (const inspection of immobilierSearch.inspections) {
                        await inspectionUsecase.deleteInspection(inspection.id);
                    }
                }
        
                // Supprimer toutes les factures associées en utilisant le use case
                if (immobilierSearch.factures && immobilierSearch.factures.length > 0) {
                    for (const facture of immobilierSearch.factures) {
                        await factureUsecase.deleteFacture(facture.id);
                    }
                }
        
                // Supprimer l'immobilier
                await immobilierRepository.remove(immobilierSearch);
            }
        }
        
}