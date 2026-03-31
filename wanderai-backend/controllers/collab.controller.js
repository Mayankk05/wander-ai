import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { sendCollaboratorInviteEmail } from '../lib/emailService.js';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]).default("viewer").optional()
});

export const inviteCollaborator = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const validation = inviteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed" });
    }
    const { email, role } = validation.data;
    
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });
    
    const owner = await prisma.user.findUnique({ where: { id: req.userId } });
    if (owner && owner.email === email) {
      return res.status(400).json({ error: "Cannot invite yourself" });
    }
    
    const existing = await prisma.collaborator.findFirst({
      where: { tripId: id, email }
    });
    if (existing) {
      return res.status(400).json({ error: "User already a collaborator" });
    }
    
    const invitedUser = await prisma.user.findUnique({ where: { email } });

    const collaborator = await prisma.collaborator.create({
      data: {
        email,
        role: role || "viewer",
        tripId: id,
        userId: invitedUser?.id || null,
        userName: invitedUser?.name || null
      }
    });

    try {
      await sendCollaboratorInviteEmail(email, owner.name, trip.title, role || "viewer", id);
    } catch (err) {
      console.error("Failed to send invite email:", err.message);
    }
    
    res.status(201).json({ collaborator });
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Failed to invite collaborator");
    next(error);
  }
};

export const removeCollaborator = async (req, res, next) => {
  try {
    const { id, email } = req.params;
    
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });
    
    const collab = await prisma.collaborator.findFirst({
      where: { tripId: id, email }
    });
    if (!collab) return res.status(404).json({ error: "Collaborator not found" });
    
    await prisma.collaborator.delete({ where: { id: collab.id } });
    
    res.status(200).json({ message: "Collaborator removed" });
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Failed to remove collaborator");
    next(error);
  }
};

export const getCollaborators = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const trip = await prisma.trip.findUnique({ 
      where: { id },
      include: { 
        collaborators: true
      }
    });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    
    const isOwner = trip.userId === req.userId;
    const isCollaborator = trip.collaborators.some(c => c.userId === req.userId || c.email === req.userEmail);

    if (!isOwner && !isCollaborator) {
      req.log.warn({ tripId: id, userId: req.userId }, "Unauthorized access attempt");
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const collaborators = await prisma.collaborator.findMany({
      where: { tripId: id }
    });
    
    res.status(200).json({ collaborators });
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Failed to fetch collaborators");
    next(error);
  }
};

export const leaveTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const collab = await prisma.collaborator.findFirst({
      where: { 
        tripId: id, 
        OR: [
          { userId: req.userId },
          { email: req.userEmail }
        ]
      }
    });

    if (!collab) {
      return res.status(404).json({ error: "You are not a collaborator on this trip" });
    }
    
    await prisma.collaborator.delete({ where: { id: collab.id } });
    
    res.status(200).json({ message: "You have left the trip" });
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Failed to leave trip");
    next(error);
  }
};
