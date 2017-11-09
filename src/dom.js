export const createIframe = () => {
  const iframe = document.createElement("iframe");

  iframe.style.cssText = "display:none";
  //iframe.sandbox = "allow-top-navigation allow-same-origin";
  iframe.setAttribute("role", "presentation");
  iframe.tabIndex = -1;
  //iframe.allowTransparency = true;
  iframe.src = "javascript:false"; // eslint-disable-line no-script-url

  document.head.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument
    ? iframe.contentDocument
    : iframe.contentWindow ? iframe.contentWindow.document : iframe.document;

  iframeDocument.write();
  iframeDocument.close();

  return {
    iframeDocument,
    iframeWindow
  };
};
