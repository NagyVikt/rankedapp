// components/previews/footers.ts
export const footersPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) Inner footer panel (70% width, centered) -->
  <div
    class="relative flex aspect-video w-[70%] translate-y-6
           items-center justify-center overflow-hidden
           rounded-md bg-[#0F0F10] p-4 shadow-sm"
  >
    <div class="flex w-full items-start gap-6">
      <!-- Left column: dot + two grey lines -->
      <div class="flex flex-col items-start gap-2">
        <div
          class="h-3 w-3 rounded-full
                 bg-[#25AEBA]
                 shadow-[0px_0px_8px_3px_rgba(37,174,186,0.2)]"
        ></div>
        <div class="h-2 w-[60%] rounded-sm bg-slate-600"></div>
        <div class="h-2 w-[40%] rounded-sm bg-slate-600"></div>
      </div>

      <!-- Right column: teal header bar + two grey lines -->
      <div class="flex flex-col items-start gap-2 flex-1">
        <div
          class="h-3 w-[30%] rounded-sm
                 bg-[#25AEBA]
                 shadow-[0px_0px_8px_3px_rgba(37,174,186,0.2)]"
        ></div>
        <div class="h-2 w-[80%] rounded-sm bg-slate-600"></div>
        <div class="h-2 w-[60%] rounded-sm bg-slate-600"></div>
      </div>
    </div>
  </div>
`;

export const footersIconSvg = `
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

export const footersSnippetHtml = `
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

        
            .u-row .u-col-33p33 {
              width: 199.98px !important;
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
          

table, td { color: #000000; } @media (max-width: 480px) { #u_content_heading_7 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_heading_7 .v-text-align { text-align: center !important; } #u_content_menu_2 .v-padding { padding: 0px 9px 12px !important; } #u_content_heading_3 .v-container-padding-padding { padding: 40px 10px 0px !important; } #u_content_heading_3 .v-font-size { font-size: 27px !important; } #u_content_button_1 .v-size-width { width: 65% !important; } #u_content_text_2 .v-container-padding-padding { padding: 10px !important; } #u_content_heading_4 .v-container-padding-padding { padding: 20px 10px 0px !important; } #u_content_heading_5 .v-container-padding-padding { padding: 0px 10px 15px !important; } #u_content_heading_5 .v-font-size { font-size: 27px !important; } #u_content_image_15 .v-src-width { width: 77% !important; } #u_content_image_15 .v-src-max-width { max-width: 77% !important; } #u_content_text_9 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_image_14 .v-src-width { width: 77% !important; } #u_content_image_14 .v-src-max-width { max-width: 77% !important; } #u_content_text_10 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_image_16 .v-src-width { width: 77% !important; } #u_content_image_16 .v-src-max-width { max-width: 77% !important; } #u_content_text_6 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_image_10 .v-src-width { width: 77% !important; } #u_content_image_10 .v-src-max-width { max-width: 77% !important; } #u_content_text_8 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_image_12 .v-src-width { width: 77% !important; } #u_content_image_12 .v-src-max-width { max-width: 77% !important; } #u_content_text_7 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_image_13 .v-src-width { width: 77% !important; } #u_content_image_13 .v-src-max-width { max-width: 77% !important; } #u_content_text_4 .v-container-padding-padding { padding: 5px 10px 40px !important; } #u_content_social_2 .v-container-padding-padding { padding: 30px 10px 10px !important; } #u_content_text_13 .v-container-padding-padding { padding: 30px 10px !important; } }
    </style>
  
  

<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Playfair+Display:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f6f4f4;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table role="presentation" id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f6f4f4;width:100%" cellpadding="0" cellspacing="0">
  <tbody>
  <tr style="vertical-align: top">
    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
    <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f6f4f4;"><![endif]-->
    
  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffe1e1;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_heading_7" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:20px 0px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-font-size" style="margin: 0px; color: #000000; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;"><span>[Your Logo]</span></h1>
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
      
<!--[if (mso)|(IE)]><td align="center" width="598" style="background-color: #ffe1e1;width: 598px;padding: 0px;border-top: 1px solid #000000;border-left: 1px solid #000000;border-right: 1px solid #000000;border-bottom: 1px solid #000000;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 1px solid #000000;border-left: 1px solid #000000;border-right: 1px solid #000000;border-bottom: 1px solid #000000;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_menu_2" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Raleway',sans-serif;" align="left">
        
<div class="menu" style="text-align:center;">
<!--[if (mso)|(IE)]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr><![endif]-->

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">Home
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
    <span style="padding:10px 20px;display:inline-block;color:#000000;font-family:'Montserrat',sans-serif;font-size:14px;" class="v-padding v-font-size hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">Page
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
    <span style="padding:10px 20px;display:inline-block;color:#000000;font-family:'Montserrat',sans-serif;font-size:14px;" class="v-padding v-font-size hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">About Us
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
    <span style="padding:10px 20px;display:inline-block;color:#000000;font-family:'Montserrat',sans-serif;font-size:14px;" class="v-padding v-font-size hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding v-font-size">Contact Us
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
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffe1e1;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_heading_3" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:60px 10px 0px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-font-size" style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-family: 'Playfair Display',serif; font-size: 35px; font-weight: 400;"><span><span><span><span><span><span><span><strong>The Color of Dreams</strong></span></span></span></span></span></span></span></h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;">A surprise gift is always brilliant. </p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_button_1" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->
<div class="v-text-align" align="center">
  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://unlayer.com" style="height:37px; v-text-anchor:middle; width:154px;" arcsize="11%"  stroke="f" fillcolor="#c36768"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
    <a href="https://unlayer.com" target="_blank" class="v-button v-size-width v-font-size" style="box-sizing: border-box; display: inline-block; text-decoration: none; -moz-text-size-adjust: none; text-align: center; color: rgb(255, 255, 255); background: rgb(195, 103, 104); border-radius: 4px; width: auto; max-width: 100%; word-break: break-word; overflow-wrap: break-word; font-size: 14px; line-height: inherit;"><span class="v-padding" style="display:block;padding:10px 20px;line-height:120%;"><span style="line-height: 16.8px;">Shop Gifts for Her</span></span>
    </a>
    <!--[if mso]></center></v:roundrect><![endif]-->
</div>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_2" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 80px 0px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-family: 'Open Sans',sans-serif; font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;">Please order by Monday 12<sup>th </sup>February 24, 3:00P.M EST for delivery by Valentine's day with complimentary shipping</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-1.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 600px;" width="600" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px 0px 10px;font-family:'Raleway',sans-serif;" align="left">
        
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
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffe1e1;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffe1e1;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffe1e1;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
  
<table id="u_content_heading_4" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 0px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-font-size" style="margin: 0px; line-height: 110%; text-align: center; word-wrap: break-word; font-family: Alex Brush; font-size: 24px; font-weight: 400;"><span><span><span><span style="line-height: 26.4px;"><span style="line-height: 26.4px;"><span style="line-height: 26.4px;"><span style="line-height: 26.4px;">Valentin's Day </span></span></span></span></span></span></span></h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_heading_5" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 30px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align v-font-size" style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-family: 'Playfair Display',serif; font-size: 35px; font-weight: 400;"><span><span><strong>Gift Ideas for Her</strong></span></span></h1>
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
  


  
  
    <!--[if gte mso 9]>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;min-width: 320px;max-width: 600px;">
        <tr>
          <td background="https://cdn.templates.unlayer.com/assets/1704286284012-Orange%20and%20Pink%20Colorful%20Gradient%20Valentine's%20Day%20Gift%20Guide%20Instagram%20Post.png" valign="top" width="100%">
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 600px;">
        <v:fill type="frame" src="https://cdn.templates.unlayer.com/assets/1704286284012-Orange%20and%20Pink%20Colorful%20Gradient%20Valentine's%20Day%20Gift%20Guide%20Instagram%20Post.png" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
      <![endif]-->
  
<div class="u-row-container" style="padding: 0px;background-image: url('images/image-14.png');background-repeat: no-repeat;background-position: center center;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('images/image-14.png');background-repeat: no-repeat;background-position: center center;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="200" style="background-color: #ffe1e1;width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_15" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-2.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 190px;" width="190" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_9" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <div><span data-canva-clipboard="ewAiAGEAIgA6ADUALAAiAGgAIgA6ACIAdwB3AHcALgBjAGEAbgB2AGEALgBjAG8AbQAiACwAIgBjACIAOgAiAEQAQQBGADQAMAB5AHIAbwBOAHgAWQAiACwAIgBpACIAOgAiAEQASQBqAHkAeQBjAEQAVgBtADIAdQBnAEEAcQBaAE0ASgBEAGcAcgBwAGcAIgAsACIAYgAiADoAMQA3ADAANAA0ADMAMgA0ADcANgAyADkAMwAsACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAWwB7ACIAQQAiADoAMQAyADMAMgAuADEANAAwADQANgA5ADUAMQAxADIAOAA0ACwAIgBCACIAOgA5ADQAMwAuADcAMQA0ADcANQA1ADMAOAA0ADcAMwAzADMALAAiAEQAIgA6ADMAMgAyAC4ANgA1ADEAMgA3ADIAMwA1ADUAOQAwADIANQAsACIAQwAiADoANAAzAC4AMwAzADMAMwAzADMAMwAzADMAMwAzADMAMwAzADYALAAiAE4AIgA6ACIAaABlAGEAZABpAG4AZwAiACwAIgBBAD8AIgA6ACIASwAiACwAIgBhACIAOgB7ACIAQQAiADoAWwB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAIgBIAGEAbgBkAG0AYQBkAGUAIABQAHIAYQBsAGkAbgBlAHMAXABuACIAfQBdACwAIgBCACIAOgBbAHsAIgBBAD8AIgA6ACIAQQAiACwAIgBBACIAOgB7ACIAdABlAHgAdAAtAGEAbABpAGcAbgAiADoAewAiAEIAIgA6ACIAYwBlAG4AdABlAHIAIgB9ACwAIgBjAG8AbABvAHIAIgA6AHsAIgBCACIAOgAiACMANAA0ADAANwAyADYAIgB9ACwAIgBsAGUAYQBkAGkAbgBnACIAOgB7ACIAQgAiADoAIgAxADIAMAAwAC4AMAAiAH0ALAAiAGYAbwBuAHQALQBzAGkAegBlACIAOgB7ACIAQgAiADoAIgAzADMALgAzADMAMwAxACIAfQAsACIAZgBvAG4AdAAtAGYAYQBtAGkAbAB5ACIAOgB7ACIAQgAiADoAIgBZAEEARgBkAEoAcQBYADkAOQA2AG8ALAAwACIAfQB9AH0ALAB7ACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAMQA3AH0ALAB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAewAiAGYAbwBuAHQALQBzAHQAeQBsAGUAIgA6AHsAIgBCACIAOgAiAGkAdABhAGwAaQBjACIAfQAsACIAdAByAGEAYwBrAGkAbgBnACIAOgB7ACIAQgAiADoAIgAwAC4AMAAiAH0AfQB9ACwAewAiAEEAPwAiADoAIgBCACIALAAiAEEAIgA6ADEAfQAsAHsAIgBBAD8AIgA6ACIAQQAiACwAIgBBACIAOgB7ACIAdAByAGEAYwBrAGkAbgBnACIAOgB7ACIAQQAiADoAIgAwAC4AMAAiAH0ALAAiAGMAbwBsAG8AcgAiADoAewAiAEEAIgA6ACIAIwA0ADQAMAA3ADIANgAiAH0ALAAiAGYAbwBuAHQALQBmAGEAbQBpAGwAeQAiADoAewAiAEEAIgA6ACIAWQBBAEYAZABKAHEAWAA5ADkANgBvACwAMAAiAH0ALAAiAGYAbwBuAHQALQBzAGkAegBlACIAOgB7ACIAQQAiADoAIgAzADMALgAzADMAMwAxACIAfQAsACIAbABlAGEAZABpAG4AZwAiADoAewAiAEEAIgA6ACIAMQAyADAAMAAuADAAIgB9ACwAIgB0AGUAeAB0AC0AYQBsAGkAZwBuACIAOgB7ACIAQQAiADoAIgBjAGUAbgB0AGUAcgAiAH0ALAAiAGYAbwBuAHQALQBzAHQAeQBsAGUAIgA6AHsAIgBBACIAOgAiAGkAdABhAGwAaQBjACIAfQB9AH0AXQB9ACwAIgBiACIAOgB7AH0ALAAiAGQAIgA6ACIAQQAiACwAIgBlACIAOgAyADkAMAAuADMAOAA2ADEANAA1ADEAMgAwADMAMQAyADIALAAiAGYAIgA6ADMAOQAsACIAZwAiADoAdAByAHUAZQAsACIAaAAiADoAIgBBACIAfQBdACwAIgBCACIAOgAxADUAMAAwACwAIgBDACIAOgAxADUAMAAwAH0A" style="line-height: 19.6px;"></span>
<p style="line-height: 140%; margin: 0px;">Handmade Pralines</p>
</div>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="200" style="background-color: #ffe1e1;width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_14" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-3.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 190px;" width="190" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_10" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <div><span data-canva-clipboard="ewAiAGEAIgA6ADUALAAiAGgAIgA6ACIAdwB3AHcALgBjAGEAbgB2AGEALgBjAG8AbQAiACwAIgBjACIAOgAiAEQAQQBGADQAMAB5AHIAbwBOAHgAWQAiACwAIgBpACIAOgAiAEQASQBqAHkAeQBjAEQAVgBtADIAdQBnAEEAcQBaAE0ASgBEAGcAcgBwAGcAIgAsACIAYgAiADoAMQA3ADAANAA0ADMAMgA0ADcANgAyADkAMwAsACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAWwB7ACIAQQAiADoANwA5ADEALgA5ADEAOAAyADQANwAyADgAOQAwADYAMgA0ACwAIgBCACIAOgA1ADgAOAAuADUAOQAwADkAMQA1ADMAMgA5ADcANgA4ADkALAAiAEQAIgA6ADMAMgAyAC4ANgA1ADEAMgA3ADIAMwA1ADUAOQAwADIANQAsACIAQwAiADoANAAzAC4AMwAzADMAMwAzADMAMwAzADMAMwAzADMAMwAzADYALAAiAE4AIgA6ACIAaABlAGEAZABpAG4AZwAiACwAIgBBAD8AIgA6ACIASwAiACwAIgBhACIAOgB7ACIAQQAiADoAWwB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAIgBSAGUAZAAgAEwAaQBwAHMAdABpAGMAawBcAG4AIgB9AF0ALAAiAEIAIgA6AFsAewAiAEEAPwAiADoAIgBBACIALAAiAEEAIgA6AHsAIgB0AGUAeAB0AC0AYQBsAGkAZwBuACIAOgB7ACIAQgAiADoAIgBjAGUAbgB0AGUAcgAiAH0ALAAiAGMAbwBsAG8AcgAiADoAewAiAEIAIgA6ACIAIwA0ADQAMAA3ADIANgAiAH0ALAAiAGwAZQBhAGQAaQBuAGcAIgA6AHsAIgBCACIAOgAiADEAMgAwADAALgAwACIAfQAsACIAZgBvAG4AdAAtAHMAaQB6AGUAIgA6AHsAIgBCACIAOgAiADMAMwAuADMAMwAzADEAIgB9ACwAIgBmAG8AbgB0AC0AZgBhAG0AaQBsAHkAIgA6AHsAIgBCACIAOgAiAFkAQQBGAGQASgBxAFgAOQA5ADYAbwAsADAAIgB9AH0AfQAsAHsAIgBBAD8AIgA6ACIAQgAiACwAIgBBACIAOgAxADIAfQAsAHsAIgBBAD8AIgA6ACIAQQAiACwAIgBBACIAOgB7ACIAZgBvAG4AdAAtAHMAdAB5AGwAZQAiADoAewAiAEIAIgA6ACIAaQB0AGEAbABpAGMAIgB9ACwAIgB0AHIAYQBjAGsAaQBuAGcAIgA6AHsAIgBCACIAOgAiADAALgAwACIAfQB9AH0ALAB7ACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAMQB9ACwAewAiAEEAPwAiADoAIgBBACIALAAiAEEAIgA6AHsAIgB0AHIAYQBjAGsAaQBuAGcAIgA6AHsAIgBBACIAOgAiADAALgAwACIAfQAsACIAYwBvAGwAbwByACIAOgB7ACIAQQAiADoAIgAjADQANAAwADcAMgA2ACIAfQAsACIAZgBvAG4AdAAtAGYAYQBtAGkAbAB5ACIAOgB7ACIAQQAiADoAIgBZAEEARgBkAEoAcQBYADkAOQA2AG8ALAAwACIAfQAsACIAZgBvAG4AdAAtAHMAaQB6AGUAIgA6AHsAIgBBACIAOgAiADMAMwAuADMAMwAzADEAIgB9ACwAIgBsAGUAYQBkAGkAbgBnACIAOgB7ACIAQQAiADoAIgAxADIAMAAwAC4AMAAiAH0ALAAiAHQAZQB4AHQALQBhAGwAaQBnAG4AIgA6AHsAIgBBACIAOgAiAGMAZQBuAHQAZQByACIAfQAsACIAZgBvAG4AdAAtAHMAdAB5AGwAZQAiADoAewAiAEEAIgA6ACIAaQB0AGEAbABpAGMAIgB9AH0AfQBdAH0ALAAiAGIAIgA6AHsAfQAsACIAZAAiADoAIgBBACIALAAiAGUAIgA6ADIAOQAwAC4AMwA4ADYAMQA0ADUAMQAyADAAMwAxADIAMgAsACIAZgAiADoAMwA5ACwAIgBnACIAOgB0AHIAdQBlACwAIgBoACIAOgAiAEEAIgB9AF0ALAAiAEIAIgA6ADEANQAwADAALAAiAEMAIgA6ADEANQAwADAAfQA=" style="line-height: 19.6px;"></span>
<p style="line-height: 140%; margin: 0px;">Red Lipstick</p>
</div>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="200" style="background-color: #ffe1e1;width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_16" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-4.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 190px;" width="190" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_6" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 30px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <div><span data-canva-clipboard="ewAiAGEAIgA6ADUALAAiAGgAIgA6ACIAdwB3AHcALgBjAGEAbgB2AGEALgBjAG8AbQAiACwAIgBjACIAOgAiAEQAQQBGADQAMAB5AHIAbwBOAHgAWQAiACwAIgBpACIAOgAiAEQASQBqAHkAeQBjAEQAVgBtADIAdQBnAEEAcQBaAE0ASgBEAGcAcgBwAGcAIgAsACIAYgAiADoAMQA3ADAANAA0ADMAMgA0ADcANgAyADkAMwAsACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAWwB7ACIAQQAiADoAMQAyADMAMgAuADEANAAwADQANgA5ADUAMQAxADIAOAA0ACwAIgBCACIAOgAyADMAMwAuADYAMwAzADkANwAyADIANQA5ADMANgA0ADcAMwAsACIARAAiADoAMwAyADIALgA2ADUAMQAyADcAMgAzADUANQA5ADAAMgA1ACwAIgBDACIAOgA0ADMALgAzADMAMwAzADMAMwAzADMAMwAzADMAMwAzADMANgAsACIATgAiADoAIgBoAGUAYQBkAGkAbgBnACIALAAiAEEAPwAiADoAIgBLACIALAAiAGEAIgA6AHsAIgBBACIAOgBbAHsAIgBBAD8AIgA6ACIAQQAiACwAIgBBACIAOgAiAFMAaQBnAG4AYQB0AHUAcgBlACAAUwBjAGUAbgB0AFwAbgAiAH0AXQAsACIAQgAiADoAWwB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAewAiAHQAZQB4AHQALQBhAGwAaQBnAG4AIgA6AHsAIgBCACIAOgAiAGMAZQBuAHQAZQByACIAfQAsACIAYwBvAGwAbwByACIAOgB7ACIAQgAiADoAIgAjADQANAAwADcAMgA2ACIAfQAsACIAbABlAGEAZABpAG4AZwAiADoAewAiAEIAIgA6ACIAMQAyADAAMAAuADAAIgB9ACwAIgBmAG8AbgB0AC0AcwBpAHoAZQAiADoAewAiAEIAIgA6ACIAMwAzAC4AMwAzADMAMQAiAH0ALAAiAGYAbwBuAHQALQBmAGEAbQBpAGwAeQAiADoAewAiAEIAIgA6ACIAWQBBAEYAZABKAHEAWAA5ADkANgBvACwAMAAiAH0AfQB9ACwAewAiAEEAPwAiADoAIgBCACIALAAiAEEAIgA6ADEANQB9ACwAewAiAEEAPwAiADoAIgBBACIALAAiAEEAIgA6AHsAIgBmAG8AbgB0AC0AcwB0AHkAbABlACIAOgB7ACIAQgAiADoAIgBpAHQAYQBsAGkAYwAiAH0ALAAiAHQAcgBhAGMAawBpAG4AZwAiADoAewAiAEIAIgA6ACIAMAAuADAAIgB9AH0AfQAsAHsAIgBBAD8AIgA6ACIAQgAiACwAIgBBACIAOgAxAH0ALAB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAewAiAHQAcgBhAGMAawBpAG4AZwAiADoAewAiAEEAIgA6ACIAMAAuADAAIgB9ACwAIgBjAG8AbABvAHIAIgA6AHsAIgBBACIAOgAiACMANAA0ADAANwAyADYAIgB9ACwAIgBmAG8AbgB0AC0AZgBhAG0AaQBsAHkAIgA6AHsAIgBBACIAOgAiAFkAQQBGAGQASgBxAFgAOQA5ADYAbwAsADAAIgB9ACwAIgBmAG8AbgB0AC0AcwBpAHoAZQAiADoAewAiAEEAIgA6ACIAMwAzAC4AMwAzADMAMQAiAH0ALAAiAGwAZQBhAGQAaQBuAGcAIgA6AHsAIgBBACIAOgAiADEAMgAwADAALgAwACIAfQAsACIAdABlAHgAdAAtAGEAbABpAGcAbgAiADoAewAiAEEAIgA6ACIAYwBlAG4AdABlAHIAIgB9ACwAIgBmAG8AbgB0AC0AcwB0AHkAbABlACIAOgB7ACIAQQAiADoAIgBpAHQAYQBsAGkAYwAiAH0AfQB9AF0AfQAsACIAYgAiADoAewB9ACwAIgBkACIAOgAiAEEAIgAsACIAZQAiADoAMgA5ADAALgAzADgANgAxADQANQAxADIAMAAzADEAMgAyACwAIgBmACIAOgAzADkALAAiAGcAIgA6AHQAcgB1AGUALAAiAGgAIgA6ACIAQQAiAH0AXQAsACIAQgAiADoAMQA1ADAAMAAsACIAQwAiADoAMQA1ADAAMAB9AA==" style="line-height: 19.6px;"></span>
<p style="line-height: 140%; margin: 0px;">Signature Scent</p>
</div>
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
  
    <!--[if gte mso 9]>
      </v:textbox></v:rect>
    </td>
    </tr>
    </table>
    <![endif]-->
    


  
  
    <!--[if gte mso 9]>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;min-width: 320px;max-width: 600px;">
        <tr>
          <td background="https://cdn.templates.unlayer.com/assets/1704286284012-Orange%20and%20Pink%20Colorful%20Gradient%20Valentine's%20Day%20Gift%20Guide%20Instagram%20Post.png" valign="top" width="100%">
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 600px;">
        <v:fill type="frame" src="https://cdn.templates.unlayer.com/assets/1704286284012-Orange%20and%20Pink%20Colorful%20Gradient%20Valentine's%20Day%20Gift%20Guide%20Instagram%20Post.png" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
      <![endif]-->
  
<div class="u-row-container" style="padding: 0px;background-image: url('images/image-14.png');background-repeat: no-repeat;background-position: center center;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('images/image-14.png');background-repeat: no-repeat;background-position: center center;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="200" style="background-color: #ffe1e1;width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_10" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 5px 0px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-5.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 190px;" width="190" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_8" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;">Elegant Earrings</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="200" style="background-color: #ffe1e1;width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_12" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 5px 0px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-6.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 190px;" width="190" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_7" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <div><span data-canva-clipboard="ewAiAGEAIgA6ADUALAAiAGgAIgA6ACIAdwB3AHcALgBjAGEAbgB2AGEALgBjAG8AbQAiACwAIgBjACIAOgAiAEQAQQBGADQAMAB5AHIAbwBOAHgAWQAiACwAIgBpACIAOgAiAEQASQBqAHkAeQBjAEQAVgBtADIAdQBnAEEAcQBaAE0ASgBEAGcAcgBwAGcAIgAsACIAYgAiADoAMQA3ADAANAA0ADMAMgA0ADcANgAyADkAMwAsACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAWwB7ACIAQQAiADoANwA5ADEALgA5ADEAOAAyADQANwAyADgAOQAwADYAMgA0ACwAIgBCACIAOgA5ADQAMwAuADcAMQA0ADcANQA1ADMAOAA0ADcAMwAzADMALAAiAEQAIgA6ADMAMgAyAC4ANgA1ADEAMgA3ADIAMwA1ADUAOQAwADIANQAsACIAQwAiADoANAAzAC4AMwAzADMAMwAzADMAMwAzADMAMwAzADMAMwAzADYALAAiAE4AIgA6ACIAaABlAGEAZABpAG4AZwAiACwAIgBBAD8AIgA6ACIASwAiACwAIgBhACIAOgB7ACIAQQAiADoAWwB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAIgBOAGUAdwAgAFMAbQBhAHIAdAB3AGEAdABjAGgAXABuACIAfQBdACwAIgBCACIAOgBbAHsAIgBBAD8AIgA6ACIAQQAiACwAIgBBACIAOgB7ACIAdABlAHgAdAAtAGEAbABpAGcAbgAiADoAewAiAEIAIgA6ACIAYwBlAG4AdABlAHIAIgB9ACwAIgBjAG8AbABvAHIAIgA6AHsAIgBCACIAOgAiACMANAA0ADAANwAyADYAIgB9ACwAIgBsAGUAYQBkAGkAbgBnACIAOgB7ACIAQgAiADoAIgAxADIAMAAwAC4AMAAiAH0ALAAiAGYAbwBuAHQALQBzAGkAegBlACIAOgB7ACIAQgAiADoAIgAzADMALgAzADMAMwAxACIAfQAsACIAZgBvAG4AdAAtAGYAYQBtAGkAbAB5ACIAOgB7ACIAQgAiADoAIgBZAEEARgBkAEoAcQBYADkAOQA2AG8ALAAwACIAfQB9AH0ALAB7ACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAMQA0AH0ALAB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAewAiAGYAbwBuAHQALQBzAHQAeQBsAGUAIgA6AHsAIgBCACIAOgAiAGkAdABhAGwAaQBjACIAfQAsACIAdAByAGEAYwBrAGkAbgBnACIAOgB7ACIAQgAiADoAIgAwAC4AMAAiAH0AfQB9ACwAewAiAEEAPwAiADoAIgBCACIALAAiAEEAIgA6ADEAfQAsAHsAIgBBAD8AIgA6ACIAQQAiACwAIgBBACIAOgB7ACIAdAByAGEAYwBrAGkAbgBnACIAOgB7ACIAQQAiADoAIgAwAC4AMAAiAH0ALAAiAGMAbwBsAG8AcgAiADoAewAiAEEAIgA6ACIAIwA0ADQAMAA3ADIANgAiAH0ALAAiAGYAbwBuAHQALQBmAGEAbQBpAGwAeQAiADoAewAiAEEAIgA6ACIAWQBBAEYAZABKAHEAWAA5ADkANgBvACwAMAAiAH0ALAAiAGYAbwBuAHQALQBzAGkAegBlACIAOgB7ACIAQQAiADoAIgAzADMALgAzADMAMwAxACIAfQAsACIAbABlAGEAZABpAG4AZwAiADoAewAiAEEAIgA6ACIAMQAyADAAMAAuADAAIgB9ACwAIgB0AGUAeAB0AC0AYQBsAGkAZwBuACIAOgB7ACIAQQAiADoAIgBjAGUAbgB0AGUAcgAiAH0ALAAiAGYAbwBuAHQALQBzAHQAeQBsAGUAIgA6AHsAIgBBACIAOgAiAGkAdABhAGwAaQBjACIAfQB9AH0AXQB9ACwAIgBiACIAOgB7AH0ALAAiAGQAIgA6ACIAQQAiACwAIgBlACIAOgAyADkAMAAuADMAOAA2ADEANAA1ADEAMgAwADMAMQAyADIALAAiAGYAIgA6ADMAOQAsACIAZwAiADoAdAByAHUAZQAsACIAaAAiADoAIgBBACIAfQBdACwAIgBCACIAOgAxADUAMAAwACwAIgBDACIAOgAxADUAMAAwAH0A" style="line-height: 19.6px;"></span>
<p style="line-height: 140%; margin: 0px;">New Smartwatch</p>
</div>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="200" style="background-color: #ffe1e1;width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_13" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 5px 0px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-7.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 190px;" width="190" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_4" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 60px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <div><span data-canva-clipboard="ewAiAGEAIgA6ADUALAAiAGgAIgA6ACIAdwB3AHcALgBjAGEAbgB2AGEALgBjAG8AbQAiACwAIgBjACIAOgAiAEQAQQBGADQAMAB5AHIAbwBOAHgAWQAiACwAIgBpACIAOgAiAEQASQBqAHkAeQBjAEQAVgBtADIAdQBnAEEAcQBaAE0ASgBEAGcAcgBwAGcAIgAsACIAYgAiADoAMQA3ADAANAA0ADMAMgA0ADcANgAyADkAMwAsACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAWwB7ACIAQQAiADoAMQAyADMAMgAuADEANAAwADQANgA5ADUAMQAxADIAOAA0ACwAIgBCACIAOgA1ADgAOAAuADUAOQAwADkAMQA1ADMAMgA5ADcANgA4ADkALAAiAEQAIgA6ADMAMgAyAC4ANgA1ADEAMgA3ADIAMwA1ADUAOQAwADIANQAsACIAQwAiADoANAAzAC4AMwAzADMAMwAzADMAMwAzADMAMwAzADMAMwAzADYALAAiAE4AIgA6ACIAaABlAGEAZABpAG4AZwAiACwAIgBBAD8AIgA6ACIASwAiACwAIgBhACIAOgB7ACIAQQAiADoAWwB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAIgBEAGUAcwBpAGcAbgBlAHIAIABIAGEAbgBkAGIAYQBnAFwAbgAiAH0AXQAsACIAQgAiADoAWwB7ACIAQQA/ACIAOgAiAEEAIgAsACIAQQAiADoAewAiAHQAZQB4AHQALQBhAGwAaQBnAG4AIgA6AHsAIgBCACIAOgAiAGMAZQBuAHQAZQByACIAfQAsACIAYwBvAGwAbwByACIAOgB7ACIAQgAiADoAIgAjADQANAAwADcAMgA2ACIAfQAsACIAbABlAGEAZABpAG4AZwAiADoAewAiAEIAIgA6ACIAMQAyADAAMAAuADAAIgB9ACwAIgBmAG8AbgB0AC0AcwBpAHoAZQAiADoAewAiAEIAIgA6ACIAMwAzAC4AMwAzADMAMQAiAH0ALAAiAGYAbwBuAHQALQBmAGEAbQBpAGwAeQAiADoAewAiAEIAIgA6ACIAWQBBAEYAZABKAHEAWAA5ADkANgBvACwAMAAiAH0AfQB9ACwAewAiAEEAPwAiADoAIgBCACIALAAiAEEAIgA6ADEANgB9ACwAewAiAEEAPwAiADoAIgBBACIALAAiAEEAIgA6AHsAIgB0AHIAYQBjAGsAaQBuAGcAIgA6AHsAIgBCACIAOgAiADAALgAwACIAfQB9AH0ALAB7ACIAQQA/ACIAOgAiAEIAIgAsACIAQQAiADoAMQB9ACwAewAiAEEAPwAiADoAIgBBACIALAAiAEEAIgA6AHsAIgB0AGUAeAB0AC0AYQBsAGkAZwBuACIAOgB7ACIAQQAiADoAIgBjAGUAbgB0AGUAcgAiAH0ALAAiAGwAZQBhAGQAaQBuAGcAIgA6AHsAIgBBACIAOgAiADEAMgAwADAALgAwACIAfQAsACIAYwBvAGwAbwByACIAOgB7ACIAQQAiADoAIgAjADQANAAwADcAMgA2ACIAfQAsACIAdAByAGEAYwBrAGkAbgBnACIAOgB7ACIAQQAiADoAIgAwAC4AMAAiAH0ALAAiAGYAbwBuAHQALQBmAGEAbQBpAGwAeQAiADoAewAiAEEAIgA6ACIAWQBBAEYAZABKAHEAWAA5ADkANgBvACwAMAAiAH0ALAAiAGYAbwBuAHQALQBzAGkAegBlACIAOgB7ACIAQQAiADoAIgAzADMALgAzADMAMwAxACIAfQB9AH0AXQB9ACwAIgBiACIAOgB7AH0ALAAiAGQAIgA6ACIAQQAiACwAIgBlACIAOgAyADkAMAAuADMAOAA2ADEANAA1ADEAMgAwADMAMQAyADIALAAiAGYAIgA6ADMAOQAsACIAZwAiADoAdAByAHUAZQAsACIAaAAiADoAIgBBACIAfQBdACwAIgBCACIAOgAxADUAMAAwACwAIgBDACIAOgAxADUAMAAwAH0A" style="line-height: 19.6px;"></span>
<p style="line-height: 140%; margin: 0px;">Designer Handbag</p>
</div>
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
  
    <!--[if gte mso 9]>
      </v:textbox></v:rect>
    </td>
    </tr>
    </table>
    <![endif]-->
    


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #c36768;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #c36768;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_social_2" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
<div align="center" style="direction: ltr;">
  <div style="display: table; max-width:281px;">
  <!--[if (mso)|(IE)]><table role="presentation" width="281" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:281px;"><tr><![endif]-->
  
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.facebook.com/unlayer" title="Facebook" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-8.png" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.linkedin.com/company/unlayer/mycompany/" title="LinkedIn" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-9.png" alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.instagram.com/unlayer_official/" title="Instagram" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-10.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://hu.pinterest.com/unlayer/" title="Pinterest" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-11.png" alt="Pinterest" title="Pinterest" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.youtube.com/@unlayer574" title="YouTube" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-12.png" alt="YouTube" title="YouTube" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://twitter.com/unlayerapp" title="X" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-13.png" alt="X" title="X" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
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

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 30px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%; margin: 0px;">email@website.com </p>
<p style="font-size: 14px; line-height: 140%; margin: 0px;">+12 458 4658</p>
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
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffe1e1;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #ffe1e1;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_text_13" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:30px 60px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align v-font-size" style="font-size: 14px; color: #000000; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%; margin: 0px;"><span style="text-decoration: underline; font-size: 14px; line-height: 19.6px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore. </span></p>
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

