/**
 * @license
 * SPDX-License-Identifier: MIT
 * Client-side clinical summary PDF report generation via jsPDF
 */

import { APP_FULL_TITLE, APP_NAME } from '../config';
import { UserSession } from './auth';
import { AnalysisResult } from './scorer';

export async function generatePdfReport(
  analysis: AnalysisResult,
  user?: UserSession | null,
  scanImageUrl?: string,
  heatmapImageUrl?: string
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryTeal = [13, 148, 136]; // #0d9488
  const darkSlate = [15, 23, 42]; // #0f172a
  const mutedSlate = [100, 116, 139]; // #64748b

  // 1. Header Banner
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(APP_NAME, 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(APP_FULL_TITLE, 14, 18);

  // 2. Metadata Block
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  doc.text(`User: ${user ? `${user.name} (${user.role})` : 'Anonymous Clinician'}`, 14, 37);
  doc.text(`File: ${analysis.fileName}`, 14, 42);

  const verdictLabel = analysis.verdict?.label || 'N/A';
  let badgeColor = [34, 197, 94]; // Green for Normal
  if (verdictLabel === 'Review') badgeColor = [245, 158, 11]; // Amber
  if (verdictLabel === 'Refer') badgeColor = [239, 68, 68]; // Red

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(140, 28, 56, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Verdict: ${verdictLabel}`, 144, 38);

  // 3. Quantitative Metrics Table
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, 196, 48);

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Screening Metrics', 14, 55);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Anomaly Score: ${analysis.score ?? 'N/A'}`, 14, 62);
  doc.text(`Percentile: ${analysis.verdict?.percentile ?? 'N/A'}%`, 75, 62);
  doc.text(`Borderline: ${analysis.verdict?.borderline ? 'YES (Human Review Advised)' : 'No'}`, 140, 62);

  doc.text(
    `Affected Area: ~${analysis.areaPercent ?? 0}% (Peak: ${analysis.region || 'None'})`,
    14,
    68
  );
  doc.text(`Reliability: ${analysis.reliabilityResult?.level || 'High'}`, 75, 68);
  doc.text(`Scanner Shift: ${analysis.shiftResult?.hasShift ? 'FLAGGED' : 'Normal'}`, 140, 68);

  // 4. Decision Support Findings
  doc.line(14, 73, 196, 73);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. Decision Support & Explanation', 14, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Observation: ${analysis.explanationSentence || 'No significant pattern.'}`, 14, 86);

  if (analysis.fusionResult && analysis.fusionResult.outcome !== 'No-model') {
    doc.text(`Pattern Match: ${analysis.fusionResult.message}`, 14, 92);
    doc.text(`Recommended Action: ${analysis.fusionResult.recommendedAction}`, 14, 98);
  }

  // 5. Visual Thumbnails (if available)
  let currentY = 106;
  if (scanImageUrl && heatmapImageUrl) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.text('3. Imaging Visualizations', 14, currentY);
      currentY += 4;
      doc.addImage(scanImageUrl, 'JPEG', 14, currentY, 45, 45);
      doc.addImage(heatmapImageUrl, 'PNG', 65, currentY, 45, 45);

      if (analysis.nearestHealthyThumbnail) {
        doc.addImage(analysis.nearestHealthyThumbnail, 'JPEG', 116, currentY, 45, 45);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Nearest Healthy', 116, currentY + 49);
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Input Scan', 14, currentY + 49);
      doc.text('Anomaly Heatmap', 65, currentY + 49);
      currentY += 56;
    } catch {
      currentY += 10;
    }
  }

  // 6. Clinical Guidance & Next Steps
  doc.line(14, currentY, 196, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. Recommended Clinical Next Steps', 14, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (analysis.nextSteps) {
    doc.text(analysis.nextSteps.primaryMessage, 14, currentY);
    currentY += 5;
    for (const item of analysis.nextSteps.actionItems) {
      doc.text(`• ${item}`, 18, currentY);
      currentY += 5;
    }
  }

  // 7. Disclaimers & Regulatory Notice
  currentY = Math.max(currentY + 4, 255);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);
  currentY += 5;

  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.setFontSize(7.5);
  doc.text(
    'MANDATORY REGULATORY DISCLAIMER: ScanKavach is an assistive research prototype and decision support tool.',
    14,
    currentY
  );
  currentY += 4;
  doc.text(
    'It is NOT a medical device and does NOT provide a clinical diagnosis or treatment prescription.',
    14,
    currentY
  );
  currentY += 4;
  doc.text(
    'All imaging flags must be reviewed and correlated clinically by a licensed physician or radiologist.',
    14,
    currentY
  );
  currentY += 4;
  doc.text('Privacy Note: On-device execution. Medical images never leave the local device.', 14, currentY);

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`scankavach-report-${dateStr}.pdf`);
}
