import { googleAuth } from './google-auth';

export class GoogleEmailService {
  async getEmails(tokens: any, maxResults = 10) {
    googleAuth.setCredentials(tokens);
    const gmail = googleAuth.getGmailClient();
    
    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox'
      });

      const messages = response.data.messages || [];
      const emails = [];

      for (const message of messages.slice(0, maxResults)) {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        });

        const headers = email.data.payload?.headers || [];
        const getHeader = (name: string) => headers.find(h => h.name === name)?.value || '';

        emails.push({
          id: email.data.id,
          threadId: email.data.threadId,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          to: getHeader('To'),
          date: getHeader('Date'),
          snippet: email.data.snippet,
          body: this.extractEmailBody(email.data.payload),
          labels: email.data.labelIds || []
        });
      }

      return emails;
    } catch (error) {
      console.error('Gmail API error:', error);
      throw new Error('Failed to fetch emails from Gmail');
    }
  }

  async sendEmail(tokens: any, emailData: { to: string; subject: string; body: string }) {
    googleAuth.setCredentials(tokens);
    const gmail = googleAuth.getGmailClient();

    const raw = this.createEmailRaw(emailData);

    try {
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw
        }
      });

      return response.data;
    } catch (error) {
      console.error('Gmail send error:', error);
      throw new Error('Failed to send email');
    }
  }

  private extractEmailBody(payload: any): string {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return '';
  }

  private createEmailRaw(emailData: { to: string; subject: string; body: string }): string {
    const email = [
      `To: ${emailData.to}`,
      `Subject: ${emailData.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      emailData.body
    ].join('\n');

    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }
}

export class GoogleCalendarService {
  async getEvents(tokens: any, timeMin?: string, timeMax?: string) {
    googleAuth.setCredentials(tokens);
    const calendar = googleAuth.getCalendarClient();

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Calendar API error:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  async createEvent(tokens: any, eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    location?: string;
    attendees?: { email: string }[];
  }) {
    googleAuth.setCredentials(tokens);
    const calendar = googleAuth.getCalendarClient();

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData
      });

      return response.data;
    } catch (error) {
      console.error('Calendar create error:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  async updateEvent(tokens: any, eventId: string, eventData: any) {
    googleAuth.setCredentials(tokens);
    const calendar = googleAuth.getCalendarClient();

    try {
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: eventData
      });

      return response.data;
    } catch (error) {
      console.error('Calendar update error:', error);
      throw new Error('Failed to update calendar event');
    }
  }
}

export const googleEmailService = new GoogleEmailService();
export const googleCalendarService = new GoogleCalendarService();