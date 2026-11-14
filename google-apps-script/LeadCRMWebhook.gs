/**
 * ============================================================================
 * MGBS Inc. (Millennium Global Business Solutions)
 * Lead CRM Webhook - Serverless Google Apps Script Handler
 * 
 * Target Spreadsheet ID: 1udlLNXjaxnW6GO3n-yffB1qNE3MExdH83y9g_48h-Nk
 * Target Tab: Lead_CRM
 * 
 * Architecture:
 * - AntiGravity v3.0 Resilient Sheets Architecture
 * - Zero hardcoded column indexes (Dynamic Header Mapping via GLOBAL_CONFIG)
 * - Self-healing schema validation & range protection
 * - Idempotency & deduplication via CacheService
 * - Dual email notification dispatch (bizsupport@mgbs.com & snangunerimgbs@gmail.com)
 * - Supports CORS preflight and no-cors POST submissions
 * ============================================================================
 */

// Global Configuration (Single Source of Truth)
const GLOBAL_CONFIG = {
  SPREADSHEET_ID: "1udlLNXjaxnW6GO3n-yffB1qNE3MExdH83y9g_48h-Nk",
  SHEET_NAMES: {
    LEAD_CRM: "Lead_CRM"
  },
  COLS: {
    Lead_CRM: [
      "Timestamp",
      "Full_Name",
      "Work_Email",
      "Phone",
      "Company",
      "Operational_Challenge",
      "Message",
      "Status",
      "Client_Transaction_Id"
    ]
  },
  NOTIFICATION_EMAILS: [
    "bizsupport@mgbs.com",
    "snangunerimgbs@gmail.com"
  ],
  VERSION: "1.0.0"
};

/**
 * Health-Check GET Handler
 */
