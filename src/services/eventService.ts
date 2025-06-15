import axios from 'axios';
import { EventResponse } from '../types';

const API_URL = process.env.EVENTS_API_URL || 'https://api.example.com/events';
const API_TOKEN = process.env.EVENTS_API_TOKEN;

export class EventService {
  async fetchExternalEvents(params: { ville: string; interet: string[] }): Promise<EventResponse[]> {
    try {
      const response = await axios.post<EventResponse[]>(
        API_URL,
        params,
        {
          headers: {
            'x-api-key': API_TOKEN,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch external events: ${error}`);
    }
  }
} 