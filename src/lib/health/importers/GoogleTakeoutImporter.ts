import { HealthSleepEntry, DailyHealthMetric } from '../../../types/health';
import { BaseHealthImporter } from '../BaseHealthImporter';

export class GoogleTakeoutImporter extends BaseHealthImporter {
  getName() { return 'Google Takeout (Fit)'; }

  canHandle(path: string, firstLine: string): boolean {
    const head = firstLine.toLowerCase();
    return path.includes('Takeout/Fit') || 
           head.includes('com.google.sleep.segment') || 
           head.includes('activity metrics') ||
           head.includes('actividad diaria');
  }

  async parse(content: string, path: string): Promise<DailyHealthMetric[]> {
    if (path.includes('com.google.sleep.segment')) {
      return this.parseSleep(content).map(sleep => ({ date: sleep.date, sleep }));
    }

    if (path.includes('actividad diaria') || path.includes('activity metrics')) {
      const metric = this.parseMetrics(content, path);
      return metric ? [metric] : [];
    }

    return [];
  }

  private parseMetrics(csv: string, path: string): DailyHealthMetric | null {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return null;

    const head = lines[0].toLowerCase().split(',');
    const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch?.[1];
    if (!date) return null;

    const idx = {
      steps: head.findIndex(h => h.includes('pasos') || h.includes('step')),
      weight: head.findIndex(h => h.includes('peso') || h.includes('weight')),
      kcal: head.findIndex(h => h.includes('calor') || h.includes('kcal'))
    };

    let stats = { steps: 0, wSum: 0, wCount: 0, kcal: 0 };

    lines.slice(1).forEach(line => {
      const cols = line.split(',');
      if (idx.steps !== -1) stats.steps += parseInt(cols[idx.steps]) || 0;
      if (idx.kcal !== -1) stats.kcal += parseFloat(cols[idx.kcal]) || 0;
      if (idx.weight !== -1) {
        const w = parseFloat(cols[idx.weight]);
        if (w > 0) { stats.wSum += w; stats.wCount++; }
      }
    });

    return {
      date,
      steps: stats.steps,
      weight: stats.wCount > 0 ? stats.wSum / stats.wCount : undefined,
      calories: stats.kcal > 0 ? Math.round(stats.kcal) : undefined
    };
  }

  private parseSleep(json: string): HealthSleepEntry[] {
    try {
      const data = JSON.parse(json);
      const points = data.point || (Array.isArray(data) ? data : []);
      const daily: Record<string, HealthSleepEntry> = {};

      points.forEach((p: any) => {
        const start = Number(BigInt(p.startTimeNanos || 0) / 1000000n);
        const end = Number(BigInt(p.endTimeNanos || 0) / 1000000n);
        const type = p.fitValue?.[0]?.value?.intVal || p.value?.[0]?.intVal;

        if (!type || !start || !end) return;

        const startDate = new Date(start);
        const date = startDate.toISOString().split('T')[0];
        const min = (end - start) / 60000;

        if (!daily[date]) {
          daily[date] = {
            date, bedtime: startDate.toISOString(), wakeup: new Date(end).toISOString(),
            totalSleepMin: 0, deepSleepMin: 0, lightSleepMin: 0, remSleepMin: 0, awakeSleepMin: 0
          };
        }

        const s = daily[date];
        s.totalSleepMin += min;
        if (type === 5) s.deepSleepMin += min;
        else if (type === 4) s.lightSleepMin += min;
        else if (type === 6) s.remSleepMin += min;
        else if (type === 1) s.awakeSleepMin += min;
        
        if (end > new Date(s.wakeup).getTime()) s.wakeup = new Date(end).toISOString();
        if (start < new Date(s.bedtime).getTime()) s.bedtime = startDate.toISOString();
      });

      return Object.values(daily);
    } catch { return []; }
  }
}
