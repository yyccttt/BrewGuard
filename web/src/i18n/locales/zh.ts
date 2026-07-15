export default {
  hero: {
    badge: '全新',
    platform: '智能发酵监测平台',
    titleLine1: 'BrewGuard',
    titleLine2: '让每一批酒都可信赖',
    subtitle:
      '面向现代化酿酒生产的智能检测平台。覆盖温度、pH、酒精度、糖度等关键指标,从发酵监测、品质预警到批次溯源,用数据驱动每一道决策。',
    cta: '探索平台能力'
  },
  features: {
    eyebrow: '平台能力',
    title: '贯穿生产全链路的智能检测解决方案',
    subtitle:
      '从发酵监测、品质管控到批次溯源,以数据驱动酿酒生产的标准化与可追溯。',
    items: {
      realtime: {
        title: '实时监测',
        desc: '温度、pH、酒精度、糖度等关键工艺参数秒级采集,发酵全程在线可视,工艺透明可控。'
      },
      visualization: {
        title: '数据可视化',
        desc: '多维度趋势曲线与批次对比看板,助力工艺优化与生产决策,沉淀企业数据资产。'
      },
      alerts: {
        title: '智能预警',
        desc: '阈值越界与异常趋势自动告警,批次风险即时定位,显著降低次品率与返工成本。'
      },
      traceability: {
        title: '批次溯源',
        desc: '完整批次档案与质检报告,一键导出 PDF / Excel,满足合规审计与质量追溯要求。'
      }
    }
  },
  footer: {
    tagline: '面向现代化酿酒生产的智能检测平台,以数据驱动品质与效率。',
    columns: {
      product: {
        title: '产品',
        items: ['实时监测', '数据可视化', '智能预警', '批次溯源']
      },
      solutions: {
        title: '解决方案',
        items: ['发酵工艺监测', '品质管控', '合规溯源', '数据资产']
      }
    },
    attribution: 'BrewGuard · 智能发酵监测平台',
    rights: '© {year} BrewGuard. All rights reserved.'
  },
  stats: {
    items: {
      accuracy: { value: 99.2, suffix: '%', decimals: 1, label: '检测准确率' },
      uptime: { value: 24, suffix: '/7', decimals: 0, label: '全天候在线' },
      datapoints: { value: 200000, suffix: '+', decimals: 0, label: '已采集数据点' },
      clients: { value: 50, suffix: '+', decimals: 0, label: '服务酒厂' }
    }
  },
  howItWorks: {
    eyebrow: '工作原理',
    title: '从传感器到报告,四步闭环',
    subtitle: '贯穿检测全流程的闭环,让每一批次都可追溯、可验证。',
    steps: {
      collect: { title: '数据采集', desc: '传感器实时采集温度、pH、酒精度、糖度等参数,全部上传云端。' },
      analyze: { title: '实时分析', desc: '趋势即时计算与可视化,一眼掌握发酵状态与历史规律。' },
      alert: { title: '智能预警', desc: '阈值越界与异常趋势即时告警,在出货前定位风险批次。' },
      trace: { title: '批次溯源', desc: '完整批次档案与质检报告,一键导出,满足合规审计。' }
    }
  },
  dataPreview: {
    eyebrow: '实时监测',
    title: '看见你的发酵过程',
    subtitle: '多维度趋势曲线,让每个批次透明可控。',
    tempLabel: '温度 (°C)',
    phLabel: 'pH',
    liveTag: '实时'
  },
  industries: {
    eyebrow: '解决方案',
    title: '为每一种酿造而生',
    subtitle: '从手工工坊到工业产线,BrewGuard 贴合你的生产实际。',
    items: {
      beer: { title: '精酿啤酒厂', desc: '精准的温度与糖度曲线,跟踪艾尔与拉格发酵。' },
      wine: { title: '葡萄酒庄', desc: '糖度与 pH 趋势,监控果汁发酵与苹果酸乳酸阶段。' },
      spirit: { title: '白酒蒸馏厂', desc: '多发酵罐批次管理,统筹糖化与发酵全流程。' },
      lab: { title: '研发实验室', desc: '中试规模实验,完整传感器数据采集与可导出报告。' }
    }
  },
  cta: {
    title: '开启你的智能检测之旅',
    subtitle: '加入用数据而非经验酿酒的酒厂行列。',
    button: '立即开始'
  },
  faq: {
    eyebrow: '常见问题',
    title: '您可能想了解的问题',
    subtitle: '在开始之前,这里有您需要知道的一切。',
    items: [
      { q: '支持哪些传感器和协议?', a: 'BrewGuard 支持常见的模拟与数字传感器,涵盖温度、pH、溶解氧、酒精度、糖度等,可通过 MQTT、Modbus 及标准 REST 接口接入。' },
      { q: '能否与现有生产系统集成?', a: '可以。BrewGuard 提供完善的 REST API,可向 ERP/MES 系统推送事件,无需整体替换即可融入现有流程。' },
      { q: '批次数据如何存储和导出?', a: '每个批次保留完整记录——传感器时间线、告警与质检结论——可一键导出 PDF 或 Excel,满足合规审计。' },
      { q: '适合小型精酿酒厂吗?', a: '完全可以。BrewGuard 从精酿工坊的单发酵罐到工业多罐产线均可适配,支持按批次配置。' },
      { q: '提供试点或试用吗?', a: '支持在一条产线上进行试点部署,您可在规模化前先用自有工艺验证检测准确率。' }
    ]
  },
  marquee: {
    items: ['实时监测', '智能预警', '批次溯源', '数据驱动酿造']
  },
  login: {
    subtitle: '智能酿酒检测平台',
    username: '用户名',
    password: '密码',
    button: '登 录',
    success: '登录成功',
    failed: '登录失败',
    hint: '默认账号:admin / 123456',
    back: '返回首页'
  },
  langToggle: {
    switchTo: 'EN'
  },
  ai: {
    title: 'BrewGuard 助手',
    welcome: '你好!我是 BrewGuard AI 助手,可以回答关于发酵检测、批次管理、酿造指标等问题。',
    placeholder: '输入你的问题...',
    sending: '思考中...',
    send: '发送',
    suggestions: [
      '艾尔发酵的理想温度是多少?',
      'pH 异常说明什么?',
      '如何使用批次溯源功能?'
    ],
    error: '出了点问题,请重试。',
    openChat: '打开 AI 助手'
  },
  admin: {
    brand: 'BrewGuard 管理后台',
    backHome: '首页',
    menu: {
      dashboard: '仪表盘',
      batch: '发酵批次',
      alerts: '告警中心',
      users: '用户管理',
      auditlog: '审计日志',
      system: '系统管理'
    },
    dashboard: {
      title: '仪表盘',
      overview: '概览',
      cards: {
        batchTotal: '批次总数',
        batchAbnormal: '异常批次',
        detectionTotal: '检测记录',
        avgTemp: '平均温度',
        tempUnit: '°C',
        alertOpen: '待处理告警'
      },
      chart: {
        trendTitle: '检测数据趋势',
        trendSubtitle: '近 24 小时温度、pH 与酒精度变化',
        distTitle: '批次状态分布',
        distSubtitle: '当前各状态批次数量',
        tempLabel: '温度',
        phLabel: 'pH',
        abvLabel: '酒精度',
        fermenting: '发酵中',
        completed: '已完成',
        abnormal: '异常'
      }
    },
    system: {
      title: '系统管理',
      comingSoon: '系统设置即将上线。'
    },
    alerts: {
      title: '告警中心',
      empty: '暂无告警,所有指标在正常范围内。',
      batchId: '批次',
      metric: '指标',
      value: '实际值',
      threshold: '阈值',
      direction: '方向',
      status: '状态',
      time: '时间',
      actions: '操作',
      metrics: { temperature: '温度', ph: 'pH', abv: '酒精度' },
      directions: { high: '超上限', low: '低于下限' },
      statuses: { open: '待处理', acknowledged: '已确认', resolved: '已解决' },
      all: '全部',
      acknowledge: '确认',
      resolve: '解决',
      acknowledged: '告警已确认',
      resolved: '告警已解决',
      thresholdConfig: '阈值配置',
      tempRange: '温度范围 (°C)',
      phRange: 'pH 范围',
      abvRange: '酒精度范围 (%)',
      saveThreshold: '保存',
      thresholdSaved: '阈值已保存'
    },
    batch: {
      title: '发酵批次',
      add: '新建批次',
      edit: '编辑',
      delete: '删除',
      search: '搜索批次号...',
      batchNo: '批次编号',
      recipe: '配方',
      status: '状态',
      startTime: '开始时间',
      endTime: '结束时间',
      remark: '备注',
      createdAt: '创建时间',
      actions: '操作',
      statuses: {
        fermenting: '发酵中',
        completed: '已完成',
        abnormal: '异常'
      },
      confirmDelete: '确定要删除这个批次吗?',
      saveSuccess: '批次保存成功',
      deleteSuccess: '批次删除成功',
      empty: '暂无批次,点击新建第一个批次。',
      detail: '查看详情',
      back: '返回批次列表'
    },
    detection: {
      title: '检测记录',
      trendTitle: '检测数据趋势',
      add: '新建记录',
      edit: '编辑',
      delete: '删除',
      temperature: '温度 (°C)',
      ph: 'pH',
      abv: '酒精度 (%)',
      remark: '备注',
      createdAt: '记录时间',
      actions: '操作',
      confirmDelete: '确定要删除这条记录吗?',
      saveSuccess: '记录保存成功',
      deleteSuccess: '记录删除成功',
      empty: '暂无检测记录,添加第一条记录。',
      batchInfo: '批次信息'
    }
  }
};
