import prisma from './prisma.js';

export async function checkTripAccess(tripId, userId, requireEditor = false, userEmail = null) {
  try {
    const trip = await prisma.trip.findUnique({ 
      where: { id: tripId },
      include: { 
        collaborators: true
      }
    });
    
    if (!trip) {
      return { authorized: false, error: "Trip not found", status: 404 };
    }
    
    if (trip.userId === userId) {
      return { authorized: true, trip, isOwner: true, role: "owner" };
    }
    
    const collaborator = trip.collaborators.find(c => 
      c.userId === userId || (userEmail && c.email === userEmail)
    );
    
    if (!collaborator) {
      return { authorized: false, error: "Not authorized", status: 403 };
    }
    
    if (requireEditor && collaborator.role === "viewer") {
      return { authorized: false, error: "Editor access required", status: 403 };
    }
    
    return { authorized: true, trip, isOwner: false, role: collaborator.role };
  } catch (err) {
    console.error(`[AccessCheck] Error for trip ${tripId}, user ${userId}:`, err.message);
    return { authorized: false, error: "Server error", status: 500 };
  }
}
