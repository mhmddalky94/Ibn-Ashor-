export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

export interface SurahDetail extends SurahSummary {
  ayahs: Ayah[];
}

export async function fetchSurahs(): Promise<SurahSummary[]> {
  const response = await fetch('https://api.alquran.cloud/v1/surah');
  const data = await response.json();
  if (data.code === 200) {
    return data.data;
  }
  throw new Error('Failed to fetch surahs');
}

export async function fetchSurah(number: number): Promise<SurahDetail> {
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
  const data = await response.json();
  if (data.code === 200) {
    return data.data;
  }
  throw new Error('Failed to fetch surah details');
}
