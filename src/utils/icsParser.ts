import { NexusTask, TaskCategory, Assignee } from '../types/nexus';

export interface ParsedCalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string;
  endTime?: string;
  isAllDay: boolean;
}

export class IcsScheduleParser {
  // Parse raw .ics string into structured events
  public static parseIcs(icsContent: string): ParsedCalendarEvent[] {
    const events: ParsedCalendarEvent[] = [];
    const lines = icsContent.split(/\r\n|\n|\r/);

    // Unfold multi-line entries (lines starting with space or tab)
    const unfoldedLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if ((line.startsWith(' ') || line.startsWith('\t')) && unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.slice(1);
      } else if (line.trim()) {
        unfoldedLines.push(line);
      }
    }

    let inEvent = false;
    let currentEvent: Partial<ParsedCalendarEvent> = {};

    for (const line of unfoldedLines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = {
          uid: `ics-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          isAllDay: false,
        };
        continue;
      }

      if (line.startsWith('END:VEVENT')) {
        if (inEvent && currentEvent.summary && currentEvent.startDate) {
          events.push(currentEvent as ParsedCalendarEvent);
        }
        inEvent = false;
        currentEvent = {};
        continue;
      }

      if (!inEvent) continue;

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const propHeader = line.substring(0, colonIdx);
      const propValue = line.substring(colonIdx + 1).trim();
      const propName = propHeader.split(';')[0].toUpperCase();

      if (propName === 'UID') {
        currentEvent.uid = propValue;
      } else if (propName === 'SUMMARY') {
        currentEvent.summary = this.unescapeIcsText(propValue);
      } else if (propName === 'DESCRIPTION') {
        currentEvent.description = this.unescapeIcsText(propValue);
      } else if (propName === 'LOCATION') {
        currentEvent.location = this.unescapeIcsText(propValue);
      } else if (propName === 'DTSTART') {
        const parsed = this.parseIcsDateTime(propValue);
        currentEvent.startDate = parsed.date;
        currentEvent.startTime = parsed.time;
        currentEvent.isAllDay = parsed.isAllDay;
      } else if (propName === 'DTEND') {
        const parsed = this.parseIcsDateTime(propValue);
        currentEvent.endDate = parsed.date;
        currentEvent.endTime = parsed.time;
      }
    }

    return events;
  }

  // Parse YYYYMMDD or YYYYMMDDTHHmmssZ into { date: 'YYYY-MM-DD', time: 'HH:mm', isAllDay }
  private static parseIcsDateTime(val: string): { date: string; time?: string; isAllDay: boolean } {
    const clean = val.replace(/Z$/, '');
    if (clean.length === 8) {
      // All day: YYYYMMDD
      const year = clean.substring(0, 4);
      const month = clean.substring(4, 6);
      const day = clean.substring(6, 8);
      return { date: `${year}-${month}-${day}`, isAllDay: true };
    }

    if (clean.includes('T')) {
      const [dPart, tPart] = clean.split('T');
      const year = dPart.substring(0, 4);
      const month = dPart.substring(4, 6);
      const day = dPart.substring(6, 8);
      const hours = tPart.substring(0, 2);
      const minutes = tPart.substring(2, 4);

      return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
        isAllDay: false,
      };
    }

    return { date: clean.substring(0, 10), isAllDay: false };
  }

  private static unescapeIcsText(str: string): string {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\N/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }

  // Convert parsed events to NexusTask array
  public static convertEventsToTasks(
    events: ParsedCalendarEvent[],
    forcedCategory?: TaskCategory,
    forcedAssignee?: Assignee
  ): NexusTask[] {
    return events.map((ev, idx) => {
      let category: TaskCategory = forcedCategory || '🎓 ВШЭ (Егор)';
      let assignee: Assignee = forcedAssignee || 'egor';

      const lowerSummary = ev.summary.toLowerCase();
      const lowerDesc = (ev.description || '').toLowerCase();

      if (lowerSummary.includes('рудн') || lowerDesc.includes('рудн') || lowerSummary.includes('психол')) {
        category = '🎓 РУДН (Аня)';
        assignee = 'anya';
      } else if (lowerSummary.includes('вшэ') || lowerSummary.includes('hse') || lowerSummary.includes('магистр')) {
        category = '🎓 ВШЭ (Егор)';
        assignee = 'egor';
      }

      const notesParts: string[] = [];
      if (ev.startTime) {
        notesParts.push(`⏰ Время: ${ev.startTime}${ev.endTime ? ` - ${ev.endTime}` : ''}`);
      }
      if (ev.location) {
        notesParts.push(`📍 Аудитория / Ссылка: ${ev.location}`);
      }
      if (ev.description) {
        notesParts.push(`📝 ${ev.description}`);
      }

      return {
        id: `task-ics-${ev.uid}-${idx}`,
        title: ev.summary,
        notes: notesParts.join('\n'),
        completed: false,
        bracketColor: 'cyber',
        category,
        room: 'Комната',
        assignee,
        date: ev.startDate,
        createdAt: new Date().toISOString(),
        order: idx,
        tags: ['расписание', category.includes('ВШЭ') ? 'ВШЭ' : 'РУДН'],
      };
    });
  }
}
