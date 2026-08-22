import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function exportToExcel(data: Record<string, any>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Report")
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPDF(
  title: string,
  columns: string[],
  rows: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, 20)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 28)
  autoTable(doc, {
    startY: 35,
    head: [columns],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [0, 102, 107],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [247, 247, 248],
    },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.5,
  })
  doc.save(`${filename}.pdf`)
}
