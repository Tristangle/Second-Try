import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Facture } from '../../database/entities/facture';

export class PDFService {
    generateInvoicePDF(facture: Facture): Uint8Array {
        const doc = new jsPDF();

        // Ajouter le titre de la facture
        doc.setFontSize(20);
        doc.text(`Facture #${facture.id} - ${facture.name}`, 10, 20);

        // Ajouter les informations de l'émetteur et du receveur
        doc.setFontSize(12);
        doc.text(`Émetteur: ${facture.emetteur.username} (${facture.emailEmetteur})`, 10, 40);
        doc.text(`Adresse Émetteur: ${facture.adresseEmetteur}`, 10, 50);
        if (facture.receveur) {
            doc.text(`Receveur: ${facture.receveur.username}`, 10, 60);
        }

        // Ajouter la date
        doc.text(`Date: ${new Date(facture.date).toLocaleDateString()}`, 10, 70);

        // Ajouter le tableau des items facturés
        autoTable(doc, {
            startY: 80,
            head: [['Quantité', 'Désignation', 'Taux TVA', 'Prix Unitaire', 'Total HT', 'Total TTC']],
            body: facture.content.map(item => [
                item.quantite.toString(),
                item.designation,
                item.tauxTVA,
                item.prixUnitaire.toFixed(2) + ' €',
                item.totalHT.toFixed(2) + ' €',
                item.totalTTC.toFixed(2) + ' €'
            ])
        });

        // Convertir le document en ArrayBuffer
        const pdfArrayBuffer = doc.output('arraybuffer');

        // Retourner le buffer
        return new Uint8Array(pdfArrayBuffer);
    }
}
