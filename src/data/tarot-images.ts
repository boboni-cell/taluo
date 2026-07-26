/** 塔罗牌图片映射 - Wikimedia Commons */
const WIKI = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/';
const MAJOR: Record<number,string> = { 0:'RWS_Tarot_00_Fool.jpg',1:'RWS_Tarot_01_Magician.jpg',2:'RWS_Tarot_02_High_Priestess.jpg',3:'RWS_Tarot_03_Empress.jpg',4:'RWS_Tarot_04_Emperor.jpg',5:'RWS_Tarot_05_Hierophant.jpg',6:'RWS_Tarot_06_Lovers.jpg',7:'RWS_Tarot_07_Chariot.jpg',8:'RWS_Tarot_08_Strength.jpg',9:'RWS_Tarot_09_Hermit.jpg',10:'RWS_Tarot_10_Wheel_of_Fortune.jpg',11:'RWS_Tarot_11_Justice.jpg',12:'RWS_Tarot_12_Hanged_Man.jpg',13:'RWS_Tarot_13_Death.jpg',14:'RWS_Tarot_14_Temperance.jpg',15:'RWS_Tarot_15_Devil.jpg',16:'RWS_Tarot_16_Tower.jpg',17:'RWS_Tarot_17_Star.jpg',18:'RWS_Tarot_18_Moon.jpg',19:'RWS_Tarot_19_Sun.jpg',20:'RWS_Tarot_20_Judgement.jpg',21:'RWS_Tarot_21_World.jpg' };
const SUIT_PFX: Record<string,string> = { wands:'Wands', cups:'Cups', swords:'Swords', pentacles:'Pents' };
const urlMap: Record<string,string> = {};
for (const [k,v] of Object.entries(MAJOR)) urlMap[k] = WIKI + v;
for (const s of ['wands','cups','swords','pentacles']) for (let n=1; n<=14; n++) urlMap[`${s}-${n}`] = WIKI + SUIT_PFX[s] + String(n).padStart(2,'0') + '.jpg';
export function getCardImageUrl(id: number | string): string | null { return urlMap[String(id)] || null; }
export const TAROT_IMAGE_MAP: Readonly<Record<string,string>> = urlMap;
