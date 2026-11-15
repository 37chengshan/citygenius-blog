// 新闻板块元数据（入口页与各板块页共用）
// pal: 生成式插画调色板 [纸色, 主色, 柔色, 墨色]（Claude 式暖色）
export const NEWS_CATS = [
  { id: 'ai', label: 'AI 科技', desc: '大模型、Agent 与科技圈大事', pal: ['#F4EEE1', '#D97757', '#E8C39E', '#2B2118'] },
  { id: 'world', label: '国际新闻', desc: '全球正在发生的事', pal: ['#F1EDE2', '#4A6FA5', '#B9C8DE', '#232B38'] },
  { id: 'finance', label: '财经', desc: '市场、公司与钱', pal: ['#F3EFE3', '#2F7D4F', '#BFD9BC', '#1F2A1E'] },
  { id: 'sports', label: '体育', desc: '比分、转会与纪录', pal: ['#F4EDE4', '#E05D38', '#EFB89F', '#2E1D14'] },
  { id: 'ent', label: '娱乐', desc: '影视、音乐与明星', pal: ['#F5ECEC', '#C65D7B', '#EBC3D2', '#33222A'] },
  { id: 'valorant', label: '无畏契约', desc: 'VCT 赛事与转会流言', pal: ['#F2ECE8', '#C8452C', '#E5A88F', '#2A1A12'] },
];
