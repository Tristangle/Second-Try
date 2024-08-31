import { DataSource } from 'typeorm';
import { Notation } from '../../database/entities/notation';
import { Prestation } from '../../database/entities/prestation';
import { User } from '../../database/entities/user';
import { createNotationValidation, createNotationValidationRequest, updateNotationValidation, updateNotationValidationRequest } from '../../handlers/validators/notation-validation';

export class NotationUseCase {
    constructor(private readonly db: DataSource) {}

    // Create a new Notation
    async createNotation(createNotation: createNotationValidationRequest): Promise<Notation> {
        const { error } = createNotationValidation.validate(createNotation);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const prestationRepository = this.db.getRepository(Prestation);
        const userRepository = this.db.getRepository(User);
        const notationRepository = this.db.getRepository(Notation);

        const prestation = await prestationRepository.findOne({ where: { id: createNotation.prestationId } });
        const user = await userRepository.findOne({ where: { id: createNotation.userId } });

        if (!prestation || !user) {
            throw new Error("Prestation or User not found");
        }

        // Vérifier si une notation pour cette prestation par ce user existe déjà
        const existingNotation = await notationRepository.findOne({
            where: {
                prestation: { id: createNotation.prestationId },
                user: { id: createNotation.userId }
            }
        });

        if (existingNotation) {
            throw new Error("A notation for this prestation by this user already exists");
        }

        const notationData = notationRepository.create({
            score: createNotation.score,
            prestation: prestation,
            user: user,
            commentaire: createNotation.commentaire
        });

        const newNotation = await notationRepository.save(notationData);

        return newNotation;
    }

    // Update an existing Notation
    async updateNotation(notationId: number, updateNotation: updateNotationValidationRequest): Promise<Notation | null> {
        const notationRepository = this.db.getRepository(Notation);
        const prestationRepository = this.db.getRepository(Prestation);
        const userRepository = this.db.getRepository(User);

        const notation = await notationRepository.findOne({
            where: { id: notationId },
            relations: ["prestation", "user"]
        });

        if (!notation) {
            return null;
        }

        // Update fields if provided
        if (updateNotation.score !== undefined) {
            notation.score = updateNotation.score;
        }

        if (updateNotation.prestationId !== undefined) {
            const prestation = await prestationRepository.findOne({ where: { id: updateNotation.prestationId } });
            if (!prestation) {
                throw new Error("Prestation not found");
            }
            notation.prestation = prestation;
        }

        if (updateNotation.userId !== undefined) {
            const user = await userRepository.findOne({ where: { id: updateNotation.userId } });
            if (!user) {
                throw new Error("User not found");
            }
            notation.user = user;
        }
        if (updateNotation.commentaire !== undefined) {
            notation.commentaire = updateNotation.commentaire; 
        }

        return await notationRepository.save(notation);
    }

    // Delete a Notation
    async deleteNotation(notationId: number): Promise<void> {
        const notationRepository = this.db.getRepository(Notation);
        const notation = await notationRepository.findOne({ where: { id: notationId } });

        if (notation) {
            await notationRepository.remove(notation);
        }
    }

    // Get all Notations
    async getAllNotations(): Promise<Notation[]> {
        const notationRepository = this.db.getRepository(Notation);
        return await notationRepository.find({ relations: ['prestation', 'user'] });
    }

    // Get a specific Notation by ID
    async getNotationById(notationId: number): Promise<Notation | null> {
        const notationRepository = this.db.getRepository(Notation);
        return await notationRepository.findOne({
            where: { id: notationId },
            relations: ['prestation', 'user']
        });
    }
// Get Notations by Prestation ID
async getNotationsByPrestationId(prestationId: number): Promise<{ notations: Notation[], moyenne: number }> {
    const notationRepository = this.db.getRepository(Notation);

    // Récupérer toutes les notations pour la prestation spécifiée
    const notations = await notationRepository.find({
        where: { prestation: { id: prestationId } },
        relations: ['prestation', 'user']
    });

    // Calculer la moyenne des notes
    const moyenne = notations.length > 0
        ? notations.reduce((acc, notation) => acc + notation.score, 0) / notations.length
        : 0;

    return {
        notations,
        moyenne
    };
}

    
        // Get Notations by User ID
        async getNotationsByUserId(userId: number): Promise<Notation[]> {
            const notationRepository = this.db.getRepository(Notation);
            return await notationRepository.find({
                where: { user: { id: userId } },
                relations: ['prestation', 'user']
            });
        }
}
