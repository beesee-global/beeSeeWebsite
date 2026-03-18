import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type RowData = {
  [key: string]: any;
};

// ================================
// 🎨 DESIGN TOKENS
// ================================
const THEME = {
  header: {
    bg: "FF1E3A5F",
    font: "FFFFFFFF",
    font_size: 11,
  },
  row: {
    odd_bg: "FFFFFFFF",
    even_bg: "FFF0F4FA",
    font_color: "FF1A1A2E",
    font_size: 10,
  },
  border_color: "FFD0DCF0",
  font_name: "Arial",
  min_col_width: 14,
  max_col_width: 45,
  // Padding simulation:
  //   - indent: adds left/right breathing room (ExcelJS unit, ~1 char wide)
  //   - row_height: taller rows give vertical breathing room
  //   - header_height: extra tall header for vertical padding feel
  cell_indent: 1,         // horizontal indent (left padding equivalent)
  row_height: 24,         // increased from 20 → more vertical padding
  header_height: 32,      // increased from 26 → more vertical padding in header
};

// ================================
// 🕐 DATE FORMATTER
// ================================
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart}, ${hours12}:${minutes} ${period}`;
};

// ================================
// 📐 COLUMN WIDTH CALCULATOR
// Adds extra gutter to account for indent padding
// ================================
const calcColumnWidth = (header: string, values: string[]): number => {
  const allLengths = [header.length, ...values.map((v) => String(v ?? "").length)];
  const max = Math.max(...allLengths);
  // +4 instead of +3 to compensate for indent on both sides
  return Math.min(THEME.max_col_width, Math.max(THEME.min_col_width, max + 4));
};

// ================================
// 🖊️ BORDER HELPER
// ================================
const thinBorder = (): Partial<ExcelJS.Borders> => {
  const side: Partial<ExcelJS.Border> = {
    style: "thin",
    color: { argb: THEME.border_color },
  };
  return { top: side, left: side, bottom: side, right: side };
};

// ================================
// 📊 EXCEL EXPORT UTILITY
// ================================
/**
 * @param sheetsData     - { SheetName: RowData[] }
 * @param columnConfigs  - { SheetName: Array<{ header, key, width?, wrapText? }> }
 * @param fileName       - Output filename (without .xlsx)
 */
export const excelGenerate = async (
  sheetsData: { [key: string]: RowData[] },
  columnConfigs: {
    [key: string]: Array<{
      header: string;
      key: string;
      width?: number;
      wrapText?: boolean;
    }>;
  },
  fileName: string = "Job Orders"
): Promise<void> => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Job Order System";
    workbook.created = new Date();

    Object.entries(sheetsData).forEach(([sheetName, rowsData]) => {
      const worksheet = workbook.addWorksheet(sheetName, {
        views: [{ state: "frozen", ySplit: 1 }],
        properties: { defaultRowHeight: THEME.row_height },
      });

      const currentColumnConfig =
        columnConfigs[sheetName] ?? columnConfigs[Object.keys(columnConfigs)[0]];

      const DATE_KEYS = new Set(["status_date", "created_at", "updated_at"]);

      // ─── Pre-process cell values ───────────────────────────────────────────
      const processedRows = rowsData.map((rowData, rowIndex) =>
        currentColumnConfig.map((col) => {
          const value = rowData[col.key];
          if (value == null) {
            console.warn(`⚠️ Missing "${col.key}" in "${sheetName}" row ${rowIndex}`);
            return "N/A";
          }
          return DATE_KEYS.has(col.key) ? formatDate(String(value)) : value;
        })
      );

      // ─── Set column widths ─────────────────────────────────────────────────
      worksheet.columns = currentColumnConfig.map((col, i) => ({
        width:
          col.width ??
          calcColumnWidth(
            col.header,
            processedRows.map((r) => String(r[i] ?? ""))
          ),
      }));

      // ─── Header row ────────────────────────────────────────────────────────
      const headerRow = worksheet.addRow(currentColumnConfig.map((col) => col.header));
      headerRow.height = THEME.header_height;

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: { argb: THEME.header.font },
          size: THEME.header.font_size,
          name: THEME.font_name,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: THEME.header.bg },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: false,
          // indent not applied to centered header — centering overrides it
        };
        cell.border = thinBorder();
      });

      // ─── Detect number columns ─────────────────────────────────────────────
      const NUMBER_KEYS = new Set(
        currentColumnConfig
          .filter((col) => !DATE_KEYS.has(col.key))
          .map((col) => col.key)
          .filter((key) => rowsData.some((r) => typeof r[key] === "number"))
      );

      // ─── Check if any column uses wrapText ─────────────────────────────────
      const hasWrappedCol = currentColumnConfig.some((col) => col.wrapText);

      // ─── Data rows ─────────────────────────────────────────────────────────
      processedRows.forEach((rowValues, rowIndex) => {
        const row = worksheet.addRow(rowValues);

        // Fix height only when not wrapping; wrapped rows auto-expand
        if (!hasWrappedCol) {
          row.height = THEME.row_height;
        }

        const isEven = rowIndex % 2 === 1;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const colConfig = currentColumnConfig[colNumber - 1];
          const colKey = colConfig?.key ?? "";
          const shouldWrap = colConfig?.wrapText ?? false;

          // Zebra striping
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isEven ? THEME.row.even_bg : THEME.row.odd_bg },
          };

          // Font
          cell.font = {
            name: THEME.font_name,
            size: THEME.row.font_size,
            color: { argb: THEME.row.font_color },
          };

          // Alignment with indent for left/right padding simulation
          // - Left-aligned text: indent pushes content away from left border
          // - Right-aligned numbers: indent pushes content away from right border
          // - Centered dates: indent not applied (would shift off-center)
          if (NUMBER_KEYS.has(colKey)) {
            cell.alignment = {
              horizontal: "right",
              vertical: "top",
              wrapText: shouldWrap,
              indent: THEME.cell_indent,   // right-side breathing room
            };
          } else if (DATE_KEYS.has(colKey)) {
            cell.alignment = {
              horizontal: "center",
              vertical: "top",
              wrapText: shouldWrap,
              // no indent on centered cells
            };
          } else {
            cell.alignment = {
              horizontal: "left",
              vertical: "top",
              wrapText: shouldWrap,
              indent: THEME.cell_indent,   // left-side breathing room
            };
          }

          cell.border = thinBorder();
        });
      });
    });

    // ─── Export ──────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
    console.log(`✅ "${fileName}.xlsx" exported successfully`);
  } catch (error) {
    console.error("❌ excelGenerate failed:", error);
    throw error;
  }
};