import { useState, useRef } from 'react';
import { useThemeContext } from '@/shared/context';

export const useInsightsExport = () => {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const iw = pw - 20;
      const ih = (canvas.height * iw) / canvas.width;
      let yPos = 10,
        remaining = ih;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 10, yPos, iw, ih);
        remaining -= ph - 20;
        if (remaining > 0) {
          pdf.addPage();
          yPos = -(ih - remaining) - 10;
        }
      }
      const month = new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      pdf.save(`FinTracker_Insights_${month.replace(' ', '_')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return {
    exportRef,
    exporting,
    handleExport,
  };
};