function doGet(e) {
  const output = {
    status: "ok",
    service: "MGBS Lead CRM Webhook",
    version: GLOBAL_CONFIG.VERSION,
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Incoming Lead POST Handler
 */
function doPost(e) {
  try {
    let payload = {};

    // 1. Parse incoming payload (supports application/json or url-encoded form)
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Fallback for form-urlencoded or parameter object
        payload = e.parameter || {};
      }
    } else if (e.parameter) {
      payload = e.parameter;
    }

    // 2. Extract and sanitize lead attributes
    const clientTxId = payload.client_transaction_id || Utilities.getUuid();
    
    // Idempotency check via CacheService (prevent double writes on network retries)
    const cache = CacheService.getScriptCache();
    if (cache.get(clientTxId)) {
      return createCorsJsonResponse({
        status: "success",
        message: "Duplicate request ignored (already recorded)",
        transaction_id: clientTxId
      });
    }

    const leadObject = {
      Timestamp: Utilities.formatDate(new Date(), "GMT+0", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      Full_Name: sanitizeInput(payload.full_name || payload.Full_Name || "Anonymous"),
      Work_Email: sanitizeInput(payload.work_email || payload.Work_Email || ""),
      Phone: sanitizeInput(payload.phone || payload.Phone || "Not provided"),
      Company: sanitizeInput(payload.company || payload.Company || "Not specified"),
      Operational_Challenge: sanitizeInput(payload.operational_challenge || payload.Operational_Challenge || "General Inquiry"),
      Message: sanitizeInput(payload.message || payload.Message || ""),
      Status: "NEW_LEAD",
      Client_Transaction_Id: clientTxId
    };

    // 3. Ensure target spreadsheet and tab exist with self-healing schema
    const ss = getSpreadsheet();
    const sheet = validateSchema(ss);

    // 4. Append lead using dynamic header mapping (Zero hardcoded indexes)
    appendObjectToSheet(sheet, GLOBAL_CONFIG.COLS.Lead_CRM, leadObject);

    // 5. Store transaction ID in CacheService for 10 minutes to prevent duplicates
    cache.put(clientTxId, "PROCESSED", 600);

    // 6. Send executive notification emails
    sendNotificationEmail(leadObject);

    // 7. Return successful JSON response
    return createCorsJsonResponse({
      status: "success",
      message: "MGBS consultation inquiry registered successfully",
      timestamp: leadObject.Timestamp,
      transaction_id: clientTxId
    });

  } catch (err) {
    console.error("Webhook processing error: " + err.toString());
    return createCorsJsonResponse({
      status: "error",
      message: err.toString()
    }, 500);
  }
}

/**
 * Access the target spreadsheet safely
 */
function getSpreadsheet() {
  if (GLOBAL_CONFIG.SPREADSHEET_ID && GLOBAL_CONFIG.SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(GLOBAL_CONFIG.SPREADSHEET_ID);
    } catch (e) {
      console.warn("Could not open by ID, falling back to active spreadsheet: " + e.message);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Self-healing schema validation
 * Guarantees Row 1 headers exist, protects headers, and enforces styling
 */
function validateSchema(ss) {
  const sheetName = GLOBAL_CONFIG.SHEET_NAMES.LEAD_CRM;
  const expectedHeaders = GLOBAL_CONFIG.COLS.Lead_CRM;
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(expectedHeaders);

    // Style and freeze header row
    const headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0B2545");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);

    // Protect header row to avoid accidental manual deletion
    try {
      const protection = headerRange.protect().setDescription("MGBS Lead CRM Header Protection");
      protection.setWarningOnly(true);
    } catch (protErr) {
      console.log("Protection note: " + protErr.message);
    }
  } else {
    // If sheet exists, ensure headers match
    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // If empty or missing first header, reinitialize
    if (!existingHeaders[0] || existingHeaders[0] === "") {
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold").setBackground("#0B2545").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * Dynamically map an object to a sheet row based on current sheet headers
 */
function appendObjectToSheet(sheet, expectedHeaders, obj) {
  const lastCol = Math.max(sheet.getLastColumn(), expectedHeaders.length);
  const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const rowData = currentHeaders.map(header => {
    return (obj[header] !== undefined && obj[header] !== null) ? obj[header] : "";
  });

  sheet.appendRow(rowData);
}

/**
 * Dispatch HTML formatted email alert to Dr. Shree & BizSupport
 */
function sendNotificationEmail(lead) {
  try {
    const subject = `[MGBS Lead CRM] New Consultation Inquiry: ${lead.Full_Name} (${lead.Company}) - ${lead.Operational_Challenge}`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #0B2545; color: #FFFFFF; padding: 24px; text-align: left;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">MGBS Inc. - Millennium Global Business Solutions</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #D4AF37; font-weight: 600;">Lean 6σ Universal Executive Lead Notification</p>
        </div>

        <div style="padding: 28px; background-color: #ffffff; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
            A new high-intent executive consultation inquiry has been submitted through the MGBS Lead Funnel.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-weight: 600; color: #64748b; width: 35%;">Prospect Name:</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #0f172a;">${escapeHtml(lead.Full_Name)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-weight: 600; color: #64748b;">Work Email:</td>
              <td style="padding: 10px 8px; color: #0284c7;"><a href="mailto:${escapeHtml(lead.Work_Email)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(lead.Work_Email)}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-weight: 600; color: #64748b;">Phone / WhatsApp:</td>
              <td style="padding: 10px 8px; color: #0f172a;">${escapeHtml(lead.Phone)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-weight: 600; color: #64748b;">Company / Organization:</td>
              <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">${escapeHtml(lead.Company)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-weight: 600; color: #64748b;">Target Operational Area:</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #b45309; background-color: #fffbeb; border-radius: 4px;">${escapeHtml(lead.Operational_Challenge)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-weight: 600; color: #64748b;">Submission Timestamp:</td>
              <td style="padding: 10px 8px; color: #64748b;">${escapeHtml(lead.Timestamp)}</td>
            </tr>
          </table>

          <div style="margin-top: 16px;">
            <p style="font-weight: 600; color: #64748b; margin-bottom: 6px; font-size: 13px;">Executive Message / Specific Challenge Details:</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0B2545; padding: 14px; font-size: 14px; color: #334155; line-height: 1.6; border-radius: 0 4px 4px 0;">
              ${lead.Message ? escapeHtml(lead.Message).replace(/\n/g, "<br>") : "<em>No additional details provided.</em>"}
            </div>
          </div>

          <div style="margin-top: 28px; text-align: center;">
            <a href="mailto:${escapeHtml(lead.Work_Email)}?subject=Re:%20MGBS%20Consultation%20with%20Dr.%20Shree%20Nanguneri" 
               style="background-color: #0B2545; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 6px; display: inline-block;">
              Reply to ${escapeHtml(lead.Full_Name)}
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          MGBS Inc. • 20+ Years Global Operational Excellence • USA | India | Asia-Pacific<br>
          Connected to Google Sheet ID: <code>${GLOBAL_CONFIG.SPREADSHEET_ID}</code> (Tab: <code>Lead_CRM</code>)
        </div>
      </div>
    `;

    GLOBAL_CONFIG.NOTIFICATION_EMAILS.forEach(email => {
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: htmlBody
      });
    });

  } catch (emailErr) {
    console.error("Email notification dispatch failed: " + emailErr.toString());
  }
}

/**
 * JSON Response with CORS Headers
 */
function createCorsJsonResponse(data, statusCode = 200) {
  const jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sanitize string inputs
 */
function sanitizeInput(str) {
  if (typeof str !== "string") return str || "";
  return str.trim();
}

/**
 * Basic HTML escaping to prevent injection in notification emails
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
