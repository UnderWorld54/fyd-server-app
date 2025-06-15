import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';
import Joi from 'joi';
import { validateBody } from '../middleware/validate';

const router = Router();
const eventController = new EventController();

const fetchEventsSchema = Joi.object({
  ville: Joi.string().required(),
  interet: Joi.array().items(Joi.string()).required()
});

/**
 * @swagger
 * /api/events/fetch:
 *   post:
 *     summary: Récupérer les événements par ville et intérêts
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ville
 *               - interet
 *             properties:
 *               ville:
 *                 type: string
 *                 description: Ville pour la recherche d'événements
 *               interet:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des intérêts pour filtrer les événements
 *     responses:
 *       200:
 *         description: Liste des événements récupérés avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post('/fetch', authenticate, validateBody(fetchEventsSchema), eventController.fetchEvents);

export default router; 