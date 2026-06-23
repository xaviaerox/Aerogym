import { DailyHealthMetric, HealthSleepEntry, HealthActivityEntry } from '../../../types/health';
import { BaseHealthImporter } from '../BaseHealthImporter';

export class ZeppImporter extends BaseHealthImporter {
  getName() { return 'Zepp / Xiaomi (Classic)'; }

  canHandle(path: string, head: string): boolean {
    const lowHead = head.toLowerCase();
    const isKnownFile = ['ACTIVITY_', 'SLEEP_', 'HEARTRATE_'].some(k => path.includes(k));
    const hasKeywords = ['steps', 'pasos', 'sleep', 'sueño'].some(k => lowHead.includes(k));
    return isKnownFile || hasKeywords;
  }

  async parse(content: string, path: string = ''): Promise<DailyHealthMetric[]> {
    const sleep: HealthSleepEntry[] = [];
    const activity: HealthActivityEntry[] = [];

    if (path.endsWith('.json')) {
      sleep.push(...this.parseSleepJSON(content));
    } else {
      const head = content.trim().split('\n')[0].toLowerCase();
      if (['steps', 'pasos', 'dist'].some(k => head.includes(k))) {
        activity.push(...this.parseActivityCSV(content));
      }
      if (['sleep', 'sueño', 'deep', 'profundo'].some(k => head.includes(k))) {
        sleep.push(...this.parseSleepCSV(content));
      }
    }

    const dates = new Set([...sleep.map(s => s.date), ...activity.map(a => a.date)]);
    return Array.from(dates).map(date => ({
      date,
      sleep: sleep.find(s => s.date === date),
      steps: activity.find(a => a.date === date)?.steps,
      calories: activity.find(a => a.date === date)?.calories
    }));
  }

  private parseActivityCSV(csv: string): HealthActivityEntry[] {
    const lines = csv.trim().split('\n');
    const head = lines[0].toLowerCase().split(',');
    
    const idx = {
      date: head.findIndex(h => h.includes('date') || h.includes('fecha')),
      steps: head.findIndex(h => h.includes('pasos') || h.includes('step')),
      dist: head.findIndex(h => h.includes('dist')),
      kcal: head.findIndex(h => h.includes('cal'))
    };

    if (idx.date === -1 || idx.steps === -1) return [];

    return lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        date: this.normDate(cols[idx.date]),
        steps: parseInt(cols[idx.steps]) || 0,
        distance: parseFloat(cols[idx.dist]) || 0,
        calories: parseInt(cols[idx.kcal]) || 0
      };
    }).filter(e => e.date);
  }

  private parseSleepCSV(csv: string): HealthSleepEntry[] {
    const lines = csv.trim().split('\n');
    const head = lines[0].toLowerCase().split(',');
    
    const idx = {
      date: head.findIndex(h => h.includes('date') || h.includes('fecha')),
      deep: head.findIndex(h => h.includes('deep') || h.includes('profundo')),
      light: head.findIndex(h => h.includes('light') || h.includes('ligero')),
      rem: head.findIndex(h => h.includes('rem')),
      wake: head.findIndex(h => h.includes('wake') || h.includes('despierto'))
    };

    if (idx.date === -1) return [];

    return lines.slice(1).map(line => {
      const cols = line.split(',');
      const [d, l, r, w] = [idx.deep, idx.light, idx.rem, idx.wake].map(i => parseInt(cols[i]) || 0);
      
      return {
        date: this.normDate(cols[idx.date]),
        bedtime: '', wakeup: '',
        deepSleepMin: d, lightSleepMin: l, remSleepMin: r, awakeSleepMin: w,
        totalSleepMin: d + l + r
      };
    }).filter(e => e.date && e.totalSleepMin > 0);
  }

  private normDate(raw: string): string {
    if (!raw) return '';
    const clean = raw.trim().replace(/"/g, '');
    if (clean.includes('-')) return clean.split(' ')[0];
    if (clean.includes('/')) return clean.replace(/\//g, '-').split(' ')[0];
    if (clean.length > 10 && !isNaN(Number(clean))) {
       return new Date(Number(clean) * 1000).toISOString().split('T')[0];
    }
    return clean;
  }

  private parseSleepJSON(json: string): HealthSleepEntry[] {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) return [];

      return data.map((e: any) => ({
        date: e.date,
        bedtime: new Date(e.start * 1000).toISOString(),
        wakeup: new Date(e.stop * 1000).toISOString(),
        deepSleepMin: e.deepSleepTime || 0,
        lightSleepMin: e.shallowSleepTime || 0,
        remSleepMin: e.remTime || 0,
        awakeSleepMin: e.wakeTime || 0,
        totalSleepMin: (e.deepSleepTime || 0) + (e.shallowSleepTime || 0) + (e.remTime || 0)
      }));
    } catch { return []; }
  }
}
