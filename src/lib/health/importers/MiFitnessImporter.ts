import { DailyHealthMetric } from '../../../types/health';
import { BaseHealthImporter } from '../BaseHealthImporter';

export class MiFitnessImporter extends BaseHealthImporter {
  getName() { return 'Mi Fitness (Aggregated)'; }

  canHandle(path: string, head: string): boolean {
    const lowHead = head.toLowerCase();
    return lowHead.includes('daily_report') || 
           (lowHead.includes('uid') && lowHead.includes('key') && lowHead.includes('value'));
  }

  async parse(content: string): Promise<DailyHealthMetric[]> {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const head = this.smartSplit(lines[0]).map(h => h.toLowerCase());
    const idx = {
      key: head.findIndex(h => h === 'key' || h === 'data_type'),
      time: head.findIndex(h => h === 'time' || h === 'timestamp'),
      val: head.findIndex(h => h === 'value' || h === 'json_data')
    };

    if (idx.key === -1 || idx.time === -1 || idx.val === -1) return [];

    const daily: Record<string, DailyHealthMetric> = {};

    lines.slice(1).forEach(line => {
      const cols = this.smartSplit(line);
      if (cols.length <= Math.max(idx.key, idx.time, idx.val)) return;

      const type = cols[idx.key];
      const ts = parseInt(cols[idx.time]);
      const raw = cols[idx.val];

      if (isNaN(ts) || !raw?.startsWith('{')) return;

      const date = new Date(ts * 1000).toISOString().split('T')[0];
      if (!daily[date]) daily[date] = { date };

      try {
        // Xiaomi usa "" para escapar comillas en el CSV, hay que limpiarlas para JSON.parse
        const cleanJson = raw.replace(/""/g, '"');
        this.map(type, JSON.parse(cleanJson), daily[date]);
      } catch (e) {
        // console.error('Error parsing MiFitness JSON:', e);
      }
    });

    return Object.values(daily);
  }

  private map(type: string, data: any, m: DailyHealthMetric) {
    if (type === 'steps') {
      m.steps = data.steps || 0;
      m.calories = data.calories || 0;
    } else if (type === 'sleep') {
      m.sleep = {
        date: m.date, bedtime: '', wakeup: '',
        deepSleepMin: data.sleep_deep_duration || 0,
        lightSleepMin: data.sleep_light_duration || 0,
        remSleepMin: data.rem_duration || 0,
        awakeSleepMin: data.sleep_awake_duration || 0,
        totalSleepMin: data.total_duration || 0
      };
    } else if (type === 'weight') {
      m.weight = data.weight || 0;
    }
  }
}
