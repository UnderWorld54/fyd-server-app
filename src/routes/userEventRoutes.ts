import { Router } from 'express';
import { UserEventController } from '../controllers/userEventController';
import { authenticate } from '../middleware/auth';
import Joi from 'joi';
import { validateBody } from '../middleware/validate';

const router = Router();
const userEventController = new UserEventController();

const saveEventSchema = Joi.object({
  eventId: Joi.string().required(),
  name: Joi.string().required().max(100),
  date: Joi.string().required(),
  location: Joi.string().required().max(200),
  imageUrl: Joi.string().uri().optional()
});

/**
 * @swagger
 * tags:
 *   name: User Events
 *   description: Gestion des événements sauvegardés par l'utilisateur
 */

// Récupérer tous les événements de l'utilisateur
router.get('/', authenticate, userEventController.getUserEvents);

// Ajouter un événement à la liste de l'utilisateur
router.post('/', authenticate, validateBody(saveEventSchema), userEventController.saveEvent);

// Supprimer un événement de la liste de l'utilisateur
router.delete('/:eventId', authenticate, userEventController.removeEvent);

// Vérifier si un événement est sauvegardé
router.get('/:eventId/check', authenticate, userEventController.checkEventSaved);

export default router; 