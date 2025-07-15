import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { registerSchema } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import Joi from 'joi';

const router = Router();
const userController = new UserController();

// Schéma de validation pour sauvegarder un événement
const saveEventSchema = Joi.object({
  eventId: Joi.string().required(),
  name: Joi.string().required(),
  date: Joi.string().required(),
  location: Joi.string().required(),
  imageUrl: Joi.string().optional()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UserUpdate:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *         firstName:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         lastName:
 *           type: string
 *           description: Nom de l'utilisateur
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Rôle de l'utilisateur
 *     SaveEventRequest:
 *       type: object
 *       required:
 *         - eventId
 *         - name
 *         - date
 *         - location
 *       properties:
 *         eventId:
 *           type: string
 *           description: ID unique de l'événement
 *         name:
 *           type: string
 *           description: Nom de l'événement
 *         date:
 *           type: string
 *           description: Date de l'événement
 *         location:
 *           type: string
 *           description: Lieu de l'événement
 *         imageUrl:
 *           type: string
 *           description: URL de l'image de l'événement (optionnel)
 *     SavedEvent:
 *       type: object
 *       properties:
 *         eventId:
 *           type: string
 *         name:
 *           type: string
 *         date:
 *           type: string
 *         location:
 *           type: string
 *         imageUrl:
 *           type: string
 *         savedAt:
 *           type: string
 *           format: date-time
 */


// Toutes les routes utilisateurs nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé (Admin uniquement)
 */
router.get('/', authorize('admin'), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 *   delete:
 *     summary: Supprimer un utilisateur (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé (Admin uniquement)
 *       404:
 *         description: Utilisateur non trouvé
 */
// Routes pour les événements sauvegardés
/**
 * @swagger
 * /api/users/saved-events:
 *   get:
 *     summary: Récupérer tous les événements sauvegardés de l'utilisateur connecté
 *     tags: [Saved Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements sauvegardés récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     savedEvents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedEvent'
 *                 message:
 *                   type: string
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 *   post:
 *     summary: Sauvegarder un événement pour l'utilisateur connecté
 *     tags: [Saved Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveEventRequest'
 *     responses:
 *       200:
 *         description: Événement sauvegardé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     savedEvents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedEvent'
 *                 message:
 *                   type: string
 *       400:
 *         description: Données invalides ou événement déjà sauvegardé
 *       401:
 *         description: Non authentifié
 */
router.get('/saved-events', userController.getSavedEvents);
router.post('/saved-events', validateBody(saveEventSchema), userController.saveEvent);

/**
 * @swagger
 * /api/users/saved-events/{eventId}:
 *   delete:
 *     summary: Supprimer un événement des favoris de l'utilisateur connecté
 *     tags: [Saved Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement à supprimer
 *     responses:
 *       200:
 *         description: Événement supprimé des favoris avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     savedEvents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedEvent'
 *                 message:
 *                   type: string
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/saved-events/:eventId', userController.removeSavedEvent);

/**
 * @swagger
 * /api/users/saved-events/{eventId}/check:
 *   get:
 *     summary: Vérifier si un événement est sauvegardé par l'utilisateur connecté
 *     tags: [Saved Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement à vérifier
 *     responses:
 *       200:
 *         description: Statut de sauvegarde de l'événement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isSaved:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Non authentifié
 */
router.get('/saved-events/:eventId/check', userController.isEventSaved);

/**
 * @swagger
 * /api/users/add-user:
 *   post:
 *     summary: Ajouter un utilisateur (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé (Admin uniquement)
 */
router.post('/add-user', authorize('admin'), validateBody(registerSchema), userController.createUser);

// Routes avec paramètres (doivent être définies en dernier)
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

export default router;