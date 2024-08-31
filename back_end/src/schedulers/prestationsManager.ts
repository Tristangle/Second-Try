import { DataSource } from "typeorm";
import { UserAbonnement } from "../database/entities/userAbonnement";

export class PrestationsManager {
    constructor(private readonly db: DataSource) {}

    async useMediumPrestation(userAbonnement: UserAbonnement): Promise<void> {
        if (userAbonnement.remainingMediumPrestations > 0 && !this.isInCooldown(userAbonnement.mediumPrestationsCooldownEnd)) {
            userAbonnement.remainingMediumPrestations -= 1;
            userAbonnement.mediumPrestationsCooldownEnd = this.calculateCooldownEnd(userAbonnement, "medium");
            await this.db.getRepository(UserAbonnement).save(userAbonnement);
        } else {
            throw new Error("No available prestations or cooldown in effect");
        }
    }

    async useLimitlessPrestation(userAbonnement: UserAbonnement): Promise<void> {
        if (userAbonnement.remainingLimitlessPrestations > 0 && !this.isInCooldown(userAbonnement.limitlessPrestationsCooldownEnd)) {
            userAbonnement.remainingLimitlessPrestations -= 1;
            userAbonnement.limitlessPrestationsCooldownEnd = this.calculateCooldownEnd(userAbonnement, "limitless");
            await this.db.getRepository(UserAbonnement).save(userAbonnement);
        } else {
            throw new Error("No available prestations or cooldown in effect");
        }
    }

    private isInCooldown(cooldownEnd: Date | null): boolean {
        if (!cooldownEnd) return false;
        return new Date() < cooldownEnd;
    }

    private calculateCooldownEnd(userAbonnement: UserAbonnement, prestationType: "medium" | "limitless"): Date {
        const cooldownDuration = prestationType === "medium" ? 365 : 180; // ex: 365 jours pour medium, 180 jours pour limitless
        return new Date(Date.now() + cooldownDuration * 24 * 60 * 60 * 1000); // ajouter la durée en jours
    }

    async resetPrestations(userAbonnement: UserAbonnement): Promise<void> {
        const abonnement = userAbonnement.abonnement;

        let remainingMediumPrestations = 0;
        let remainingLimitlessPrestations = 0;

        abonnement.benefits.forEach((benefit) => {
            if (benefit.type === "Medium Prestations") {
                remainingMediumPrestations = benefit.value || 0;
            } else if (benefit.type === "Limitless Prestations") {
                remainingLimitlessPrestations = benefit.value || 0;
            }
        });

        userAbonnement.remainingMediumPrestations = remainingMediumPrestations;
        userAbonnement.remainingLimitlessPrestations = remainingLimitlessPrestations;

        userAbonnement.mediumPrestationsCooldownEnd = null;
        userAbonnement.limitlessPrestationsCooldownEnd = null;

        await this.db.getRepository(UserAbonnement).save(userAbonnement);
    }
}

