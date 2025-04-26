// components/previews/headers.ts
export const headersPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) pill‑shaped header bar with dot, text bars, and end highlight -->
  <div
    class="relative flex w-[60%] items-center justify-center gap-2
           rounded-full bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           py-1 pl-2 pr-3 shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-12"
  >
    <!-- a) teal dot -->
    <div class="flex shrink grow basis-0">
      <div
        class="h-3 w-3 rounded-full border border-[#2EBDC9]
               bg-[#25AEBA]
               shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]
               transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
               group-hover:-translate-y-[.125rem]
               group-hover:translate-x-1
               group-hover:scale-x-125"
      ></div>
    </div>

    <!-- b) small text bars -->
    <div
      class="h-2 w-[10%] rounded-sm bg-slate-5
             transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-translate-y-[.125rem]"
    ></div>
    <div
      class="h-2 w-[10%] rounded-sm bg-slate-5
             transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-translate-y-[.125rem] group-hover:skew-x-1 group-hover:scale-105"
    ></div>
    <div
      class="h-2 w-[10%] rounded-sm bg-slate-5
             transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-translate-y-[.125rem]"
    ></div>

    <!-- c) teal highlight at the right -->
    <div
      class="h-2 w-[10%] rounded-sm border border-[#2EBDC9]
             bg-[#25AEBA]
             shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
    ></div>
  </div>
`;

export const headersIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32">
  <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.25"/>
  </filter></defs>
  <rect x="12" y="8"  width="40" height="16" rx="8" fill="#25AEBA" filter="url(#shadow)"/>
  <rect x="16" y="14" width="32" height="4"  rx="2" fill="rgba(0,0,0,0.3)"/>
  <g transform="translate(38 12) scale(1.3) rotate(-20)" filter="url(#shadow)">
    <path d="M4.037 4.688 a.495.495 0 0 1 .651-.651 l16 6.5 a.5.5 0 0 1-.063.947 l-6.124 1.58 a2 2 0 0 0-1.438 1.435 l-1.579 6.126 a.5.5 0 0 1-.947.063 z" fill="#fff"/>
  </g>
</svg>
`;

export const headersSnippetHtml = `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <title></title>
  
    <style type="text/css">
      
      @media only screen and (min-width: 620px) {
        .u-row {
          width: 600px !important;
        }

        .u-row .u-col {
          vertical-align: top;
        }

        
            .u-row .u-col-8p5 {
              width: 51px !important;
            }
          

            .u-row .u-col-8p83 {
              width: 52.98px !important;
            }
          

            .u-row .u-col-9 {
              width: 54px !important;
            }
          

            .u-row .u-col-36p5 {
              width: 219px !important;
            }
          

            .u-row .u-col-37p17 {
              width: 223.02px !important;
            }
          

            .u-row .u-col-100 {
              width: 600px !important;
            }
          
      }

      @media only screen and (max-width: 620px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }

        .u-row {
          width: 100% !important;
        }

        .u-row .u-col {
          display: block !important;
          width: 100% !important;
          min-width: 320px !important;
          max-width: 100% !important;
        }

        .u-row .u-col > div {
          margin: 0 auto;
        }


        .u-row .u-col img {
          max-width: 100% !important;
        }

}
    
body{margin:0;padding:0}table,td,tr{border-collapse:collapse;vertical-align:top}.ie-container table,.mso-container table{table-layout:fixed}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit!important;text-decoration:none!important}


@media (max-width: 480px) {
            .hide-mobile {
              
              max-height: 0px;
              overflow: hidden;
    
              display: none !important;
            }
          }
          

table, td { color: #000000; } @media (max-width: 480px) { #u_content_heading_12 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_heading_12 .v-text-align { text-align: center !important; } #u_content_menu_1 .v-padding { padding: 5px 10px !important; } #u_content_heading_1 .v-container-padding-padding { padding: 40px 10px 0px !important; } #u_content_heading_1 .v-font-size { font-size: 28px !important; } #u_content_heading_1 .v-line-height { line-height: 120% !important; } #u_content_text_1 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_column_4 .v-col-border { border-top: 0px solid transparent !important;border-left: 130px solid #ffecdf !important;border-right: 130px solid #ffecdf !important;border-bottom: 0px solid transparent !important; } #u_content_heading_3 .v-container-padding-padding { padding: 10px !important; } #u_content_heading_3 .v-text-align { text-align: center !important; } #u_column_6 .v-col-border { border-top: 5px solid #ffecdf !important;border-left: 130px solid #ffecdf !important;border-right: 130px solid #ffecdf !important;border-bottom: 0px solid transparent !important; } #u_column_7 .v-col-border { border-top: 5px solid #ffecdf !important;border-left: 130px solid #ffecdf !important;border-right: 130px solid #ffecdf !important;border-bottom: 0px solid transparent !important; } #u_column_8 .v-col-border { border-top: 5px solid #ffecdf !important;border-left: 130px solid #ffecdf !important;border-right: 130px solid #ffecdf !important;border-bottom: 0px solid transparent !important; } #u_column_9 .v-col-border { border-top: 5px solid #ffecdf !important;border-left: 130px solid #ffecdf !important;border-right: 130px solid #ffecdf !important;border-bottom: 0px solid transparent !important; } #u_content_heading_2 .v-container-padding-padding { padding: 10px !important; } #u_content_heading_2 .v-text-align { text-align: center !important; } #u_content_divider_2 .v-container-padding-padding { padding: 15px !important; } #u_column_12 .v-col-border { border-top: 0px solid transparent !important;border-left: 20px solid #ffecdf !important;border-right: 20px solid #ffecdf !important;border-bottom: 10px solid #ffecdf !important; } #u_content_text_2 .v-container-padding-padding { padding: 20px 10px 90px !important; } #u_content_button_1 .v-size-width { width: 65% !important; } #u_content_button_1 .v-container-padding-padding { padding: 10px 10px 40px !important; } #u_content_social_1 .v-container-padding-padding { padding: 40px 10px 10px !important; } #u_content_text_3 .v-container-padding-padding { padding: 10px 10px 20px !important; } }
    </style>
  
  

<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Playfair+Display:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table role="presentation" id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
  <tbody>
  <tr style="vertical-align: top">
    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
    <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
    
  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" class="v-col-border" style="background-color: #ffecdf;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffecdf;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_heading_12" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:20px 0px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; color: #000000; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;"><span>[Your Logo]</span></h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" class="v-col-border" style="background-color: #ffd6c8;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffd6c8;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_menu_1" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
<div class="menu" style="text-align:center;">
<!--[if (mso)|(IE)]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr><![endif]-->

  <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 5px 15px; display: inline-block; color: rgb(0, 0, 0); font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">Home
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
    <span style="padding:5px 15px;display:inline-block;color:#000000;font-size:14px;" class="v-padding v-font-size hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 5px 15px; display: inline-block; color: rgb(0, 0, 0); font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">Page
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
    <span style="padding:5px 15px;display:inline-block;color:#000000;font-size:14px;" class="v-padding v-font-size hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 5px 15px; display: inline-block; color: rgb(0, 0, 0); font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">About Us
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
    <span style="padding:5px 15px;display:inline-block;color:#000000;font-size:14px;" class="v-padding v-font-size hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:5px 15px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 5px 15px; display: inline-block; color: rgb(0, 0, 0); font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">Contact Us
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  

<!--[if (mso)|(IE)]></tr></table><![endif]-->
</div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" class="v-col-border" style="background-color: #ffecdf;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffecdf;height: 100%;width: 100% !important;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
  
<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-1.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 600px;" width="600"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_heading_1" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:50px 10px 0px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 400;"><span data-metadata="&lt;!--(figmeta)eyJmaWxlS2V5IjoiTDVMdkRyeGJqUmJhOGtOalpYMnppQiIsInBhc3RlSUQiOjE2OTk1ODE3MjUsImRhdGFUeXBlIjoic2NlbmUifQo=(/figmeta)--&gt;" style="line-height: 33.6px;"></span><span data-buffer="&lt;!--(figma)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(/figma)--&gt;" style="line-height: 33.6px;"></span><strong>Thank You For Your Purchase</strong></h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_1" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 50px 10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <div class="v-text-align v-line-height v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;"><span data-metadata="&lt;!--(figmeta)eyJmaWxlS2V5IjoiTDVMdkRyeGJqUmJhOGtOalpYMnppQiIsInBhc3RlSUQiOjM2NDI5MDQyMywiZGF0YVR5cGUiOiJzY2VuZSJ9Cg==(/figmeta)--&gt;" style="line-height: 19.6px;"></span><span data-buffer="&lt;!--(figma)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(/figma)--&gt;" style="line-height: 19.6px;"></span>Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.<br />When an unknown printer took a galley of type and scrambled. Lorem Ipsum is simply dummy text of the printing and type setting industry.<br /><br />Lorem Ipsum been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="46" class="v-col-border" style="background-color: #df3135;width: 46px;padding: 0px;border-top: 0px solid transparent;border-left: 175px solid #ffecdf;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div id="u_column_4" class="u-col u-col-37p17" style="max-width: 320px;min-width: 223.02px;display: table-cell;vertical-align: top;">
  <div style="background-color: #df3135;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 175px solid #ffecdf;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_heading_3" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 17px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; line-height: 140%; text-align: right; word-wrap: break-word; font-size: 22px; font-weight: 400;">1</h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="50" class="v-col-border" style="background-color: #eb8330;width: 50px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div id="u_column_6" class="u-col u-col-8p83" style="max-width: 320px;min-width: 52.98px;display: table-cell;vertical-align: top;">
  <div style="background-color: #eb8330;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;">2</h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="52" class="v-col-border" style="background-color: #fbd33b;width: 52px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div id="u_column_7" class="u-col u-col-9" style="max-width: 320px;min-width: 54px;display: table-cell;vertical-align: top;">
  <div style="background-color: #fbd33b;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;">3</h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="49" class="v-col-border" style="background-color: #d5e539;width: 49px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div id="u_column_8" class="u-col u-col-8p5" style="max-width: 320px;min-width: 51px;display: table-cell;vertical-align: top;">
  <div style="background-color: #d5e539;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 2px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;">4</h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="44" class="v-col-border" style="background-color: #4dba25;width: 44px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 175px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div id="u_column_9" class="u-col u-col-36p5" style="max-width: 320px;min-width: 219px;display: table-cell;vertical-align: top;">
  <div style="background-color: #4dba25;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 175px solid #ffecdf;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_heading_2" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 10px 16px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-line-height v-font-size" style="margin: 0px; line-height: 140%; text-align: left; word-wrap: break-word; font-size: 22px; font-weight: 400;">5</h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" class="v-col-border" style="background-color: #ffecdf;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffecdf;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_divider_2" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <table role="presentation" height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #ffecdf;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="560" class="v-col-border" style="background-color: #f3e0d2;width: 560px;padding: 0px;border-top: 0px solid transparent;border-left: 20px solid #ffecdf;border-right: 20px solid #ffecdf;border-bottom: 30px solid #ffecdf;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div id="u_column_12" class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #f3e0d2;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 20px solid #ffecdf;border-right: 20px solid #ffecdf;border-bottom: 30px solid #ffecdf;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_text_2" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:20px 20px 90px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <div class="v-text-align v-line-height v-font-size" style="font-size: 14px; color: #d4bbaa; line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;">This is a new Text block. Change the text.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" class="v-col-border" style="background-color: #ffecdf;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffecdf;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_button_1" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 50px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->
<div class="v-text-align" align="center">
  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://unlayer.com" style="height:37px; v-text-anchor:middle; width:174px;" arcsize="11%"  stroke="f" fillcolor="#ff2d5a"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
    <a href="https://unlayer.com" target="_blank" class="v-button v-size-width v-font-size" style="box-sizing: border-box; display: inline-block; text-decoration: none; -moz-text-size-adjust: none; text-align: center; color: rgb(255, 255, 255); background: rgb(255, 45, 90); border-radius: 4px; width: 30%; max-width: 100%; word-break: break-word; overflow-wrap: break-word; font-size: 14px; line-height: inherit;"><span class="v-line-height v-padding" style="display:block;padding:10px 20px;line-height:120%;"><strong><span style="line-height: 16.8px;">Send Feedback</span></strong></span>
    </a>
    <!--[if mso]></center></v:roundrect><![endif]-->
</div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" class="v-col-border" style="background-color: #ff2d5a;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ff2d5a;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div class="v-col-border" style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_social_1" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:60px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
        
<div align="center" style="direction: ltr;">
  <div style="display: table; max-width:167px;">
  <!--[if (mso)|(IE)]><table role="presentation" width="167" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:167px;"><tr><![endif]-->
  
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.facebook.com/unlayer" title="Facebook" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-2.png" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://twitter.com/unlayerapp" title="Twitter" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-3.png" alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.linkedin.com/company/unlayer/mycompany/" title="LinkedIn" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-4.png" alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.instagram.com/unlayer_official/" title="Instagram" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-5.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    
    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
  </div>
</div>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_3" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 100px 30px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <div class="v-text-align v-line-height v-font-size" style="font-size: 14px; color: #ffffff; line-height: 170%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 170%; margin: 0px;">UNSUBSCRIBE   |   PRIVACY POLICY   |   WEB</p>
<p style="font-size: 14px; line-height: 170%; margin: 0px;"></p>
<p style="font-size: 14px; line-height: 170%; margin: 0px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <table role="presentation" height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
    </td>
  </tr>
  </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
  <!--[if IE]></div><![endif]-->
</body>

</html>

`;

