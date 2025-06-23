// components/GTMNoScript.jsx
const GTM_ID = 'GTM-NDBMR7C2';

const GTMNoScript = () => (
  <>
    {/* Google Tag Manager (noscript) */}
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      ></iframe>
    </noscript>
    {/* End Google Tag Manager (noscript) */}
  </>
);

export default GTMNoScript;
