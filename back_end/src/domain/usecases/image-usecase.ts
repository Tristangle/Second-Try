import { DataSource } from "typeorm";
import { Image } from "../../database/entities/image";
import { Immobilier } from "../../database/entities/immobilier";
import { createImageValidationRequest, imageListValidationRequest } from "../../handlers/validators/image-validation";

export class imageUseCase {
    constructor(private readonly db: DataSource) {}
        // List images
        async imageList(immobilierId: number,listImage: imageListValidationRequest): Promise<{image: Image[]}>{
            const query = this.db.getRepository(Image)
                .createQueryBuilder('image')
                .where('image.immobilierId = :immobilierId', { immobilierId })
                .take(listImage.result);
            
                const listeImage = await query.getMany();
                return {image: listeImage};
        }
        // Create Image
        async createImage(createImage: createImageValidationRequest): Promise<Image> {
            const imageRepository = this.db.getRepository(Image);
            const immobilierRepository = this.db.getRepository(Immobilier);
        
            // Rechercher l'immobilier correspondant à l'immobilierId fourni
            const immobilier = await immobilierRepository.findOne({ where: { id: createImage.immobilierId } });
            
            if (!immobilier) {
                throw new Error("Immobilier introuvable");
            }
        
            // Créer une nouvelle image en associant l'immobilier trouvé
            const newImage = imageRepository.create({
                ...createImage,
                immobilier: immobilier,  // Associer l'entité Immobilier
            });
        
            return await imageRepository.save(newImage);
        }
        
        
        // Delete Image
        async deleteImage(imageId: number): Promise<void>{
        const imageRepository = this.db.getRepository(Image);
        const imageSearch =  await imageRepository.findOneBy({id: imageId});
        if(imageSearch){
            await imageRepository.remove(imageSearch);
        }
        }

}