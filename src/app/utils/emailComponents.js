/**
 * Shared email building blocks used across all XmyTravel transactional emails.
 * All functions return HTML strings safe for inline email clients.
 *
 * buildSimpleFooter({ year }) — lightweight footer: AAQ link + privacy + copyright
 * buildEmailFooter({ expertName, expertPhoto, expertUsername, year }) — rich footer with expert card
 *
 * Mobile strategy:
 *  - Tables use width="100%" so they shrink naturally
 *  - Embedded <style> block handles @media overrides (supported by Gmail 2016+, Apple Mail, Outlook 2019+)
 *  - All buttons use padding (not fixed width) for tap-friendly sizing
 *  - Images use max-width:100%;height:auto; for fluid scaling
 */

// For text content
const esc = (v = "") =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// For URL attributes — keep & intact so storage URLs with query tokens aren't broken
const escUrl = (url = "") =>
  String(url)
    .replace(/"/g, "%22")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");

/** Shared mobile media-query style block embedded once per footer */
const mobileStyles = `
<style>
  @media only screen and (max-width:600px){
    .xmt-footer-cta-btn{display:block!important;width:90%!important;text-align:center!important;margin:0 auto!important;padding:14px 20px!important;font-size:15px!important;}
    .xmt-footer-links tr{display:block!important;}
    .xmt-footer-links td{display:block!important;text-align:center!important;padding:4px 0!important;}
    .xmt-footer-links .sep{display:none!important;}
    .xmt-expert-btn{display:block!important;width:90%!important;text-align:center!important;margin:0 auto!important;padding:14px 20px!important;font-size:15px!important;}
    .xmt-logo{width:120px!important;height:auto!important;}
  }
</style>`;

/**
 * Lightweight footer for transactional emails (OTP, booking, contact, etc.)
 */
export const buildSimpleFooter = ({ year = new Date().getFullYear() } = {}) => `
${mobileStyles}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">

  <tr><td height="12" style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>
  <tr>
    <td style="text-align:center;padding:20px 16px;background:#1f0123;border-radius:16px;">
      <img src="https://www.xmytravel.com/logolttx.svg" alt="XMyTravel" class="xmt-logo" width="130" height="auto" style="display:block;margin:0 auto 12px;max-width:100%;height:auto;" />
      <table role="presentation" cellpadding="0" cellspacing="0" class="xmt-footer-links" style="margin:0 auto 12px;">
        <tr>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Home</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;white-space:nowrap;">|</td>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#about" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">About</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;white-space:nowrap;">|</td>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#why-us" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Why us</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;white-space:nowrap;">|</td>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#features" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Features</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#joining-process" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Joining Process</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/news-and-media" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">News & Media</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/verification-process" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Verification Process</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/aaq" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Aaq</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/ask-an-expert" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Ask an Expert</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/privacy-policy" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Privacy Policy</a>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;color:#6b5a73;">&copy; ${year} XMyTravel &bull; <a href="https://www.xmytravel.com" style="color:#6b5a73;text-decoration:none;">xmytravel.com</a></div>
    </td>
  </tr>
</table>`;

/**
 * Rich footer with expert card, used in expert reply emails.
 */
export const buildEmailFooter = ({
  expertName = "",
  expertPhoto = "",
  expertUsername = "",
  year = new Date().getFullYear(),
} = {}) => {
  const expertProfileUrl = expertUsername
    ? `https://www.xmytravel.com/experts/${expertUsername}`
    : "";

  const expertCard = expertName ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td style="background:#faf6fb;border:1px solid #ece3ee;border-radius:20px;padding:24px 16px;text-align:center;">
        ${expertPhoto
          ? `<img src="${escUrl(expertPhoto)}" alt="${esc(expertName)}" width="80" height="80"
              style="border-radius:50%;object-fit:cover;border:3px solid #36013F;display:block;margin:0 auto 12px;max-width:80px;height:auto;" />`
          : `<div style="width:80px;height:80px;border-radius:50%;background:#36013F;color:#F4D35E;text-align:center;line-height:80px;font-size:32px;font-weight:800;margin:0 auto 12px;">${esc(expertName.charAt(0).toUpperCase())}</div>`
        }
        <div style="font-size:18px;font-weight:800;color:#36013F;margin-bottom:4px;">${esc(expertName)}</div>
        <div style="font-size:12px;color:#9a8ea0;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Verified Travel Expert &middot; XmyTravel</div>
        <a href="${escUrl(expertProfileUrl)}" class="xmt-expert-btn"
          style="display:inline-block;background:#36013F;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:800;">
          View Expert Profile &rarr;
        </a>
      </td>
    </tr>
  </table>` : "";

  return `
${mobileStyles}
${expertCard}


<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="background:#1f0123;border-radius:16px;padding:24px 16px;text-align:center;">
      <img src="https://www.xmytravel.com/logolttx.svg" alt="XMyTravel" class="xmt-logo" width="130" height="auto" style="display:block;margin:0 auto 10px;max-width:100%;height:auto;" />
      <div style="font-size:12px;color:#cdbed1;margin-bottom:12px;">Personalized Travel Planning For Smarter Journeys</div>
      <table role="presentation" cellpadding="0" cellspacing="0" class="xmt-footer-links" style="margin:0 auto 14px;">
        <tr>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Home</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;white-space:nowrap;">|</td>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#about" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">About</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;white-space:nowrap;">|</td>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#why-us" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Why us</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;white-space:nowrap;">|</td>
          <td style="padding:0 8px;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#features" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Features</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/about/#joining-process" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Joining Process</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/news-and-media" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">News & Media</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/verification-process" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Verification Process</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/aaq" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Aaq</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/ask-an-expert" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Ask an Expert</a>
          </td>
          <td class="sep" style="color:#5a4060;font-size:12px;padding:8px 0 0;white-space:nowrap;">|</td>
          <td style="padding:8px 8px 0;white-space:nowrap;">
            <a href="https://www.xmytravel.com/privacy-policy" style="font-size:12px;color:#a897af;text-decoration:none;font-weight:600;white-space:nowrap;">Privacy Policy</a>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;color:#6b5a73;">&copy; ${year} XMyTravel &bull; <a href="https://www.xmytravel.com" style="color:#6b5a73;text-decoration:none;">xmytravel.com</a> &bull; info@xmytravel.com</div>
    </td>
  </tr>
</table>`;
};
