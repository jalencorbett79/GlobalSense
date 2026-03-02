import { Country, Region, RegionGroup } from '../types';

export const countries: Country[] = [
  // ─── North America ───
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America', languages: ['en'], proxyEndpoint: 'us-east.proxy.globe', status: 'online' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America', languages: ['en', 'fr'], proxyEndpoint: 'ca-central.proxy.globe', status: 'online' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America', languages: ['es'], proxyEndpoint: 'mx-central.proxy.globe', status: 'online' },

  // ─── South America ───
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America', languages: ['pt'], proxyEndpoint: 'br-east.proxy.globe', status: 'online' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'South America', languages: ['es'], proxyEndpoint: 'ar-central.proxy.globe', status: 'online' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'South America', languages: ['es'], proxyEndpoint: 'cl-central.proxy.globe', status: 'online' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'South America', languages: ['es'], proxyEndpoint: 'co-central.proxy.globe', status: 'online' },

  // ─── Europe ───
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', languages: ['en'], proxyEndpoint: 'gb-london.proxy.globe', status: 'online' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', languages: ['de'], proxyEndpoint: 'de-frankfurt.proxy.globe', status: 'online' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', languages: ['fr'], proxyEndpoint: 'fr-paris.proxy.globe', status: 'online' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe', languages: ['nl'], proxyEndpoint: 'nl-amsterdam.proxy.globe', status: 'online' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe', languages: ['sv'], proxyEndpoint: 'se-stockholm.proxy.globe', status: 'online' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', languages: ['de', 'fr', 'it'], proxyEndpoint: 'ch-zurich.proxy.globe', status: 'online' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', languages: ['es'], proxyEndpoint: 'es-madrid.proxy.globe', status: 'online' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', languages: ['it'], proxyEndpoint: 'it-milan.proxy.globe', status: 'online' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe', languages: ['pl'], proxyEndpoint: 'pl-warsaw.proxy.globe', status: 'online' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', region: 'Europe', languages: ['ro'], proxyEndpoint: 'ro-bucharest.proxy.globe', status: 'online' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe', languages: ['ru'], proxyEndpoint: 'ru-moscow.proxy.globe', status: 'online' },

  // ─── Asia ───
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', languages: ['ja'], proxyEndpoint: 'jp-tokyo.proxy.globe', status: 'online' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia', languages: ['ko'], proxyEndpoint: 'kr-seoul.proxy.globe', status: 'online' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia', languages: ['en', 'zh'], proxyEndpoint: 'sg-central.proxy.globe', status: 'online' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia', languages: ['hi', 'en'], proxyEndpoint: 'in-mumbai.proxy.globe', status: 'online' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia', languages: ['th'], proxyEndpoint: 'th-bangkok.proxy.globe', status: 'online' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia', languages: ['zh'], proxyEndpoint: 'tw-taipei.proxy.globe', status: 'online' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia', languages: ['zh', 'en'], proxyEndpoint: 'hk-central.proxy.globe', status: 'online' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia', languages: ['fil', 'en'], proxyEndpoint: 'ph-manila.proxy.globe', status: 'online' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia', languages: ['id'], proxyEndpoint: 'id-jakarta.proxy.globe', status: 'online' },

  // ─── Middle East ───
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', languages: ['ar', 'en'], proxyEndpoint: 'ae-dubai.proxy.globe', status: 'online' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East', languages: ['he', 'ar'], proxyEndpoint: 'il-telaviv.proxy.globe', status: 'online' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Middle East', languages: ['tr'], proxyEndpoint: 'tr-istanbul.proxy.globe', status: 'online' },

  // ─── Africa ───
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', languages: ['en', 'af'], proxyEndpoint: 'za-johannesburg.proxy.globe', status: 'online' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa', languages: ['en'], proxyEndpoint: 'ng-lagos.proxy.globe', status: 'online' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa', languages: ['en', 'sw'], proxyEndpoint: 'ke-nairobi.proxy.globe', status: 'online' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa', languages: ['ar'], proxyEndpoint: 'eg-cairo.proxy.globe', status: 'online' },

  // ─── Oceania ───
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania', languages: ['en'], proxyEndpoint: 'au-sydney.proxy.globe', status: 'online' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', languages: ['en'], proxyEndpoint: 'nz-auckland.proxy.globe', status: 'online' },
];

export const regionGroups: RegionGroup[] = [
  { name: 'North America', icon: '🌎', countries: countries.filter(c => c.region === 'North America'), color: '#3B82F6' },
  { name: 'South America', icon: '🌎', countries: countries.filter(c => c.region === 'South America'), color: '#10B981' },
  { name: 'Europe', icon: '🌍', countries: countries.filter(c => c.region === 'Europe'), color: '#8B5CF6' },
  { name: 'Asia', icon: '🌏', countries: countries.filter(c => c.region === 'Asia'), color: '#F59E0B' },
  { name: 'Middle East', icon: '🌍', countries: countries.filter(c => c.region === 'Middle East'), color: '#EF4444' },
  { name: 'Africa', icon: '🌍', countries: countries.filter(c => c.region === 'Africa'), color: '#F97316' },
  { name: 'Oceania', icon: '🌏', countries: countries.filter(c => c.region === 'Oceania'), color: '#06B6D4' },
];

export const getCountryByCode = (code: string): Country | undefined =>
  countries.find(c => c.code === code);

export const getCountriesByRegion = (region: Region): Country[] =>
  countries.filter(c => c.region === region);

export const languageNames: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', hi: 'Hindi', ar: 'Arabic',
  th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', nl: 'Dutch', sv: 'Swedish',
  it: 'Italian', pl: 'Polish', ro: 'Romanian', ru: 'Russian', tr: 'Turkish',
  he: 'Hebrew', fil: 'Filipino', af: 'Afrikaans', sw: 'Swahili',
};
