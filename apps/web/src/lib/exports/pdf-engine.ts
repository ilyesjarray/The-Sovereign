import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PDFExportOptions {
    elementId: string;
    filename: string;
    watermark?: string;
    orientation?: 'portrait' | 'landscape';
}

/**
 * Sovereign PDF Intelligence Engine
 * Captures a DOM element and exports it as a high-fidelity PDF report
 * while preserving the Matrix-esque cybernetic aesthetic.
 */
export async function exportToSovereignPDF({
    elementId,
    filename,
    watermark = 'SOVEREIGN ELITE INTELLIGENCE // RESTRICTED ACCESS',
    orientation = 'landscape'
}: PDFExportOptions): Promise<void> {
    const targetElement = document.getElementById(elementId);

    if (!targetElement) {
        console.error(`Sovereign PDF Engine: Element with ID ${elementId} not found.`);
        throw new Error('Target element not found');
    }

    // Attempt to inject a temporary high-contrast class for better printable contrast if needed
    // The Matrix aesthetic uses dark backgrounds, so we print with a black background
    const originalStyle = targetElement.style.cssText;

    try {
        // Wait for fonts to load or animations to settle
        await new Promise(r => setTimeout(r, 500));

        // Capture the element using html2canvas
        const canvas = await html2canvas(targetElement, {
            scale: 2, // High resolution
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#000000', // Enforce obsidian background
            logging: false,
        });

        // ... intermediate logic ...
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Scale appropriately
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const finalWidth = canvas.width * ratio;
        const finalHeight = canvas.height * ratio;

        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        // Ensure background is perfectly dark for the page
        pdf.setFillColor(0, 0, 0); // #000000 literal
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // Add the captured image
        pdf.addImage(imgData, 'JPEG', (pdfWidth - finalWidth) / 2, 10, finalWidth, finalHeight);

        // Add Sovereign Watermark Footer
        pdf.setFontSize(8);
        pdf.setTextColor(212, 175, 55); // neon-blue #00F3FF
        pdf.text(
            `${watermark} - GENERATED_SYSTEM_LOG_${new Date().getTime()}`,
            pdfWidth / 2,
            pdfHeight - 10,
            { align: 'center' }
        );

        // Save
        pdf.save(`${filename}.pdf`);

    } catch (error) {
        console.error('Sovereign PDF Generation failed:', error);
        throw error;
    } finally {
        // Restore any temporary styles if we modified them
        targetElement.style.cssText = originalStyle;
    }
}
