export default {
  hero: {
    badge: 'New',
    platform: 'Intelligent Fermentation Monitoring',
    titleLine1: 'BrewGuard',
    titleLine2: 'Trust in every batch',
    subtitle:
      'An intelligent detection platform for modern brewing. Covering temperature, pH, ABV and gravity — from fermentation monitoring and quality alerts to batch traceability, data drives every decision.',
    cta: 'Explore the platform'
  },
  features: {
    eyebrow: 'Platform Capabilities',
    title: 'End-to-end intelligent detection across your production line',
    subtitle:
      'From fermentation monitoring and quality control to batch traceability — standardize and make every step of brewing production data-driven and verifiable.',
    items: {
      realtime: {
        title: 'Real-time Monitoring',
        desc: 'Capture key process parameters — temperature, pH, ABV, gravity — second by second, with the entire fermentation visible online and the process transparent and controllable.'
      },
      visualization: {
        title: 'Data Visualization',
        desc: 'Multi-dimensional trend curves and batch comparison dashboards, empowering process optimization and production decisions while building a durable data asset.'
      },
      alerts: {
        title: 'Smart Alerts',
        desc: 'Automatic alerts on threshold breaches and anomalous trends, with instant batch risk localization — significantly reducing defect rates and rework costs.'
      },
      traceability: {
        title: 'Batch Traceability',
        desc: 'Complete batch records and quality reports, exportable to PDF / Excel in one click, meeting compliance audit and quality traceability requirements.'
      }
    }
  },
  footer: {
    tagline: 'An intelligent detection platform for modern brewing — driving quality and efficiency with data.',
    columns: {
      product: {
        title: 'Product',
        items: ['Real-time Monitoring', 'Data Visualization', 'Smart Alerts', 'Batch Traceability']
      },
      solutions: {
        title: 'Solutions',
        items: ['Fermentation Monitoring', 'Quality Control', 'Compliance & Traceability', 'Data Assets']
      }
    },
    attribution: 'BrewGuard · Intelligent Fermentation Monitoring Platform',
    rights: '© {year} BrewGuard. All rights reserved.'
  },
  stats: {
    items: {
      accuracy: { value: 99.2, suffix: '%', decimals: 1, label: 'Detection Accuracy' },
      uptime: { value: 24, suffix: '/7', decimals: 0, label: 'Always Online' },
      datapoints: { value: 200000, suffix: '+', decimals: 0, label: 'Data Points Collected' },
      clients: { value: 50, suffix: '+', decimals: 0, label: 'Breweries Served' }
    }
  },
  howItWorks: {
    eyebrow: 'How It Works',
    title: 'From sensor to report in four steps',
    subtitle: 'A closed loop covering the entire detection workflow — every batch is data-driven and verifiable.',
    steps: {
      collect: { title: 'Data Collection', desc: 'Sensors capture temperature, pH, ABV and gravity in real time, streaming every parameter to the cloud.' },
      analyze: { title: 'Real-time Analysis', desc: 'Trends are computed and visualized on the fly, surfacing fermentation status and historical patterns at a glance.' },
      alert: { title: 'Smart Alerts', desc: 'Threshold breaches and anomalous trends trigger instant alerts, pinpointing at-risk batches before they ship.' },
      trace: { title: 'Batch Traceability', desc: 'Complete batch records and quality reports, exportable in one click for compliance and audit.' }
    }
  },
  dataPreview: {
    eyebrow: 'Live Monitoring',
    title: 'See your fermentation in real time',
    subtitle: 'Multi-dimensional trend curves keep every batch transparent and under control.',
    tempLabel: 'Temperature (°C)',
    phLabel: 'pH',
    liveTag: 'LIVE'
  },
  industries: {
    eyebrow: 'Solutions',
    title: 'Built for every kind of brewing',
    subtitle: 'From craft workshops to industrial plants, BrewGuard adapts to your production reality.',
    items: {
      beer: { title: 'Craft Breweries', desc: 'Track ale and lager fermentations with precise temperature and gravity curves.' },
      wine: { title: 'Wineries', desc: 'Monitor must fermentation and malolactic stages with Brix and pH trends.' },
      spirit: { title: 'Distilleries', desc: 'Oversee mashing and fermentation for spirits with multi-vessel batch management.' },
      lab: { title: 'R&D Labs', desc: 'Pilot-scale experiments with full sensor data capture and exportable reports.' }
    }
  },
  cta: {
    title: 'Start your intelligent detection journey',
    subtitle: 'Join the breweries producing with data, not guesswork.',
    button: 'Get Started'
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    subtitle: 'Everything you need to know before getting started.',
    items: [
      { q: 'Which sensors and protocols are supported?', a: 'BrewGuard supports common analog and digital sensors for temperature, pH, dissolved oxygen, ABV and gravity, accessible via MQTT, Modbus and standard REST endpoints.' },
      { q: 'Can it integrate with our existing production system?', a: 'Yes. BrewGuard exposes a documented REST API and can push events to ERP/MES systems, so it fits into your current workflow without a full replacement.' },
      { q: 'How is batch data stored and exported?', a: 'Every batch keeps a complete record — sensor timeline, alerts and quality verdicts — exportable to PDF or Excel in one click for compliance and audit.' },
      { q: 'Is it suitable for small craft breweries?', a: 'Absolutely. BrewGuard scales from a single fermentation tank in a craft workshop up to multi-vessel industrial lines, with per-batch configuration.' },
      { q: 'Do you offer a pilot or trial?', a: 'A pilot deployment on one production line is available so you can validate detection accuracy against your own process before scaling out.' }
    ]
  },
  marquee: {
    items: ['Real-time Monitoring', 'Smart Alerts', 'Batch Traceability', 'Data-Driven Brewing']
  },
  langToggle: {
    switchTo: '中文'
  },
  admin: {
    brand: 'BrewGuard Admin',
    backHome: 'Home',
    menu: {
      dashboard: 'Dashboard',
      batch: 'Fermentation Batches',
      system: 'System'
    },
    dashboard: {
      title: 'Dashboard',
      comingSoon: 'Dashboard coming soon.'
    },
    system: {
      title: 'System',
      comingSoon: 'System settings coming soon.'
    },
    batch: {
      title: 'Fermentation Batches',
      add: 'New Batch',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search batch no...',
      batchNo: 'Batch No',
      recipe: 'Recipe',
      status: 'Status',
      startTime: 'Start Time',
      endTime: 'End Time',
      remark: 'Remark',
      createdAt: 'Created At',
      actions: 'Actions',
      statuses: {
        fermenting: 'Fermenting',
        completed: 'Completed',
        abnormal: 'Abnormal'
      },
      confirmDelete: 'Are you sure you want to delete this batch?',
      saveSuccess: 'Batch saved successfully',
      deleteSuccess: 'Batch deleted successfully',
      empty: 'No batches yet. Create your first one.',
      detail: 'View Details',
      back: 'Back to Batches'
    },
    detection: {
      title: 'Detection Records',
      add: 'New Record',
      edit: 'Edit',
      delete: 'Delete',
      temperature: 'Temp (°C)',
      ph: 'pH',
      abv: 'ABV (%)',
      remark: 'Remark',
      createdAt: 'Recorded At',
      actions: 'Actions',
      confirmDelete: 'Are you sure you want to delete this record?',
      saveSuccess: 'Record saved successfully',
      deleteSuccess: 'Record deleted successfully',
      empty: 'No detection records yet. Add the first one.',
      batchInfo: 'Batch Info'
    }
  }
};
