import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { logger } from '../utils/logger';
import { EventResponse } from '../types';

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  fetchEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ville, interet }: { ville: string; interet: string[] } = req.body;
      
      logger.info('Requête fetchEvents', { ville, interet });

      const rawEvents = await this.eventService.fetchExternalEvents({
        ville,
        interet
      });

      const formattedEvents = rawEvents.map((event: EventResponse) => {
        const place = event.place?.[0];
        const price = event.priceRanges?.[0];

        return {
          ticketmaster_id: event.id,
          name: event.name,
          date: new Date(event.date),
          location: `${place?.address?.line1 || ''}, ${place?.postalCode || ''} ${place?.city?.name || ''}, ${place?.country?.name || ''}`.trim(),
          price_min: price?.min || null,
          price_max: price?.max || null,
          ticket_url: event.ticket,
          remaining_places: place?.upcomingEvents?._total || null,
          image_url: place?.images?.[0]?.url || null,
        };
      });

      res.json({
        success: true,
        data: formattedEvents
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements', { error });
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des événements'
      });
    }
  };
} 