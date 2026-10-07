/**
 * Portfolio contact form → email (+ optional Google Sheet log).
 *
 * Setup (script.google.com, signed in as the Google account that should send the mail):
 *   1. Open the existing project (or New project), replace Code.gs with this file, save.
 *   2. Run `testEmail` once from the editor and approve the permissions ("Send email as you").
 *   3. Deploy → New deployment → type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone        ← required; anything else returns "Access Denied" to visitors
 *   4. Copy the /exec URL into NEXT_PUBLIC_CONTACT_ENDPOINT (or the fallback in lib/contact.ts).
 * To update later without changing the URL: Manage deployments → ✏️ Edit → Version: "New version".
 * Opening the /exec URL in a private window should show {"ok":true,"service":"portfolio-contact"}.
 */

const RECIPIENT = "mayankbhadrasen244@gmail.com"
const SHEET_NAME = "Submissions" // used only when the script is bound to a spreadsheet
const MAX_LEN = { name: 120, email: 200, subject: 200, message: 5000 }

function doPost(e) {
  try {
    const data = parse_(e)

    // Honeypot: real visitors never see or fill the "company" field.
    if (data.company) return json_({ ok: true })

    const name = clip_(data.name, MAX_LEN.name)
    const email = clip_(data.email, MAX_LEN.email)
    const subject = clip_(data.subject, MAX_LEN.subject)
    const message = clip_(data.message, MAX_LEN.message)

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: "Please include your name, a valid email and a message." })
    }

    logToSheet_([new Date(), name, email, subject, message])

    MailApp.sendEmail({
      to: RECIPIENT,
      replyTo: email,
      name: "Portfolio contact form",
      subject: "Portfolio: " + (subject || "New message") + " — " + name,
      body: "From: " + name + " <" + email + ">\nSubject: " + (subject || "—") + "\n\n" + message,
      htmlBody:
        '<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#111">' +
        '<p style="margin:0 0 4px;color:#666">New message from your portfolio</p>' +
        "<h2 style=\"margin:0 0 16px\">" + esc_(subject || "New message") + "</h2>" +
        "<p><b>" + esc_(name) + "</b> &lt;<a href=\"mailto:" + esc_(email) + "\">" + esc_(email) + "</a>&gt;</p>" +
        '<div style="white-space:pre-wrap;padding:16px;border-left:3px solid #9d6bff;background:#f6f4fb">' + esc_(message) + "</div>" +
        '<p style="color:#888;font-size:12px">Reply to this email to answer ' + esc_(name) + " directly.</p></div>",
    })

    return json_({ ok: true })
  } catch (err) {
    console.error(err)
    return json_({ ok: false, error: "Server error" })
  }
}

/** Lets you open the /exec URL in a browser to check the deployment is live. */
function doGet() {
  return json_({ ok: true, service: "portfolio-contact" })
}

/** Run once from the editor to confirm email delivery and authorise MailApp. */
function testEmail() {
  MailApp.sendEmail(RECIPIENT, "Portfolio contact form — test", "If you can read this, the mailer works.")
}

function parse_(e) {
  if (!e) return {}
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents)
    } catch (_) {
      /* fall through to form fields */
    }
  }
  return e.parameter || {}
}

function logToSheet_(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet && SpreadsheetApp.getActiveSpreadsheet()
  if (!ss) return
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) sheet.appendRow(["Received", "Name", "Email", "Subject", "Message"])
  sheet.appendRow(row)
}

function clip_(v, n) {
  return String(v == null ? "" : v).trim().slice(0, n)
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  })
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
