// Utility to save PDFs to the File Manager archive

interface PDFRecord {
  id: string;
  fileName: string;
  recordType: "Invoice" | "Estimate" | "Job" | "Checklist" | "Customer";
  customerName: string;
  date: string;
  timestamp: string;
  recordId: string;
  pdfData: string;
}

export function savePDFToArchive(
  recordType: PDFRecord['recordType'],
  customerName: string,
  recordId: string,
  pdfDataUrl: string
): void {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleDateString().replace(/\//g, '-');
  const time = new Date().toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '_');
  
  const record: PDFRecord = {
    id: `${recordType}_${recordId}_${Date.now()}`,
    fileName: `${recordType}_${customerName.replace(/\s/g, '_')}_${date}_${time}.pdf`,
    recordType,
    customerName,
    date,
    timestamp,
    recordId,
    pdfData: pdfDataUrl
  };

  // Get existing records
  const existing = JSON.parse(localStorage.getItem('pdfArchive') || '[]');
  
  // Add new record
  existing.push(record);
  
  // Save back to localStorage
  localStorage.setItem('pdfArchive', JSON.stringify(existing));
}
