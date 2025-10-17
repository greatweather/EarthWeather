import { City } from '../types';

// A curated list of major world cities to provide fast, local search results.
export const cities: City[] = [
  // Asia - China
  { name_en: 'Beijing', name_zh: '北京', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 39.9042, lon: 116.4074 },
  { name_en: 'Shanghai', name_zh: '上海', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 31.2304, lon: 121.4737 },
  { name_en: 'Guangzhou', name_zh: '广州', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 23.1291, lon: 113.2644 },
  { name_en: 'Shenzhen', name_zh: '深圳', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 22.5431, lon: 114.0579 },
  { name_en: 'Wuhan', name_zh: '武汉', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 30.5928, lon: 114.3055 },
  { name_en: 'Chengdu', name_zh: '成都', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 30.5728, lon: 104.0668 },
  { name_en: 'Chongqing', name_zh: '重庆', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 29.5630, lon: 106.5516 },
  { name_en: 'Hangzhou', name_zh: '杭州', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 30.2741, lon: 120.1551 },
  { name_en: 'Xi\'an', name_zh: '西安', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 34.3416, lon: 108.9402 },
  { name_en: 'Tianjin', name_zh: '天津', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 39.0842, lon: 117.2009 },
  { name_en: 'Suzhou', name_zh: '苏州', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 31.2989, lon: 120.5853 },
  { name_en: 'Nanjing', name_zh: '南京', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 32.0603, lon: 118.7969 },
  { name_en: 'Qingdao', name_zh: '青岛', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 36.0671, lon: 120.3826 },
  { name_en: 'Dalian', name_zh: '大连', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 38.9140, lon: 121.6147 },
  { name_en: 'Xiamen', name_zh: '厦门', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 24.4798, lon: 118.0894 },
  { name_en: 'Kunming', name_zh: '昆明', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 25.0422, lon: 102.7183 },
  { name_en: 'Harbin', name_zh: '哈尔滨', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 45.8038, lon: 126.5350 },
  { name_en: 'Urumqi', name_zh: '乌鲁木齐', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 43.8256, lon: 87.6168 },
  { name_en: 'Lhasa', name_zh: '拉萨', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 29.6521, lon: 91.1393 },
  { name_en: 'Beihai', name_zh: '北海', country_en: 'China', country_zh: '中国', country_code: 'CN', lat: 21.4733, lon: 109.1218 },
  { name_en: 'Hong Kong', name_zh: '香港', country_en: 'China', country_zh: '中国', country_code: 'HK', lat: 22.3193, lon: 114.1694 },
  { name_en: 'Taipei', name_zh: '台北', country_en: 'Taiwan', country_zh: '台湾', country_code: 'TW', lat: 25.0330, lon: 121.5654 },

  // Asia - Other
  { name_en: 'Tokyo', name_zh: '东京', country_en: 'Japan', country_zh: '日本', country_code: 'JP', lat: 35.6895, lon: 139.6917 },
  { name_en: 'Osaka', name_zh: '大阪', country_en: 'Japan', country_zh: '日本', country_code: 'JP', lat: 34.6937, lon: 135.5023 },
  { name_en: 'Mumbai', name_zh: '孟买', country_en: 'India', country_zh: '印度', country_code: 'IN', lat: 19.0760, lon: 72.8777 },
  { name_en: 'Delhi', name_zh: '德里', country_en: 'India', country_zh: '印度', country_code: 'IN', lat: 28.7041, lon: 77.1025 },
  { name_en: 'Seoul', name_zh: '首尔', country_en: 'South Korea', country_zh: '韩国', country_code: 'KR', lat: 37.5665, lon: 126.9780 },
  { name_en: 'Singapore', name_zh: '新加坡', country_en: 'Singapore', country_zh: '新加坡', country_code: 'SG', lat: 1.3521, lon: 103.8198 },
  { name_en: 'Bangkok', name_zh: '曼谷', country_en: 'Thailand', country_zh: '泰国', country_code: 'TH', lat: 13.7563, lon: 100.5018 },
  { name_en: 'Dubai', name_zh: '迪拜', country_en: 'United Arab Emirates', country_zh: '阿联酋', country_code: 'AE', lat: 25.2048, lon: 55.2708 },
  { name_en: 'Kuala Lumpur', name_zh: '吉隆坡', country_en: 'Malaysia', country_zh: '马来西亚', country_code: 'MY', lat: 3.1390, lon: 101.6869 },
  { name_en: 'Jakarta', name_zh: '雅加达', country_en: 'Indonesia', country_zh: '印度尼西亚', country_code: 'ID', lat: -6.2088, lon: 106.8456 },

  // North America
  { name_en: 'New York', name_zh: '纽约', country_en: 'United States', country_zh: '美国', country_code: 'US', lat: 40.7128, lon: -74.0060 },
  { name_en: 'Los Angeles', name_zh: '洛杉矶', country_en: 'United States', country_zh: '美国', country_code: 'US', lat: 34.0522, lon: -118.2437 },
  { name_en: 'Chicago', name_zh: '芝加哥', country_en: 'United States', country_zh: '美国', country_code: 'US', lat: 41.8781, lon: -87.6298 },
  { name_en: 'San Francisco', name_zh: '旧金山', country_en: 'United States', country_zh: '美国', country_code: 'US', lat: 37.7749, lon: -122.4194 },
  { name_en: 'Houston', name_zh: '休斯顿', country_en: 'United States', country_zh: '美国', country_code: 'US', lat: 29.7604, lon: -95.3698 },
  { name_en: 'Miami', name_zh: '迈阿密', country_en: 'United States', country_zh: '美国', country_code: 'US', lat: 25.7617, lon: -80.1918 },
  { name_en: 'Toronto', name_zh: '多伦多', country_en: 'Canada', country_zh: '加拿大', country_code: 'CA', lat: 43.6532, lon: -79.3832 },
  { name_en: 'Vancouver', name_zh: '温哥华', country_en: 'Canada', country_zh: '加拿大', country_code: 'CA', lat: 49.2827, lon: -123.1207 },
  { name_en: 'Mexico City', name_zh: '墨西哥城', country_en: 'Mexico', country_zh: '墨西哥', country_code: 'MX', lat: 19.4326, lon: -99.1332 },

  // Europe
  { name_en: 'London', name_zh: '伦敦', country_en: 'United Kingdom', country_zh: '英国', country_code: 'GB', lat: 51.5074, lon: -0.1278 },
  { name_en: 'Paris', name_zh: '巴黎', country_en: 'France', country_zh: '法国', country_code: 'FR', lat: 48.8566, lon: 2.3522 },
  { name_en: 'Moscow', name_zh: '莫斯科', country_en: 'Russia', country_zh: '俄罗斯', country_code: 'RU', lat: 55.7558, lon: 37.6173 },
  { name_en: 'Berlin', name_zh: '柏林', country_en: 'Germany', country_zh: '德国', country_code: 'DE', lat: 52.5200, lon: 13.4050 },
  { name_en: 'Rome', name_zh: '罗马', country_en: 'Italy', country_zh: '意大利', country_code: 'IT', lat: 41.9028, lon: 12.4964 },
  { name_en: 'Madrid', name_zh: '马德里', country_en: 'Spain', country_zh: '西班牙', country_code: 'ES', lat: 40.4168, lon: -3.7038 },
  { name_en: 'Istanbul', name_zh: '伊斯坦布尔', country_en: 'Turkey', country_zh: '土耳其', country_code: 'TR', lat: 41.0082, lon: 28.9784 },
  { name_en: 'Amsterdam', name_zh: '阿姆斯特丹', country_en: 'Netherlands', country_zh: '荷兰', country_code: 'NL', lat: 52.3676, lon: 4.9041 },
  { name_en: 'Vienna', name_zh: '维也纳', country_en: 'Austria', country_zh: '奥地利', country_code: 'AT', lat: 48.2082, lon: 16.3738 },
  { name_en: 'Prague', name_zh: '布拉格', country_en: 'Czech Republic', country_zh: '捷克', country_code: 'CZ', lat: 50.0755, lon: 14.4378 },
  
  // South America
  { name_en: 'São Paulo', name_zh: '圣保罗', country_en: 'Brazil', country_zh: '巴西', country_code: 'BR', lat: -23.5505, lon: -46.6333 },
  { name_en: 'Rio de Janeiro', name_zh: '里约热内卢', country_en: 'Brazil', country_zh: '巴西', country_code: 'BR', lat: -22.9068, lon: -43.1729 },
  { name_en: 'Buenos Aires', name_zh: '布宜诺斯艾利斯', country_en: 'Argentina', country_zh: '阿根廷', country_code: 'AR', lat: -34.6037, lon: -58.3816 },

  // Africa
  { name_en: 'Cairo', name_zh: '开罗', country_en: 'Egypt', country_zh: '埃及', country_code: 'EG', lat: 30.0444, lon: 31.2357 },
  { name_en: 'Johannesburg', name_zh: '约翰内斯堡', country_en: 'South Africa', country_zh: '南非', country_code: 'ZA', lat: -26.2041, lon: 28.0473 },

  // Oceania
  { name_en: 'Sydney', name_zh: '悉尼', country_en: 'Australia', country_zh: '澳大利亚', country_code: 'AU', lat: -33.8688, lon: 151.2093 },
  { name_en: 'Melbourne', name_zh: '墨尔本', country_en: 'Australia', country_zh: '澳大利亚', country_code: 'AU', lat: -37.8136, lon: 144.9631 },
];
