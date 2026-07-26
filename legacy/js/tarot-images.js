/**
 * 塔罗牌图片映射 - 韦特塔罗牌（Rider-Waite-Smith Tarot）
 * 图片来源：Wikimedia Commons（公共版权）
 * 使用 Special:Redirect/file 端点，自动 301 重定向到实际图片
 */

const TAROT_IMAGES = (function() {

  // Wikimedia Commons 重定向端点
  const REDIRECT_BASE = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/';

  /**
   * 构建图片 URL（通过 Wikimedia 重定向）
   */
  function buildUrl(filename) {
    return REDIRECT_BASE + filename;
  }

  // ==================== 大阿卡纳图片 URL（22张完整） ====================
  const MAJOR_ARCANA_URLS = [
    buildUrl('RWS_Tarot_00_Fool.jpg'),              // 0  愚者
    buildUrl('RWS_Tarot_01_Magician.jpg'),         // 1  魔术师
    buildUrl('RWS_Tarot_02_High_Priestess.jpg'),   // 2  女祭司
    buildUrl('RWS_Tarot_03_Empress.jpg'),          // 3  皇后
    buildUrl('RWS_Tarot_04_Emperor.jpg'),          // 4  皇帝
    buildUrl('RWS_Tarot_05_Hierophant.jpg'),       // 5  教皇
    buildUrl('RWS_Tarot_06_Lovers.jpg'),           // 6  恋人
    buildUrl('RWS_Tarot_07_Chariot.jpg'),          // 7  战车
    buildUrl('RWS_Tarot_08_Strength.jpg'),         // 8  力量
    buildUrl('RWS_Tarot_09_Hermit.jpg'),           // 9  隐者
    buildUrl('RWS_Tarot_10_Wheel_of_Fortune.jpg'), // 10 命运之轮
    buildUrl('RWS_Tarot_11_Justice.jpg'),          // 11 正义
    buildUrl('RWS_Tarot_12_Hanged_Man.jpg'),       // 12 倒吊人
    buildUrl('RWS_Tarot_13_Death.jpg'),            // 13 死神
    buildUrl('RWS_Tarot_14_Temperance.jpg'),       // 14 节制
    buildUrl('RWS_Tarot_15_Devil.jpg'),            // 15 恶魔
    buildUrl('RWS_Tarot_16_Tower.jpg'),            // 16 塔
    buildUrl('RWS_Tarot_17_Star.jpg'),             // 17 星星
    buildUrl('RWS_Tarot_18_Moon.jpg'),             // 18 月亮
    buildUrl('RWS_Tarot_19_Sun.jpg'),              // 19 太阳
    buildUrl('RWS_Tarot_20_Judgement.jpg'),        // 20 审判
    buildUrl('RWS_Tarot_21_World.jpg')             // 21 世界
  ];

  // ==================== 小阿卡纳图片 URL（已填充数据的牌） ====================
  const MINOR_ARCANA_URLS = {
    'wands-ace':      buildUrl('Wands01.jpg'),
    'cups-ace':       buildUrl('Cups01.jpg'),
    'swords-ace':     buildUrl('Swords01.jpg'),
    'pentacles-ace':  buildUrl('Pents01.jpg'),
    'pentacles-two':  buildUrl('Pents02.jpg'),
  };

  /**
   * 根据卡牌数据获取图片 URL
   * @param {Object} card - 卡牌对象（来自 TAROT_DECK）
   * @returns {string|null} 图片 URL，如果没有对应映射则返回 null
   */
  function getImageUrl(card) {
    if (!card) return null;

    // 大阿卡纳：根据 id 查找
    if (card.type === 'major' && typeof card.id === 'number') {
      return MAJOR_ARCANA_URLS[card.id] || null;
    }

    // 小阿卡纳：根据 cardId (如 "wands-ace") 查找
    if (card.type === 'minor' && card.id) {
      return MINOR_ARCANA_URLS[card.id] || null;
    }

    return null;
  }

  // 公开 API
  return {
    getImageUrl: getImageUrl
  };

})();

// 导出为全局变量
window.TAROT_IMAGES = TAROT_IMAGES;
