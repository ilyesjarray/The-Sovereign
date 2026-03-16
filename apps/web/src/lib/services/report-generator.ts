import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class ReportGenerator {
    static generatePortfolioReport(assets: any[], totalValue: number) {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // BRANDING HEADER
        doc.setFillColor(15, 15, 15);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(0, 243, 255); // Hyper Cyan
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('THE SOVEREIGN OS', 15, 20);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('INTELLIGENCE UNIT // WEALTH SECTOR REPORT', 15, 30);
        doc.text(`DATE: ${timestamp.toUpperCase()}`, 150, 30);

        // SUMMARY SECTION
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('TOTAL ASSETS VALUE:', 15, 55);
        doc.setTextColor(0, 180, 0);
        doc.text(`$${totalValue.toLocaleString()}`, 75, 55);

        // TABLE
        const tableData = assets.map(a => [
            a.asset_symbol,
            a.amount.toString(),
            `$${a.current_price?.toLocaleString() || 'N/A'}`,
            `$${a.value?.toLocaleString() || 'N/A'}`,
            `${a.change_24h}%`
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['ASSET', 'UNITS', 'PRICE', 'TOTAL VALUE', '24H CHANGE']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [15, 15, 15], textColor: [0, 243, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // FOOTER
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('SECURED BY SOVEREIGN ORACLE PROTOCOL. ALL DATA VERIFIED IN REAL-TIME.', 15, doc.internal.pageSize.height - 10);

        doc.save(`Sovereign_Wealth_Report_${Date.now()}.pdf`);
    }

    static generateIntelligenceBrief(intel: any, type: string = 'SIGNAL_VERIFICATION') {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // BRANDING HEADER
        doc.setFillColor(15, 15, 15);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(0, 243, 255); // Hyper Cyan
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('THE SOVEREIGN OS', 15, 20);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`INTELLIGENCE UNIT // ${type} REPORT`, 15, 30);
        doc.text(`DATE: ${timestamp.toUpperCase()}`, 150, 30);

        // CONTENT
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('SUMMARY ANALYSIS:', 15, 55);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(intel.description || intel.summary || "No analysis content available.", 180);
        doc.text(splitText, 15, 65);

        if (intel.branches || intel.timelines) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('PROBABLE TIMELINES:', 15, 110);

            const branches = intel.branches || intel.timelines;
            const tableData = branches.map((b: any) => [
                b.name,
                `${b.probability}%`,
                b.horizon,
                b.description.slice(0, 50) + '...'
            ]);

            autoTable(doc, {
                startY: 120,
                head: [['SCENARIO', 'PROBABILITY', 'HORIZON', 'DESCRIPTION']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [15, 15, 15], textColor: [0, 243, 255] }
            });
        }

        // FOOTER
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('CLASSIFIED INFORMATION. LEVEL 7 CLEARANCE REQUIRED.', 15, doc.internal.pageSize.height - 10);

        doc.save(`Sovereign_Briefing_${Date.now()}.pdf`);
    }
}
