import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../assets/logo.png';

export const generateOrderPDF = (orderDetails) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const marginLeft = 20;
    const marginTop = 40;

    // Ajouter le logo (taille réduite et positionné à droite du titre)
    const logoWidth = 20;
    const logoHeight = 15;
    const logoPositionX = 160;
    const logoPositionY = 10;

    doc.addImage(logo, 'PNG', logoPositionX, logoPositionY, logoWidth, logoHeight);

    // Titre de la facture
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('Bon de commande', 105, 20, { align: 'center' });

    // Ligne de séparation sous le titre
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(1);
    doc.line(20, 30, 190, 30);

    // Adresse de facturation (en haut à gauche)
    if (orderDetails.billingAddress) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Adresse de facturation', marginLeft, marginTop);
        doc.setFont('helvetica', 'normal');
        doc.text(orderDetails.billingAddress.name, marginLeft, marginTop + 5);
        doc.text(orderDetails.billingAddress.address, marginLeft, marginTop + 10);
        doc.text(`${orderDetails.billingAddress.postalCode} ${orderDetails.billingAddress.city}, ${orderDetails.billingAddress.country}`, marginLeft, marginTop + 15);
    }

    // Adresse de destinataire (en haut à droite)
    if (orderDetails.deliveryAddress) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Destinataire', 150, marginTop);
        doc.setFont('helvetica', 'normal');
        doc.text(orderDetails.deliveryAddress.name, 150, marginTop + 5);
        doc.text(orderDetails.deliveryAddress.address, 150, marginTop + 10);
        doc.text(`${orderDetails.deliveryAddress.postalCode} ${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.country}`, 150, marginTop + 15);
    }

    // Informations sur la commande (en dessous des adresses)
    let infoTop = marginTop + 30;
    doc.setFont('helvetica', 'bold');
    doc.text('Informations sur la commande', marginLeft, infoTop);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${orderDetails.createdAt}`, marginLeft, infoTop + 5);
    doc.text(`Bon de commande N° : ${orderDetails.id}`, marginLeft, infoTop + 10);
    doc.text(`Date d'échéance : ${orderDetails.dueDate}`, marginLeft, infoTop + 15);

    // Tableau des articles commandés (positionné après "Informations sur la commande")
    const tableHeaders = ['Produit', 'Quantité', 'Prix unitaire HT'];
    if (orderDetails.items.some(item => item.color)) {
        tableHeaders.splice(1, 0, 'Couleur');
    }
    if (orderDetails.items.some(item => item.size)) {
        tableHeaders.splice(2, 0, 'Taille');
    }

    const tableBody = orderDetails.items.map(item => {
        const row = [item.productName];

        if (tableHeaders.includes('Couleur')) {
            row.push(item.color || '');
        }

        if (tableHeaders.includes('Taille')) {
            row.push(item.size || '');
        }

        row.push(item.quantity);
        row.push(`${item.unitPrice.toFixed(2)} €`);

        return row;
    });

    doc.autoTable({
        startY: infoTop + 25,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [0, 172, 237],
            textColor: 255,
            halign: 'center',
            fontStyle: 'bold'
        },
        bodyStyles: {
            halign: 'center'
        }
    });

    // Résumé des coûts (à la suite du tableau)
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total HT: ${orderDetails.subTotal.toFixed(2)} €`, 150, finalY);
    finalY += 5;
    doc.text(`Frais de livraison: ${orderDetails.ShippingCost.toFixed(2)} €`, 150, finalY);
    finalY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total TTC: ${orderDetails.totalWithShippingCost.toFixed(2)} €`, 150, finalY);

    // Enregistrer le PDF
    doc.save(`facture_commande_${orderDetails.id}.pdf`);
};