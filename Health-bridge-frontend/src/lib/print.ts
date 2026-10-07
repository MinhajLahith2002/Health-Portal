// ✅ Print utility functions
export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow popups for printing');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 20px; color: #0F172A; }
          .no-print { display: none !important; }
          @media print {
            @page { size: A4; margin: 15mm; }
            body { padding: 0; }
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #E2E8F0; }
          th { background: #F8FAFC; font-weight: 600; }
          .header { margin-bottom: 24px; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// ✅ Print current window
export const printPage = () => {
  window.print();
};