import { describe, expect, it } from 'vitest';
import { parseVoiceEntry } from './voiceParse';

describe('parseVoiceEntry', () => {
  it('extracts part/odo/cost from the verified prototype demo phrase', () => {
    const result = parseVoiceEntry('เปลี่ยนน้ำมันเครื่อง Motul 7100 ราคา 890 บาท ที่ 6,800 กม.');
    expect(result.partKey).toBe('oil');
    expect(result.cost).toBe(890);
    expect(result.odo).toBe(6800);
  });

  it('recognizes each part keyword', () => {
    expect(parseVoiceEntry('เปลี่ยนผ้าเบรกหน้า').partKey).toBe('brake');
    expect(parseVoiceEntry('ตั้งโซ่ใหม่').partKey).toBe('chain');
    expect(parseVoiceEntry('เปลี่ยนยางหลัง').partKey).toBe('tyre');
    expect(parseVoiceEntry('ล้างกรองอากาศ').partKey).toBe('air');
  });

  it('returns an empty result for an unrecognized transcript', () => {
    const result = parseVoiceEntry('สวัสดีครับ');
    expect(result.partKey).toBeUndefined();
    expect(result.odo).toBeUndefined();
    expect(result.cost).toBeUndefined();
  });

  it('handles "กิโล" as an alternate odometer unit', () => {
    expect(parseVoiceEntry('ที่ 12000 กิโล').odo).toBe(12000);
  });
});
