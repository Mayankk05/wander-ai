import prisma from '../lib/prisma.js';
import { checkTripAccess } from '../lib/checkTripAccess.js';
import { generatePDFInBackground } from '../lib/queue.js';

export const exportTripPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let trip = await prisma.trip.findFirst({ 
        where: { 
            OR: [
                { id: id },
                { shareLink: id }
            ]
        } 
    });

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.isPublic) {
        if (!req.userId) {
            return res.status(401).json({ error: "Please log in to download this private itinerary." });
        }
        const access = await checkTripAccess(trip.id, req.userId);
        if (!access.authorized) return res.status(access.status).json({ error: access.error });
    }

    const it = trip.itinerary || {};
    const currency = it.currency || 'INR';

    const pdfBuffer = await generatePDFInBackground(trip, currency);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=trip-${id}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "PDF export failed");
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF export failed" });
    }
  }
};
