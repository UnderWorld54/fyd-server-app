import { EventController } from '../controllers/eventController';
import { EventService } from '../services/eventService';
import { Request, Response } from 'express';
import { EventResponse } from '../types';

jest.mock('../services/eventService');

describe('EventController', () => {
  let eventController: EventController;
  let mockEventService: jest.Mocked<EventService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();

    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };

    eventController = new EventController();
    mockEventService = (eventController as any).eventService;
  });

  describe('fetchEvents', () => {
    it('should fetch and format events successfully', async () => {
      const mockRawEvents: EventResponse[] = [
        {
          id: 'event1',
          name: 'Concert Rock',
          date: '2024-06-15T20:00:00Z',
          place: [{
            address: { line1: '123 Rue du wow' },
            postalCode: '75001',
            city: { name: 'Paris' },
            country: { name: 'France' },
            upcomingEvents: { _total: 50 },
            images: [{ url: 'https://example.com/image1.jpg' }]
          }],
          priceRanges: [{
            min: 30,
            max: 80
          }],
          ticket: 'https://tickets.example.com/event1'
        },
        {
          id: 'event2',
          name: 'Festival Jazz',
          date: '2024-07-20T19:30:00Z',
          place: [{
            address: { line1: '456 Avenue du wow' },
            postalCode: '69000',
            city: { name: 'Lyon' },
            country: { name: 'France' },
            upcomingEvents: { _total: 25 },
            images: [{ url: 'https://example.com/image2.jpg' }]
          }],
          priceRanges: [{
            min: 45,
            max: 120
          }],
          ticket: 'https://tickets.example.com/event2'
        }
      ];

      const expectedFormattedEvents = [
        {
          ticketmaster_id: 'event1',
          name: 'Concert Rock',
          date: new Date('2024-06-15T20:00:00Z'),
          location: '123 Rue du wow, 75001 Paris, France',
          price_min: 30,
          price_max: 80,
          ticket_url: 'https://tickets.example.com/event1',
          remaining_places: 50,
          image_url: 'https://example.com/image1.jpg'
        },
        {
          ticketmaster_id: 'event2',
          name: 'Festival Jazz',
          date: new Date('2024-07-20T19:30:00Z'),
          location: '456 Avenue du wow, 69000 Lyon, France',
          price_min: 45,
          price_max: 120,
          ticket_url: 'https://tickets.example.com/event2',
          remaining_places: 25,
          image_url: 'https://example.com/image2.jpg'
        }
      ];

      mockRequest = {
        body: {
          ville: 'Paris',
          interet: ['music', 'rock']
        }
      };

      mockEventService.fetchExternalEvents.mockResolvedValue(mockRawEvents);

      await eventController.fetchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockEventService.fetchExternalEvents).toHaveBeenCalledWith({
        ville: 'Paris',
        interet: ['music', 'rock']
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedFormattedEvents
      });
    });

    it('should handle events with missing optional fields', async () => {
      const mockRawEventsIncomplete: EventResponse[] = [
        {
          id: 'event3',
          name: 'Spectacle Théâtre',
          date: '2024-08-10T20:00:00Z',
          place: [{
            // Données ici incomplètes
            city: { name: 'Marseille' }
          }],
          // Pas de priceRanges
          ticket: 'https://tickets.example.com/event3'
        }
      ];

      const expectedFormattedEventsIncomplete = [
         {
           ticketmaster_id: 'event3',
           name: 'Spectacle Théâtre',
           date: new Date('2024-08-10T20:00:00Z'),
           location: ',  Marseille,',
           price_min: null,
           price_max: null,
           ticket_url: 'https://tickets.example.com/event3',
           remaining_places: null,
           image_url: null
         }
       ];

      mockRequest = {
        body: {
          ville: 'Marseille',
          interet: ['theatre']
        }
      };

      mockEventService.fetchExternalEvents.mockResolvedValue(mockRawEventsIncomplete);

      await eventController.fetchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedFormattedEventsIncomplete
      });
    });

    it('should return 500 when external API fails', async () => {
      mockRequest = {
        body: {
          ville: 'Paris',
          interet: ['music']
        }
      };

      mockEventService.fetchExternalEvents.mockRejectedValue(new Error('External API error'));

      await eventController.fetchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        error: 'Erreur lors de la récupération des événements'
      });
    });

    it('should handle empty events array', async () => {
      mockRequest = {
        body: {
          ville: 'Strasbourg',
          interet: ['opera']
        }
      };

      mockEventService.fetchExternalEvents.mockResolvedValue([]);

      await eventController.fetchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it('should handle events with empty place array', async () => {
      const mockRawEventsEmptyPlace: EventResponse[] = [
        {
          id: 'event4',
          name: 'Événement en ligne',
          date: '2024-09-01T14:00:00Z',
          place: [], // ppas de place
          ticket: 'https://tickets.example.com/event4'
        }
      ];

      const expectedFormattedEventsEmptyPlace = [
         {
           ticketmaster_id: 'event4',
           name: 'Événement en ligne',
           date: new Date('2024-09-01T14:00:00Z'),
           location: ',  ,',
           price_min: null,
           price_max: null,
           ticket_url: 'https://tickets.example.com/event4',
           remaining_places: null,
           image_url: null
         }
       ];

      mockRequest = {
        body: {
          ville: 'En ligne',
          interet: ['webinar']
        }
      };

      mockEventService.fetchExternalEvents.mockResolvedValue(mockRawEventsEmptyPlace);

      await eventController.fetchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedFormattedEventsEmptyPlace
      });
    });
  });
}); 