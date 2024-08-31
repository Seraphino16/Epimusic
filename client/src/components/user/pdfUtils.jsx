import jsPDF from 'jspdf';

export const generateOrderPDF = (orderDetails) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Détails de la commande #${orderDetails.id}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Nom du client: ${orderDetails.firstName} ${orderDetails.lastName}`, 10, 20);
    doc.text(`Date de création: ${orderDetails.createdAt}`, 10, 30);

    if (orderDetails.address) {
        doc.text(`Adresse de livraison:`, 10, 40);
        doc.text(`Nom: ${orderDetails.address.name}`, 10, 50);
        doc.text(`Téléphone: ${orderDetails.address.telephone}`, 10, 60);
        doc.text(`Email: ${orderDetails.address.email}`, 10, 70);
        doc.text(`Adresse: ${orderDetails.address.address}`, 10, 80);
        if (orderDetails.address.complement) {
            doc.text(`Complément: ${orderDetails.address.complement}`, 10, 90);
        }
        doc.text(`Code postal: ${orderDetails.address.postalCode}`, 10, 100);
        doc.text(`Ville: ${orderDetails.address.city}`, 10, 110);
        doc.text(`Pays: ${orderDetails.address.country}`, 10, 120);
    }

    doc.text(`Frais de livraison: ${orderDetails.ShippingCost} €`, 10, 130);
    doc.text(`Prix total avec frais de livraison: ${orderDetails.totalWithShippingCost} €`, 10, 140);

    let startY = 150;
    doc.text('Détails des articles:', 10, startY);
    startY += 10;

    doc.text('Produit', 10, startY);
    doc.text('Couleur', 50, startY);
    doc.text('Taille', 90, startY);
    doc.text('Quantité', 130, startY);
    doc.text('Prix unitaire', 160, startY);

    startY += 10;

    orderDetails.items.forEach((item, index) => {
        doc.text(`${item.productName}`, 10, startY + (index * 10));
        doc.text(`${item.color || '-'}`, 50, startY + (index * 10));
        doc.text(`${item.size || '-'}`, 90, startY + (index * 10));
        doc.text(`${item.quantity}`, 130, startY + (index * 10));
        doc.text(`${item.unitPrice} €`, 160, startY + (index * 10));
    });

    startY += orderDetails.items.length * 10 + 10;
    doc.text(`Prix Total: ${orderDetails.totalPrice} €`, 10, startY);

    doc.save(`commande_${orderDetails.id}.pdf`);
};