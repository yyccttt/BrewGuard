import { jsPDF } from 'jspdf';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * 批次报告 PDF 导出工具
 *
 * 用 jsPDF 直接绘制(标题/信息表/记录列表/趋势图/页脚),
 * 趋势图用 chart.js 在离屏 canvas 渲染后转图片嵌入,不依赖页面 DOM 状态,更稳定。
 *
 * 参考:AI-REFERENCE-GUIDE 模板 7
 */

export interface ReportBatch {
  batch_no: string;
  recipe?: string;
  status?: string;
  start_time?: string | null;
  end_time?: string | null;
  remark?: string;
}

export interface ReportDetection {
  temperature?: number | null;
  ph?: number | null;
  abv?: number | null;
  remark?: string;
  created_at?: string;
}

export interface ReportLabels {
  reportTitle: string;          // 批次质检报告
  basicInfo: string;            // 批次基本信息
  status: string;
  startTime: string;
  endTime: string;
  remark: string;
  recipe: string;
  detectionRecords: string;     // 检测记录
  temperature: string;
  ph: string;
  abv: string;
  time: string;
  trend: string;                // 趋势图
  generatedAt: string;          // 生成时间
}

const PAGE_W = 595.28; // A4 宽(pt)
const PAGE_H = 841.89;
const MARGIN = 40;

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function datePart(s?: string | null): string {
  return s ? String(s).replace('T', ' ').slice(0, 19) : '-';
}

// 离屏渲染三合一趋势图(温度/pH/酒精度),返回 dataURL
async function renderTrendChart(records: ReportDetection[]): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const labels = records.map((r, i) => `${i + 1}`);
  const make = (key: 'temperature' | 'ph' | 'abv', color: string) => ({
    label: key,
    data: records.map((r) => (r[key] ?? null)),
    borderColor: color,
    backgroundColor: color,
    tension: 0.3,
    pointRadius: 2,
    borderWidth: 2,
    spanGaps: true,
  });

  return new Promise((resolve) => {
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          make('temperature', '#ff6b6b'),
          make('ph', '#4dabf7'),
          make('abv', '#7cff67'),
        ],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: { legend: { labels: { color: '#333' } } },
        scales: {
          x: { ticks: { color: '#666' }, grid: { color: '#eee' } },
          y: { ticks: { color: '#666' }, grid: { color: '#eee' } },
        },
      },
    });
    // animation:false 下可立即取图
    const url = canvas.toDataURL('image/png');
    chart.destroy();
    resolve(url);
  });
}

export async function exportBatchReport(
  batch: ReportBatch,
  records: ReportDetection[],
  labels: ReportLabels,
  statusText: string,
): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = MARGIN;

  // ---- 标题 ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text(`${batch.batch_no} - ${batch.recipe || ''}`, MARGIN, y);
  y += 8;
  doc.setDrawColor(124, 255, 103);
  doc.setLineWidth(2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(labels.reportTitle, MARGIN, y);
  y += 28;

  // ---- 批次基本信息表 ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(labels.basicInfo, MARGIN, y);
  y += 10;

  const infoRows: [string, string][] = [
    [labels.status, statusText],
    [labels.recipe, batch.recipe || '-'],
    [labels.startTime, datePart(batch.start_time)],
    [labels.endTime, datePart(batch.end_time)],
    [labels.remark, batch.remark || '-'],
  ];

  const colW = (PAGE_W - 2 * MARGIN) / 2;
  const rowH = 20;
  infoRows.forEach(([k, v], i) => {
    const ry = y + i * rowH;
    // 交替背景
    if (i % 2 === 0) {
      doc.setFillColor(247, 249, 247);
      doc.rect(MARGIN, ry - 13, PAGE_W - 2 * MARGIN, rowH, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(k, MARGIN + 8, ry);
    doc.setTextColor(30, 30, 30);
    // 长文本截断
    const val = v.length > 48 ? v.slice(0, 46) + '...' : v;
    doc.text(val, MARGIN + colW + 8, ry);
  });
  y += infoRows.length * rowH + 24;

  // ---- 检测记录列表 ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(labels.detectionRecords, MARGIN, y);
  y += 14;

  // 表头
  const cols = [
    { header: labels.time, w: 130 },
    { header: labels.temperature, w: 95 },
    { header: labels.ph, w: 75 },
    { header: labels.abv, w: 95 },
    { header: labels.remark, w: 120 },
  ];
  doc.setFillColor(124, 255, 103);
  doc.rect(MARGIN, y - 11, PAGE_W - 2 * MARGIN, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 50, 30);
  let x = MARGIN + 6;
  cols.forEach((c) => {
    doc.text(c.header, x, y);
    x += c.w;
  });
  y += 16;

  // 表体
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  records.slice(0, 100).forEach((r, i) => {
    if (y > PAGE_H - MARGIN - 60) {
      doc.addPage();
      y = MARGIN;
    }
    if (i % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(MARGIN, y - 11, PAGE_W - 2 * MARGIN, 16, 'F');
    }
    x = MARGIN + 6;
    const cells = [
      datePart(r.created_at),
      r.temperature != null ? String(r.temperature) : '-',
      r.ph != null ? String(r.ph) : '-',
      r.abv != null ? String(r.abv) : '-',
      r.remark || '',
    ];
    cells.forEach((val, idx) => {
      const max = cols[idx].w - 8;
      let text = String(val);
      // 粗略截断
      while (doc.getTextWidth(text) > max && text.length > 1) text = text.slice(0, -1);
      if (text !== String(val)) text = text.slice(0, -1) + '...';
      doc.text(text, x, y);
      x += cols[idx].w;
    });
    y += 16;
  });

  y += 18;

  // ---- 趋势图(仅有数据时) ----
  if (records.length > 0) {
    if (y > PAGE_H - MARGIN - 240) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(labels.trend, MARGIN, y);
    y += 8;

    const img = await renderTrendChart(records);
    if (img) {
      const imgW = PAGE_W - 2 * MARGIN;
      const imgH = (imgW * 420) / 1000;
      doc.addImage(img, 'PNG', MARGIN, y, imgW, imgH);
      y += imgH + 10;
    }
  }

  // ---- 页脚 ----
  const footerY = PAGE_H - 22;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, footerY, PAGE_W - MARGIN, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`${labels.generatedAt}: ${formatDate(new Date())}`, MARGIN, PAGE_H - 10);
  doc.text('BrewGuard', PAGE_W - MARGIN - 50, PAGE_H - 10);

  // ---- 保存 ----
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`BrewGuard_报告_${batch.batch_no}_${dateStr}.pdf`);
}

export default exportBatchReport;
